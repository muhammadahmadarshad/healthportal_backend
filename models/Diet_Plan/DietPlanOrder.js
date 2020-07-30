const mongoose= require('mongoose')

const joi =require('joi')
const { boolean } = require('joi')

let DietPlanOrder= new mongoose.Schema({

    
    purpose:{type:String,required:true},
    description:{type:String,required:true},
    payment:{

        type:String,
        default:"Pending"
    },
    phone:{type:String}
    ,

    nutrtionist:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'},
    order_by:{type:mongoose.Schema.Types.ObjectId,ref:'client'},
    status:{
    type:String,
    default:'Pending'
    }
},{timestamps:true})


exports.validateDietPlanOrder= (item)=>{

    let Schema= joi.object({

        purpose:joi.string().required(),
        description:joi.string().required()


    })

    return Schema.validate(item)

}

exports.DietPlanOrder= mongoose.model('diet_plan_order',DietPlanOrder)