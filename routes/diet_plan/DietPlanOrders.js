const router= require('express').Router()
let {DietPlanOrder,validateDietPlanOrder}=require('../../models/Diet_Plan/DietPlanOrder')
const { auth } = require('../../middlewares/auth')
const { Nutritionist } = require('../../models/Nutrionist/Nutritionist')
const stripe= require('stripe')('sk_test_51GCZPDIOSIUmF3LmYaH0SsaqNFGLRj0kJl0D0bPqlibzHg0AFX9tXWsrIbUIOLOU8DIuJwwyISVa3bh2hZrYuZml00GdSDa91l')

router.post('/make_new_order',auth,async(req,res)=>{

    
    let {client} =req;

    if(client){
        
        let {_id}=client
        let {purpose,description,token,nutri_id,phone}=req.body
        let nutritionist= await Nutritionist.findById(nutri_id)
        let Diet_Plan_Order= new DietPlanOrder({
            purpose,
            description,
            nutrtionist:nutritionist._id,
            order_by:_id,
            phone
        })
        if(token){
        try{
            const customer= await stripe.customers.create({
                email:client.email,
                source:token.id,
            })

            const charge= await stripe.charges.create(
                {
                  amount:parseInt(nutritionist.fee) * 100,
                  currency: "usd",
                  customer: customer.id,
                  description: `Purchased Diet Plan From  Name:${nutritionist.first_name} ${nutritionist.last_name}`,
                  receipt_email:req.client.email
                },{idempotencyKey:Diet_Plan_Order._id})

                Diet_Plan_Order.payment='Confirmed..'
        
                
           await  Diet_Plan_Order.save()
            nutritionist.balance+=nutritionist.fee;
            await nutritionist.save()
            res.send({success:true,msg:"Purchased Successfully"})
    }
    
    catch(err)
    {
        res.status(400).send({err})
    }
    }

    else {

        res.status(400).send({success:false,msg:"Kindly Pay First."})
    }


}


    else{

        res.status(401).send({success:false,msg:"Unauthorized"})
    }


})



router.get('/orders/:page',auth,async(req,res)=>{

    let {user}=req
   
    let page = parseInt(req.params.page)
    let page_size=12
    let total_results = await DietPlanOrder.find({nutrtionist:user._id,status:"Pending"}).countDocuments()
    let orders= await DietPlanOrder.find({nutrtionist:user._id,status:"Pending"}).populate('order_by').skip((page-1)*page_size).limit(page_size)
   
   
    if(orders.length>0){
        res.send({total_results,orders,})


    }

    else {

        res.status(404).send("Not Found")
    }
})


router.get('/order_details/:id',auth,async (req,res)=>{

    console.log(req.params.id)
        try{

        order= await DietPlanOrder.findOne({_id:req.params.id,nutrtionist:req.user._id}).populate('order_by')

        if(order){
            res.send(order)

        }
        else {

            res.status(404).send("Not Found")
        }


        }
        catch(err){


            res.status(404).send("Not Found")
        }



})

module.exports=router