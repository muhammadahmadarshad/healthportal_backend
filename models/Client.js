const mongoose=require("mongoose")
const jwt= require("jsonwebtoken")
const config=require("config")
const joi=require('joi')


/*
@Schema for Client
*/
const Client = new mongoose.Schema({
    
    first_name:{
        type:String,
        required:true
    },

    last_name:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    
    }
    ,

    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },

    dob:{
        type:Date,
        required:true
    },

    country:{
        type:String,
        required:true
    },

    address:{
        type:String,
        required:true
    },
    
    city:{type:String,required:true}
    ,

    height:{
        type:Number,
        required:true
    },

    weight:{
        type:Number,
        required:true
    },

    isVerified:{
        type:Boolean,
        default:false
    },
    account_type:{
        type:String,
        default:"client"
    },
    
    saved_food:[{type:mongoose.Schema.Types.ObjectId, ref:'food'}]
    
    ,

    diet_plan:{type:mongoose.Schema.Types.ObjectId,ref:'diet_plan'},

})

/* @ Generating Auth Token.*/
Client.methods.generateAuthToken=( {_id,account_type,first_name,last_name,email})=>{
    const token= jwt.sign({
        _id,email,first_name,last_name,email,account_type
    },config.get("jwtPrivateKey"))
    return token;
}
const validateClient=(client)=>{
    const Schema=joi.object({
        first_name : joi
            .string()
            .min(2)
            .max(25)
            .required(),

        last_name : joi
            .string()
            .min(2)
            .max(25)
            .required(),
          gender:  joi.string().required()
            
            ,

        email : joi
            .string()
            .email()
            .required(),
            dob:joi
            .date()
            .greater("1-1-1950")
            .less("1-1-2007"),

        password : joi
            .string()
            .required()
            .min(5),
            weight : joi
            .number()
            .required()
            .min(10)
            .max(150)
            .positive(),
        height : joi
            .number()
            .min(121)
            .max(220)
            .positive()
            .required(),
            country : joi
            .string()
            .required(),
            city:joi.string().required(),
        address : joi
            .string()
            .max(100)
            .min(5)
            .required(),

        

    })
    return Schema.validate(client)
}



exports.Client=mongoose.model("client",Client)


/*@ below code is for validation.*/

exports.validate=validateClient