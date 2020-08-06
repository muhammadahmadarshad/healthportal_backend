const mongoose=require('mongoose')
const joi= require('joi')
const moment = require('moment')
const dietPlan= new mongoose.Schema({
    title:{type:String,required:true},
    owner_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'client',
        required:true
    },
    items:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'diet_plan_item'
        }
    ],
    duration:{
            type:Number,
            required:true,
    },

    created_by:{type:mongoose.Schema.Types.ObjectId,ref:'nutritionist'},

    start_date:{type:Date,required:true},
    end_date:{type:Date,required:true}
},{timestamps:true})

dietPlan.index({end_date:1},{expiresAfterSeconds:0})





exports.diet_plan_validate=(diet_plan)=>{
 const end_date= moment()
  end_date.days(60)
  end_date.hours(00)
  end_date.minutes(00)
  end_date.seconds(00)
const Schema=joi.object({
    title:joi.string().required(),
    owner_id:joi.string().required(),
    start_date:joi.date().required().greater(Date.now()).less(end_date.toDate()),
    duration:joi.number().required().positive().greater(0).max(60).min(7),
   
},{timestamps:true})
return(Schema.validate(diet_plan))
}




exports.DietPlan=mongoose.model('diet_plan',dietPlan)