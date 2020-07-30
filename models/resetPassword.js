const mongoose=require("mongoose")

const resetPass=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"client",
        unique:true
    },
    verification_code:{
        type:Number,
        required:true
    }
})

exports.pswdReset=mongoose.model('password',resetPass)