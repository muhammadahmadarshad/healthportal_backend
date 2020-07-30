const mongoose = require('mongoose')
const joi = require('joi')



const Education = new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },

    from: {
        type:Date,
        required:true,

    },

    to: {
        type:Date,
        required:true
    },

    type:{
        type:String,
        required:true
    },

    institute:{

        type:String,
        required:true
    },
    owner_id:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'}

})

exports.validateEducation=(education)=>{


const schema = joi.object({


    title:joi.string().required().min(4),

    from:joi.date().less((Date.now())).required(),

    to: joi.date().greater(education.from).less((Date.now())),

    type:joi.string().required().min(3),

    institute:joi.string().required().min(3)




})


return schema.validate(education)



}




exports.Education= mongoose.model('education',Education)