const mongoose=require('mongoose')
const auto_populate= require('mongoose-autopopulate')
const mongoose_paginate= require('mongoose-paginate')
const Food= new mongoose.Schema({
    brand_name:{type:String,default:""},
    food_id:{type:String,default:"",unique:true},
    food_name:{type:String,default:""},
    food_type:{type:String,default:""},
    serving:{type:mongoose.Schema.Types.ObjectId,ref:'serving',autopopulate:true}
},{timestamps:true})

Food.plugin(mongoose_paginate)
Food.plugin(auto_populate)

exports.Food=new mongoose.model('food',Food)