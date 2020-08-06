const mongoose= require('mongoose')


let Queries= new mongoose.Schema({
    query:{type:String},
    author_id:{type:mongoose.Schema.Types.ObjectId,ref:'client'},
    response:{type:String,default:''},
    nutritionist:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'}
},{timestamps:true})

Queries.index({updatedAt: 1},{expireAfterSeconds:604800 })

exports.Queries= mongoose.model('queries',Queries)