const mongoose=require('mongoose')
const auto_populate= require('mongoose-autopopulate')

const OrderItem=new mongoose.Schema({

    product_id:{type:mongoose.Schema.Types.ObjectId,ref:'Products', autopopulate: true},

    qty:{required:true,type:Number},
    amount:{type:Number,required:true},
})

OrderItem.plugin(auto_populate)


exports.OrderItem=new mongoose.model('orderItem',OrderItem)