const Task = require('../model/task')
const auth = require('../middleware/auth') 
const express = require('express')
const router = new express.Router()

router.post("/tasks",auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

//Get /tasks?completed=true&limit=2&skip=2
//Get /tasks?sortBy=createAt:desc
router.get("/tasks", auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === "true" || req.query.completed === "True"
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==="desc"? -1 : 1
    }
    try {
       // const tasks = await Task.find({owner:req.user._id})
       await req.user.populate({
           path:'tasks',
           match,
           options : {
            limit : parseInt(req.query.limit),
            skip : parseInt(req.query.skip),
            sort
           }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id
    try{
        //const task = await Task.findById(id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            //will get 404 error only if id given matches format i.e. if it contains 12 numbers 
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
   
})

router.patch("/tasks/:id",auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = [ "description" , "completed"]
    const isValid = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValid){
        return res.status(400).send({error:"invalid update!"})
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()

        //const task = await Task.findByIdAndUpdate(req.params.id , req.body, { new :true, runValidators : true})

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/tasks/:id",auth, async (req, res) =>{

    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports= router