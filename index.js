const express=require('express');
const mongoose=require('mongoose');
const app=express();
const config=require('config')
const client=require('./routes/client/Client')
const search=require('./routes/food/search')
const food=require('./routes/food/Food')
const nutritionist= require('./routes/nutrtionist/nutritionist')
const diet_plan= require('./routes/diet_plan/dietPlan')
const admin = require('./routes/admin/admin')
const product = require('./routes/shop/products')
const orders= require('./routes/shop/Order')
const queries= require('./routes/Messages/messages')
const dietPlanOrder=require('./routes/diet_plan/DietPlanOrders')
const cors=require('cors')

app.use(cors())

app.use(express.json())
app.use('/search',search)
app.use("/",client)
app.use('/query',queries)
app.use('/product',product)
app.use('/food',food)
app.use('/nutritionist',nutritionist)
app.use('/diet_plan',diet_plan)
app.use('/admin',admin)
app.use('/orders',orders)
app.use('/diet_plan_order',dietPlanOrder)


mongoose.connect(config.get("db"),
{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
})

.then(()=>{
    console.log("Database is connected.")
})
.catch((err)=>{
     throw Error(err)

})
const port=process.env.port || 5000;

app.listen(port,()=>{
    console.log(`server is listening at ${port}`)
})