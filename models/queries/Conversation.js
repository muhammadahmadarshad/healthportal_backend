const mongoose= require('mongoose')


let Conversation= new mongoose.Schema({

    messages:[{type:mongoose.Schema.Types.ObjectId,ref:'queries'}],
    nutritionist:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'},
    client:{type:mongoose.Schema.Types.ObjectId,ref:'client'} 
},{timestamps:true})


exports.Conversation= mongoose.model('conversation',Conversation)