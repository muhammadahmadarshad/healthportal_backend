const mongoose=require('mongoose')
const joi= require('joi')
const Schema= mongoose.Schema({

    name:{type:String,required:true},
    price:{type:Number,required:true},
    category:{type:String,required:true},
    qty:{type:Number,required:true},
    description:{type:String,required:true},
    image:{type:mongoose.Schema.Types.Mixed,required:true
    },
    facts:{type:String,required:true},
    brand:{type:String,required:true},
    featured:{type:Boolean,default:false}
},{timestamps:true})






exports.Product= mongoose.model('Products',Schema)
exports.validateProduct= (Product)=>{

const Schema=joi.object({


    name:joi.string().required().min(3).max(40),
    price:joi.number().positive().greater(0).required(),
    qty:joi.number().required().greater(0),
    category:joi.string().required(),
    brand:joi.string().required(),
    description:joi.string().required(),
    facts:joi.string().required(),
   
    
})

return Schema.validate(Product)

}