const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    email:{
    type:String },
    password:{
        
        type:String},


        role:{
            type:String,
            enum:['admin','user']},
            status:{
                type:Boolean,
                default:true
            },
            name:{
                type:String
            },
            phonenumber:{
                type:Number,
            },
        })
        const login=mongoose.model('login',loginSchema);

        module.exports=login;