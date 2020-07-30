const mongoose=require('mongoose')
const joi=require('joi')
const dietPlanItem=new mongoose.Schema({


    food:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'food',
        required:true
    },
    time_to_eat:{
        type:Date,
    },
    meal:{
        type:String,
        required:true,
    },
    taken:{
        type:Boolean,
        default:false
    },

    plan_id:{type:mongoose.Schema.Types.ObjectId,ref:'diet_plan'}
})

exports.DietPlanItem=mongoose.model('diet_plan_item',dietPlanItem)

exports.diet_plan_item_validate=(item,start_date,end_date)=>{
const Schema = joi.object({
    food:joi.string().required(),
    meal:joi.string().required().max(10).min(4),
    time_to_eat:joi.date().less(end_date).greater(start_date),
    plan_id:joi.string().required()
})

return Schema.validate(item)



}