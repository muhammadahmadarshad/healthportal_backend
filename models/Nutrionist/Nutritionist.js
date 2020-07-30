const mongoose=require('mongoose')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const Nutritionist=new mongoose.Schema({


    first_name:{
        type:String, required:true
    },
    last_name:{
        type:String, required:true
    },
    fee:{type:Number,default:0},
    phone:{
        type:String
    },

    email:{
        type:String, required:true,unique:true
    },
    gender:{type:String}
    ,

    password:{
        type:String,required:true
    },


    blocked:{type:Boolean,default:false},

    diet_plan:[
        {
            type:mongoose.Schema.Types.ObjectId,ref:'diet_plan'
        }
    ],

    diet_plan_proposals:[
        {
            type:mongoose.Schema.Types.ObjectId, ref:'diet_plan_proposal'
        }
    ],

    specialities:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'specialities'
        }
    ],

    experience:[
        {
            type:mongoose.Schema.ObjectId,ref:'experience'
        }
        ],

    account_status:{type:String, default:'active'},

    education:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'education'
        }
    ],

    saved_food:[{type:mongoose.Schema.Types.ObjectId, ref:'food'}],
    balance:{type:Number,default:0},
    account_type:{
        type:String,
        default:'nutritionist'
    }

},{
    timestamps: true
  })


Nutritionist.methods.generateToken=(data)=>{
   const token=jwt.sign( data,config.get('jwtPrivateKey'))
    return token
}



exports.NutritionistValidate=(nutritionist)=>{

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


        return Schema.validate(nutritionist)



}




exports.Nutritionist=mongoose.model('nutritionist',Nutritionist)