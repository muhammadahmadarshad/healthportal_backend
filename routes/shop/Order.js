const {Order} = require('../../models/Shop/Orders')
const {OrderItem} = require('../../models/Shop/OrderItem')
const Router= require('express').Router()
const {auth}= require('../../middlewares/auth')
const {Product}=require('../../models/Shop/Product')
const stripe= require('stripe')('sk_test_51GCZPDIOSIUmF3LmYaH0SsaqNFGLRj0kJl0D0bPqlibzHg0AFX9tXWsrIbUIOLOU8DIuJwwyISVa3bh2hZrYuZml00GdSDa91l')
const Object_id= require('mongoose').Types.ObjectId
Router.post('/add_new_order',async(req,res)=>{

    let {
        first_name,
        last_name,
        email,
        shipping_address,
        billing_address,
        phone,
        country,
        city,
        postal_code,
        products,
        token,
        paymentType,
        total
    }=req.body
    products=[]

   result= await OrderItem.insertMany(req.body.products)

    result.forEach(element => {
        products.push(element._id)  
    });
    order = new Order({
        first_name,
        last_name,
        email,
        products,
        paymentType,
        shipping_address,
        billing_address,
        phone,
        country,
        city,
        postal_code,
        total,token
    })

    if(paymentType==='Paid by Card'){
        try{

            const customer= await stripe.customers.create({
                email,
                source:token.id
            })
           const charge= await stripe.charges.create(
                {
                  amount: total * 100,
                  currency: "usd",
                  customer: customer.id,
                  description: `Purchased`,
                  receipt_email:email
                },{idempotency_key:order._id})

               await req.body.products.forEach(async p=>{

                  let product=  await Product.findById(p.product_id)
                    product.qty=product.qty-p.qty;
                    await product.save()


               }) 

                
            await order.save()


            res.send({success:'Successfully Ordered. Products will be delivered with in 7 days...\n If you have any query or problem contact us at +923246262625'})
        }

        catch(err){
            res.status(400).send({error:"Payment Failed"})
        }
    
    }
    else{
         
             await req.body.products.forEach(async p=>{

                let product=  await Product.findById(p.product_id)
                  product.qty=product.qty-p.qty;
    
                  await product.save()
             }) 


       

          
      await order.save()
      res.send({success:'Products will be delivered with in 7 days...\n If you have any query or problem contact us at +923246262625'})

    }
    


})





/* Get All Pending Orders */

Router.get('/get_all_pending_orders/:page',auth,async (req,res)=>{

    if(req.admin){



    const {page}=req.params
    const page_size=10;

    let total_results= await Order.find({status:"Pending"}).countDocuments()
    let orders= await Order.find({status:"Pending"}).skip((parseInt(page)-1)*page_size).limit(page_size)

    res.send({orders,total_results})
    }

    else {

        res.status(401).send('Access Denied.')
    }

})



Router.get('/get_all_complete_orders/:page',auth,async (req,res)=>{

    if(req.admin){
    const {page}=req.params
    const page_size=10;

    let total_results= await Order.find({status:"Dispatched"}).countDocuments()
    let orders= await Order.find({status:"Dispatched"}).skip((parseInt(page)-1)*page_size).limit(page_size)

    res.send({orders,total_results})
    }

    else {

        res.status(401).send('Access Denied.')
    }

})



Router.put('/order_update',auth,async(req,res)=>{

    if(req.admin){

        const {status,_id}=req.body;
        let order= await Order.findById(_id);
        order.status= status;
 
        await order.save()
        res.send({message:"Updated Successfully"})

    }

    else{

        res.status.send('Unauthorized..')

    }

})


Router.delete('/delete',auth,async (req,res)=>{
       if(req.admin){
        let {_id}=req.body

        let order= await Order.findByIdAndDelete(_id)
        
        order.products.forEach(async order_product=>{

            order_item= await OrderItem.findByIdAndDelete(order_product) 
            product= await Product.findById(order_item.product_id)
            product.qty= product.qty+order_item.qty
            await product.save()

        })


        res.send({msg:"Deleted Successfully..."})




       }

       else{
           res.status(401).send({msg:"Unauthorized.."})
       }
})


Router.get('/order-details/:id',auth,async (req,res)=>{
    
    if(req.admin){

        let order= await Order.findById(req.params.id).populate({path:'products',populate:{path:"product_id",select:"name qty -image price -brand -category"}})

        res.send(order)
    }

    else{

        res.status(401).send({msg:"Unauthorized..."})
    }

})


Router.get('/order-search/:id?',auth,async (req,res)=>{

    if(req.admin){
        try{
        order= await Order.findOne({_id:Object_id(req.params.id)})
        if(order){
        res.send(order)}

        else 
            res.status(404).send({msg:"Not Found"})
    }
    catch(err){
        res.status(404).send({msg:"Not Found"})
    }
}
    else {
        res.status(401).send({msg:"Unauthorized..."})
    }


})







module.exports=Router;
