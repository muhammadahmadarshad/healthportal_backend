const mongoose = require('mongoose') 
const joi = require('joi')


const Speciality= new mongoose.Schema({


    category:{type:String, required:true},
    description: {type:String,required:true},
    owner_id:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'}  

})

exports.validateSpeciality = (speciality)=>{

    const schema= joi.object({

            category:joi.string().required(),
            description:joi.string().required(),

    })

    return schema.validate(speciality)

}

exports.Speciality= mongoose.model('specialities',Speciality)