const mongoose=require('mongoose')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const Admin=new mongoose.Schema({


    first_name:{
        type:String, required:true
    },
    last_name:{
        type:String, required:true
    },

    email:{
        type:String, required:true,unique:true
    },

    password:{
        type:String,required:true
    },
    
    account_type:{
        type:String,
        default:'admin'
    }

},{
    timestamps: true
  })


Admin.methods.generateToken=({first_name,last_name,email,account_type,_id})=>{
   const token=jwt.sign( {first_name,last_name,account_type,email,_id},config.get('jwtPrivateKey'))
    return token
}



exports.AdminValidate=(admin)=>{

        const Schema=joi.object({

            first_name:joi.string()
                        .max(15)
                        .min(2)
                        .required()
            ,

            last_name:joi.string()
                            .max(15)
                            .min(2)
                            .required()
            ,
            email:joi.string().email().required(),
            password:joi.string().min(5).alphanum()           
        })
        return Schema.validate(admin)

}




exports.Admin=mongoose.model('admin',Admin)