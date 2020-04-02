const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT 

//express middleware, to run something between new request and route handler

// app.use((req, res, next)=>{
//     if(req.method === "GET"){
//         res.send("GET requests are not allowed")
//     }
//     next()
// })
// app.use((req, res, next)=>{
//     res.status(503).send("Server is under maintenance")

// })

// const User = require('./model/user')
// const Task = require('./model/task')
// const main = async()=>{
//     const user = await User.findById("5e520ed728737718e42e1dc1")
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// main()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('server is up on port no ' + port)
})