const mongoose = require('mongoose')

const joi = require('joi')



const Experience = new mongoose.Schema({

    designation : {type: String,required:true},
    from :{type:Date, required:true},
    to :{type:Date,required:true},
    description:{type:String,default:"N/A"},
    company:{type:String,required:true},
    owner_id:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'}
})



exports.validateExperience=(exp)=>{
    const Schema = joi.object({
        designation:joi.string().required().min(3),
        from:joi.date().less(Date.now()).required(),
        to: joi.date().greater(exp.from).required(),
        company:joi.string().required().min(4),
        description:joi.string().min(10)
    })

    return  Schema.validate(exp)
}


exports.Experience= mongoose.model('experience',Experience)


