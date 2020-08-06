const {Client,validate}=require('../../models/Client')
const bcrypt=require('bcryptjs')
const {transporter}=require('../../middlewares/mail')
const {pswdReset}=require('../../models/resetPassword')



module.exports={

    Signup:async (req,res)=>{
        const {body} = req;
        const data={
            first_name:body.first_name,
            last_name:body.last_name,
            dob:new Date(body.dob),
            country:body.country,
            address:body.address,
            weight:body.weight,
            height:body.height,
            gender:body.gender,
            password:body.password,
            email:body.email,
            city:body.city
        }

        const { error } = validate(data)
        const existingClient=await Client.findOne({email:data.email})  
        if ( error )
        {
            res
            .status(400)
            .send(error.details[0])
        }
        
    
        else if(existingClient){
            res.status(400).send({path:['email'],message:"User already exists."})
        }
    
    
    
        else{
    
        let client = new Client({...data})
    
        
    
        let salt=await bcrypt.genSalt(10)
        client.password= await bcrypt.hash(body.password,salt)
        
        const token=client.generateAuthToken(client);
        client.verify_token=token;
        await client.save()
        transporter.sendMail({
            to:client.email,
            from:"ranaahmad200358@gmail.com",
            subject:"Signup Successfully",
            html:`
                <div>
                    <h1>Click on this to verify the password.</h1>
                    <a href=${`localhost:5000/verify/${token}`}>localhost:5000/verify/${token}</a>
                
                </div>
            `
        })
        .then((res)=>{
            console.log(res)
        })
        .catch(err=>{
            console.log(err)
        })
        res.status(200).send({token})
        }
    
    },
    /*
        @Account Verification.
    
    */
    VerifyCode : async (req,res)=>{
    
            let {opt,email}=req.body

            let valid = await pswdReset.findOneAndDelete({verification_code:opt,email})
            if(valid){


                res.send({success:true})
            }

            else{


                res.status(404).send("Not Found")
            }




        },

        /*
           @Forgot Password
        */

    ForgotPassword:async (req,res)=>{

        const {body}=req;  
        const client = await Client.findOne({email:body.email})
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
    },


    ResetPassword:async (req,res)=>{

        const {email,password }=req.body;
        const client = await Client.findOne({email})
        if(!client){
            res.status(400).send("Invalid..")
        }
       
      
         else {
       
          
                let salt=await bcrypt.genSalt(10)
                client.password= await bcrypt.hash(password,salt)
                res.send(await client.save())
    

        }

    },


    Login:async (req,res)=>{
        const {email,password}=req.body;
        const client = await Client.findOne({email:email})
        if(!client)
        {
            res.status(404).send({msg:"Invalid Email or Password"})
        }
        else 
        {
            const verifyPassword= await bcrypt.compare(password,client.password)
            if(verifyPassword)
                {
                   
                    const token= client.generateAuthToken(client)
                    res.status(200).send({token,me:client})
                }
            else
                {
                    res.status(404).send({msg:"Invalid Email or Password."})
                }
        }

    },


    Me:async(req,res)=>{

        if(req.client){
            let client =await Client.findById(req.client._id)
            res.send(client)
        }

        else{

            res.status(401).send({message:"Unauthorized..."})
        }

    },

    UpdateAccount:async(req,res)=>{

        if(req.client){
            let {dob,first_name,last_name,password ,height,weight,email,address,city,country,gender}=req.body

            client= await Client.findById(req.client._id)

            
                let {error}= validate({first_name,last_name,gender,password,email
                    
                    ,height,weight
                    ,address,city,country,gender})
               if(error)
                res.status(400).send(error.details[0]);
            else{

                client.first_name=first_name
                client.last_name=last_name
                client.height=height
                client.weight=weight
                client.address=address
                client.city=city
                client.country=country
                client.dob=dob
                await client.save()

                res.send({message:"Successfully Updated."})
            }


        }

        else
            res.status(401).send({message:"Unauthorized..."})




    },

    ChangePassword:async(req,res)=>{

        if(req.client){

            let {password,new_password}=req.body
            client = await Client.findById(req.client._id)
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



    }



        





}