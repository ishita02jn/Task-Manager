const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true 
}).then(()=>{
    console.log("connected successfully!")
}).catch((error)=>{
    console.log("error connecting to database! " + error)
})


// const user1 = new users({
//     name : 'Ishi',
//     password : 'passwordjkd'
// })

// user1.save().then(()=>{
//     console.log(user1)
// }).catch((error)=>{
//     console.log('Error : '+ error)
// })

// const task1 = new tasks({
//     description : '  Working on mongoose '
// })

// task1.save().then(()=>{
//     console.log(task1)
// }).catch((error)=>{
//     console.log('Error : '+ error)
// })