const mongoose= require('mongoose')


let Queries= new mongoose.Schema({
    query:{type:String},
    conversation_id:{type:mongoose.Schema.Types.ObjectId,ref:'conversation'},
    author_id:{type:mongoose.Schema.Types.ObjectId,ref:'client'},
    response:{type:String,default:''}
},{timestamps:true})

exports.Queries= mongoose.model('queries',Queries)