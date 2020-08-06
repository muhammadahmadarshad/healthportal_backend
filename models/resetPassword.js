const mongoose=require("mongoose")

const resetPass=new mongoose.Schema({
    email:{type:String
    },
    verification_code:{
        type:Number,
        required:true
    }
},{timestamps:true})

resetPass.index({createdAt:1},{expires:50})

exports.pswdReset=mongoose.model('password',resetPass)