const mongoose = require('mongoose')



const OrderSchema = mongoose.Schema({

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orderItem' }],
    first_name:{type:String,required:true},
    last_name:{type:String,required:true},
    email:{type:String,required:true},
    shipping_address:{type:String,required:true},
    billing_address:{type:String,required:true},
    postal_code:{type:String,required:true},
    phone:{type:String,required:true},
    city:{type:String,required:true},
    status: { type: String, default: "Pending" },
    country:{type:String},
    paymentType: { type: String, required: true },
    total:{type:Number, required:true}

}, { timestamps: true })


const Order = new mongoose.model("Orders", OrderSchema)

exports.Order = Order