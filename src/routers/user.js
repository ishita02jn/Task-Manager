const User = require('../model/user')
const auth = require('../middleware/auth')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()


router.post("/users", async (req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
    
})

router.post("/users/login", async(req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send({ 'error' : 'invalid user!'})
    }
})

router.post("/users/logout", auth, async(req,res) => {
    try{
       req.user.tokens =  req.user.tokens.filter((token)=>{
           return token.token !== req.token
       })
       await req.user.save()
       res.send()
    }catch(e){
        res.status(500).send()
    }
})

//auth is the middleware function, the request will run only if next gets called inside auth
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
})

//to get image uploaded by user id
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

//profile upload
const upload = multer({
 //   dest : 'avatar',
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload an Image file!'))
        }
        cb(undefined, true)
    }
})

router.post("/users/me/avatar", auth, upload.single('avatar'), async (req, res) => {
    //we can access file only when dest key is not defined in multer
    const buffer = await sharp(req.file.buffer).png().resize({height:250, width:250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error : error.message})
})

router.get("/users", async (req, res) => {
    
    try{
        const users = await User.find({})
        res.send(users)
    }catch(e){
        res.status(500).send()
    }
})

router.get("/users/:id", async (req, res) => {
    const id = req.params.id
    try{
        const user = await User.findById(id)
        if (!user) {
            //will get 404 error only if id given matches format i.e. if it contains 12 numbers 
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send()
    }
})

router.patch("/users/me", auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = [ "name" , "password" , " age"]
    const isValid = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValid){
        return res.status(400).send({error:"invalid update!"})
    }

    try{
        //this is done to run the middleware of save
        //const user = await User.findById(req.user.id)
        const user = req.user
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save()

//      const user = await User.findByIdAndUpdate(req.params.id , req.body, { new :true, runValidators : true})
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/users/me", auth, async (req, res) =>{

    try{
        // const user = await User.findByIdAndDelete(req.user.id)
        // if(!user){
        //     res.status(404).send()
        // }
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete("/users/me/avatar", auth, async (req, res) =>{

    try{
        if(req.user.avatar){
            req.user.avatar = undefined
            await req.user.save()
        }
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})


module.exports = router