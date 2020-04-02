const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
        trim :true,
    },
    password :{
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value){
            if(value.includes('password')){
                throw new Error('password should not contain "password" ')
            }
        }
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age : {
        type :Number
    },
    avatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})
//hiding private data
//gets called whenever a user object is returned in response becuase it first strigify the object then sends it
userSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({ _id : this._id.toString() }, process.env.JWT_TOKEN)

    this.tokens = this.tokens.concat({token})
    await this.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("invalid user!")
    }

    const pwdMatch = await bcryptjs.compare(password,user.password)
    if(!pwdMatch){
        throw new Error("invalid user! ")
    }

    return user
}

//for hashing text password before saving
userSchema.pre('save',async function(next){
    //this refers to the user object
    if(this.isModified('password')){
    const bcryptjs = require('bcryptjs')
        this.password = await bcryptjs.hash(this.password,8)
    }

    next()
})

//for deleting all task assosiated with user
userSchema.pre('remove',async function(next){
    //this refers to the user object
    await Task.deleteMany({owner: this._id})

    next()
})

const User = mongoose.model('users', userSchema)

module.exports = User