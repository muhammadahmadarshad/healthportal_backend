const mongoose=require('mongoose')

const Serving= new mongoose.Schema({

    calcium:{type:Number,default:""},
    calories:{type:Number,default:""},
    carbohydrate:{type:Number,default:""},
    cholesterol:{type:Number,default:""},
    fat:{type:Number,default:""},
    fiber:{type:Number,default:""},
    iron:{type:Number,default:""},
    measurement_description:{type:String,default:""},
    metric_serving_amount:{type:String,default:""},
    metric_serving_unit:{type:String,default:""},
    monounsaturated_fat:{type:Number,default:""},
    number_of_units:{type:Number,default:""},
    polyunsaturated_fat:{type:Number,default:""},
    potassium:{type:Number,default:""},
    protein:{type:Number,default:""},
    saturated_fat:{type:Number,default:""},
    serving_description:{type:String,default:""},
    serving_id:{type:String,default:"",unique:true},
    sodium:{type:Number,default:""},
    sugar:{type:Number,default:""},
    vitamin_a:{type:Number,default:""},
    vitamin_c:{type:Number,default:""}
})


exports.Serving= mongoose.model('serving',Serving)