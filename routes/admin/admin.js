const router = require('express').Router()
const bcrypt= require('bcryptjs')
const {AdminValidate,Admin} = require('../../models/Admin/Admin') 


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

module.exports=router