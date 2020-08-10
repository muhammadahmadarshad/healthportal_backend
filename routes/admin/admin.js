const router = require('express').Router()
const bcrypt= require('bcryptjs')
const {AdminValidate,Admin} = require('../../models/Admin/Admin') 
const { pswdReset } = require('../../models/resetPassword')
const { transporter } = require('../../middlewares/mail')
const { auth } = require('../../middlewares/auth')
const moment = require('moment')
const { Order } = require('../../models/Shop/Orders')
const { DietPlanOrder } = require('../../models/Diet_Plan/DietPlanOrder')


router.post('/make_new_admin',async (req,res)=>{

    let {first_name,last_name,password,email} = req.body


    let {error} = AdminValidate({first_name,last_name,password,email})

    if(error){

        res.status(400).send(error.details[0])
    }
    else{
        let existed=await Admin.findOne({email})
        if(existed){
                res.status(400).send({path:['email'],message:'Email Already existed.'})

        }

        else{

            let admin = new Admin({first_name,last_name,email,password})
            let salt=await bcrypt.genSalt(10)
            admin.password= await bcrypt.hash(password,salt)
            await admin.save()
            const token= admin.generateToken(admin)
            res.send({token})
        }
    }
})




router.post('/login',async(req,res)=>{

    const {email,password}= req.body
    let admin = await Admin. findOne({email})

    if(admin){
    
        let valid= await bcrypt.compare(password,admin.password)
       if(valid){
           let token = admin.generateToken(admin)
           res.send({token})
       }

       else{
           res.status(404).send({message:"Invalid Email or password"})
       }
    }
    else{

        res.status(404).send({message:"Invalid Email or password"})
    }

})



router.post('/resetPassword',async (req,res)=>{

    const {email,password }=req.body;
    const client = await Admin.findOne({email})
    if(!client){
        res.status(400).send("Invalid..")
    }
   
  
     else {
   
      
            let salt=await bcrypt.genSalt(10)
            client.password= await bcrypt.hash(password,salt)
            res.send(await client.save())
    }

})


router.post('/forgotPassword', async (req,res)=>{

    const {body}=req;  
    const client = await Admin.findOne({email:body.email})
    console.log(client)
    if(client){
        const findPswd= await pswdReset.findOneAndRemove({email:client.email})
        const pswd= new pswdReset({
            email:client.email,
            verification_code:Math.floor(100000+Math.random()*9000)
        })
   await transporter.sendMail({
        to:client.email,
        from:"Health_portal.com",
        subject:"Password Reset Verification Code.",
        html:`<h1>${pswd.verification_code}</h1>`
    })


   

    const result =await pswd.save()
    //msg:"Check Your Email for Verification with in 5 mintues."
    res.send(result)
    }
    else{
        res.status(400).send("Invalid Email Address.")
    }
})

router.post('/verify_opt' ,async (req,res)=>{
    
    let {opt,email}=req.body

    let valid = await pswdReset.findOneAndDelete({verification_code:opt,email})
    if(valid){


        res.send({success:true})
    }

    else{


        res.status(404).send("Not Found")
    }




})


router.put('/change_password',auth,async(req,res)=>{

    if(req.admin){

        let {password,new_password}=req.body
        client = await Admin.findById(req.admin._id)
        let verify= await bcrypt.compare(password,client.password)
       
        
        if(verify){
            salt = await bcrypt.genSalt(10)
            client.password= await bcrypt.hash(new_password,salt)
            await client.save()

            res.send({msg:"Successfully Updated."})

        }
        else{

            res.status(400).send({msg:"Invalid Password"})
        }

    }

    else {

        res.status(401).send("UnAuthorized....")
    }



})


router.get('/producst_sales',auth,async(req,res)=>{

    let {admin}=req

    if(admin){

        let start_date= moment()
        start_date.subtract(30,'days')
        start_date.hours(00)
        start_date.minutes(00)
        start_date.seconds(00)
        let end_date= moment()
        end_date.subtract(30,'days')
        end_date.hours(23)
        end_date.minutes(59)
        end_date.seconds(59)
        
        sales=[]
        for (let i=0;i<31;i++){
        sale= await Order.aggregate(   [{

            $match:{

                $and:[{createdAt:{$gte:new Date(start_date.toISOString()),$lte:new Date(end_date.toISOString())}}]   
            }},

            {
                $group:{
                    _id:null,
                    totalSales:{$sum:"$total"}
                }
            },
            {$unwind:{path:"$group",preserveNullAndEmptyArrays:true}}
          ])
          
        sales.push({amount:sale.length>0?sale[0]['totalSales']:0,
            date:`${start_date.date()}/${start_date.month()+1}/${start_date.year()}`
        })
        
        start_date.add(1,'days')
        end_date.add(1,'days')
        }

          res.send(sales)

    }



})


router.get('/diet_sales',auth,async(req,res)=>{

    let {admin}=req

    if(admin){

        let start_date= moment()
        start_date.subtract(30,'days')
        start_date.hours(00)
        start_date.minutes(00)
        start_date.seconds(00)
        let end_date= moment()
        end_date.subtract(30,'days')
        end_date.hours(23)
        end_date.minutes(59)
        end_date.seconds(59)
        
        sales=[]
        for (let i=0;i<31;i++){
        sale= await DietPlanOrder.aggregate(   [{

            $match:{

                createdAt:{$gte:new Date(start_date.toISOString()),$lte:new Date(end_date.toISOString())}} 
            },
            {$lookup:{

                from:'nutritionists',
                localField:'nutrtionist',
                foreignField:'_id',
                as:'nutrtionist'
            }},
         
            {$unwind:{path:"$nutrtionist",preserveNullAndEmptyArrays:true}},
            {
                $group:{
                    _id:null,
                    totalSales:{$sum:"$nutrtionist.fee"}
                }
            },
            
          ])
          
        sales.push({amount:sale.length>0?sale[0]['totalSales']:0,
            date:`${start_date.date()}/${start_date.month()+1}/${start_date.year()}`
        })

        start_date.add(1,'days')
        end_date.add(1,'days')
        }

          res.send(sales)

    }



})

module.exports=router