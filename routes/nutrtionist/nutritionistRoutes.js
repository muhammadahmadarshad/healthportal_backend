const {NutritionistValidate,Nutritionist}=require('../../models/Nutrionist/Nutritionist')
const {Client} = require('../../models/Client')
const bcrypt = require('bcryptjs')
const {Education,validateEducation} =require('../../models/Nutrionist/Education')
const {Experience,validateExperience}= require('../../models/Nutrionist/Experience')
const {Speciality,validateSpeciality}=require('../../models/Nutrionist/Specialities')
const {transporter}=require('../../middlewares/mail')
const { pswdReset } = require('../../models/resetPassword')
const {DietPlan} = require('../../models/Diet_Plan/Diet_Plan')
const {DietPlanItem} = require('../../models/Diet_Plan/Diet_Plan_Item')
const moment = require('moment')

module.exports={

    signup:async (req,res)=>{

        const {firstname,lastname,email,password,gender}=req.body 
        const existed_person=await Nutritionist.findOne({email})
        const is_client=await Client.findOne({email})
        const {error}=NutritionistValidate({first_name:firstname,last_name:lastname,email,password})
        if(error){

            res.status(400).send({success:false,msg:error.details[0].message})
        }
        else if(existed_person){

            res.status(400).send({success:false,msg:"Already Exists."})
        }
        else if(is_client){

            res.status(400).send({success:false,msg:"Client Registered Account Cannot be a Nutritionist Account"})
        }
        else{

        const salt= await bcrypt.genSalt(12)
        const nutritionist= Nutritionist({
                first_name:firstname,last_name:lastname,email,password,gender
        })

        nutritionist.password=await bcrypt.hash(password,salt)

        await nutritionist.save()

       await transporter.sendMail({
            to:email,
            from:"ranaahmad200358@gmail.com",
            subject:"Your Account Created Successfully by Admin",
            html:`
                <div>
                    <h5>Email: ${email}, Password: ${password}</h1> 
                
                </div>`
        })

        res.status(200).send({success:true,msg:"Nutritionist Account Created Successfully"})

    }


    },

    login:async(req , res)=>{

        const {email, password}=req.body
   
        const is_client = await Nutritionist.findOne({email})

        if(!is_client){
            res.status(404).send({success:false,msg:"Invalid email or password"})
        }

        else if(is_client.blocked){
      
            res.status(400).send({success:false,msg:"Your Account has been blocked. Contact Admin."})
        }

        else{
            const verify_password= await bcrypt.compare(password,is_client.password)
            

            if(verify_password){
                  const  {_id,
                    account_type,
                    first_name,
                    last_name,
                    email
                    }=is_client
                res.status(200).send({token:is_client.generateToken({_id,
                    account_type,
                    first_name,
                    last_name,
                    email
                    })})

            }
            else{

                res.status(404).send({success:false,msg:"Invalid email or password"})
            }

        }


    },
    
    update_account:async (req,res)=>{

        console.log(req.body)
        let {user}=req

        if(user){


            let {first_name,last_name,fee,phone}=req.body

            nutritionist= await Nutritionist.findById(req.user._id)
            nutritionist.first_name =first_name;
            nutritionist.last_name=last_name
            nutritionist.fee=fee;
            nutritionist.phone=phone;

            await nutritionist.save()
            
            res.send({success:true,msg:"Updated"})
            
        
        }

        else{
            
            res.status(404).send({success:false,msg:"Not Found.."})
            

        }

    }
    
    ,
    ChangePassword:async(req,res)=>{

        if(req.user){

            let {password,new_password}=req.body
            client = await Nutritionist.findById(req.user._id)
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
    ,




    /* Add Education */

    addEducation:async (req,res)=>{
    const {to,from,title,type,institute}=req.body
    if(!to || !from || !title || !type || !institute){

        res.status(400).send({success:false,msg: "fields should not be empty."})
    }

    else{

    let nutritionist= await Nutritionist.findById(req.user._id)
    
    const {error}= validateEducation({to,from,title,type,institute})
    if(error){
        res.status(400).send({msg:error.details[0].message})
    }

    else{

        let existed= await Education.findOne({title,owner_id:req.user._id})

        if(existed){

            res.status(400).send({success:false ,msg:"Already Exists."})
        }
        else{

            let education = new Education({
                to,
                type,
                institute,
                from,
                title,
                owner_id:req.user._id
            })

            let result= await education.save()

            nutritionist.education.push(result._id)
            await nutritionist.save()
            res.status(200).send({success:true,msg:"Education Added."})
        }
    }
    }}

/* Delete Education */
,
deleteEducation:async(req,res)=>{

    const nutritionist = await Nutritionist.findById(req.user._id)
    const {id} = req.params
    nutritionist.education=nutritionist.education.filter(edu=>edu!=id)
    await nutritionist.save()
    await Education.deleteOne({_id:id})
    res.status(200).send({msg:"Deleted Successfully"})
    
},
/*get Education */
getEducation:async(req, res)=>{
    result=  await Nutritionist.findById(req.user._id,).select('education').populate('education')
    res.status(200).send(result)
},

updateEducation:async(req,res)=>{
  let  {
        to,
        type,
        institute,
        from,
        title,
    }=req.body

    let {id}= req.params


    let education =await Education.findOne({_id:id,owner_id:req.user._id})

  if(education){

     let {error}  =validateEducation({to,type,institute,from,title})

     if(error)
        {   
            res.status(400).send({success:false,msg:error.details[0].message})
        }

    else {

        education.to=to;
        education.from=from;
        education.type=type;
        education.institute=institute;
        education.title= title

        existed= await Education.findOne({owner_id:req.user._id,to,from,type,institute,title,})

        if(!existed)
        {
        await education.save()
        res.send({success:true,msg:"Successfully Updated"})
        }   
        else{
            res.status(400).send({success:false,msg:'Already Exist..'})
        }
    }

    


    }
    else

    res.status(400).send({success:false,msg:"does not exists."})
},


/*add experience*/
addExperience:async (req,res)=>{

    let {company,from , to , designation, description} = req.body

    if(!company || !from || !to || !designation)
    {   
        res.status(400).send({success:false,msg:"Required fields should not be empty.."})
    }
    else
        {

            let {error} = validateExperience({company,from, to ,designation,description})

            if(error)
                {
                    res.status(400).send({success:false,msg:error.details[0].message})
                }
            else {

                experience = new Experience({

                    company,to,from,designation,description,owner_id:req.user._id

                })

                experience_existed= await Experience.findOne({designation,to,company,description,from,owner_id:req.user._id})
            if(experience_existed){

                res.status(400).send({success:false,msg:"Already Added.."})
            }
            else{
            result= await experience.save()

            nutritionist =await Nutritionist.findOne({_id:req.user._id}).select('experience')
            nutritionist.experience.unshift(result._id)
            
            await nutritionist.save()

            res.send({success:true,msg:'Experience added successfully.'})
            }}
        }
},


/*Delete Experience*/

deleteExperience:async (req, res)=>{

    let {id} = req.params
    experience = await Experience.findByIdAndDelete(id)
    nutritionist = await Nutritionist.findById(req.user._id).select('experience')
    nutritionist.experience = nutritionist.experience.filter(ex=>ex!=id)
    await nutritionist.save()
    res.send(experience)
},


/*Update Experience*/

updateExperience:async (req,res)=>{

    const {company,from , to , designation, description} = req.body
    const {id} = req.params
    console.log( req.body)
    const belongs = await Experience.findOne({_id:id,owner_id:req.user._id})
    const {error} = validateExperience({company ,from ,to ,designation, description})
    if(!belongs){
        res.status(400).send({success:false,msg:"Bad request."})
    }

    else if(error)
    {
        res.status().send({success:false,msg:error.details[0].message})


    }
    else{
        experience = await Experience.findById(id)
        
        experience.company=company
        experience.from=from
        experience.to=to
        experience.description=description
        experience.designation=designation

        existed= await Experience.findOne({owner_id:req.user._id,designation,from,to,description,designation})
      
        if(existed){
            res.status(400).send({success:false,msg:"Already Existed.."})

        }
        else{
        await experience.save()
        res.status(200).send({success:true,msg:"Successfully updated."})
        }
    
    }

},

/*Add speciality */

addSpeciality:async(req, res)=>{

    let {category,description}= req.body
    console.log(req.body)
   let {error} = validateSpeciality({category,description:description})
   let nutritionist= await Nutritionist.findById(req.user._id).select('specialities')
   if(error){
        res.status(400).send({success:false,msg:error.details[0].message})
   }

   else{
        let matched= await  Speciality.findOne({owner_id:req.user._id,category})
        console.log(matched)
        if(!matched)
        {
           
            speciality =await new Speciality({description,category,owner_id:req.user._id}).save()
       
            nutritionist.specialities.unshift(speciality._id) 
            await nutritionist.save()

            res.status(200).send({success:true,msg: "Successfully added"})
        }
        else{

            res.status(400).send({success:false,msg:'Already Added.'})

        }

        
   }
},

/*Delete Speciality*/

deleteSpeciality:async(req,res)=>{

    const {id} = req.params
    let nutritionist =await Nutritionist.findById(req.user._id).select('specialities')
    nutritionist.specialities= nutritionist.specialities.filter(sp=>sp!=id)
    await nutritionist.save()
    res.send(await Speciality.findByIdAndDelete(id))

},

/*Update Speciality*/
updateSpeciality:async(req , res)=>{

    const {id} = req.params
    const {description,category} = req.body
    
  
    if(req.user){
        let speciality= await Speciality.findById(id)
        const {error} = validateSpeciality({description,category})
        if(error){

            res.status(400).send({success:false,msg:error.details[0].message})
        }

        else        
            {
                
                speciality.description=description;
                speciality.category=category
                existed= await Speciality.findOne({owner_id:req.user._id,category,description})
                if(!existed)
                {
                await speciality.save()                
                res.status(200).send({success:true,msg:"Updated Successfully."})
                }else
                res.status(400).send({success:false,msg:"Already Existed..."})
    
            }

}

else{

    res.status(401).send({success:false,msg:"Unauthorized"})
}


},

get_all:async (req,res)=>{

    let page= parseInt(req.params.page)
    let page_size=10;
    total_results= await Nutritionist.countDocuments()
    if(total_results>0){
    data = await Nutritionist.find().skip((page-1)*page_size).limit(page_size)    
    res.send({list:data,total_results})
    }

    else
        res.status(404).send('not found.')

}, 

block_account:async(req,res)=>{

    if(req.admin){
        
       let  {_id} = req.params;
       
       nutritionist= await Nutritionist.findById(_id)

       nutritionist.blocked=!nutritionist.blocked;

       await nutritionist.save()
       
       res.send("Success")

    }

    else{

        res.status(401).send('Unauthorized')
    }
    },

me:async (req,res)=>{

    if(req.user){

        let {_id}= req.user

        profile = await Nutritionist.findById(_id).populate('specialities').populate('experience').populate('education')
    
        res.send(profile)
    
    }
    else{
        console.log('hello')
        res.status(401).send('UnAuthorized....')
    }

    

}
,
find:async(req,res)=>{
    
    let nutritionists=await Speciality.find({category:req.body.query}).populate('owner_id')
    nutritionist=[]

    for (let i=0;i<nutritionists.length;i++){

        let count= await DietPlan.find({created_by:nutritionists[i]._id}).countDocuments()

        if(count<10){
            nutritionist.push(nutritionists[i])

        }



    }
    if(nutritionist.length!==0)
    {
        res.send(nutritionist)
    }
    else{
        res.status(404).send('Not Found')
    }

},


find_by_id:async (req,res)=>{
    try{
    let nutritionist= await Nutritionist.findById(req.params._id).populate('education').populate('experience').populate('specialities')
   
    if(nutritionist){

        res.send(nutritionist)
    }

    else {

        res.status(404).send("Not Found.")
    }}
    catch(err){
        res.status(404).send("Not Found.")
    }
},


ResetPassword:async (req,res)=>{

    const {email,password }=req.body;
    const client = await Nutritionist.findOne({email})
    if(!client){
        res.status(400).send("Invalid..")
    }
   
  
     else {
   
      
            let salt=await bcrypt.genSalt(10)
            client.password= await bcrypt.hash(password,salt)
            res.send(await client.save())
    }

},


ForgotPassword:async (req,res)=>{

    const {body}=req;  
    const client = await Nutritionist.findOne({email:body.email})
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
get_complete_report:async (req,res)=>{
    if(req.user){
        try{
        let {id}=req.params
       
        let diet_plan= await DietPlan.findOne({created_by:req.user._id,_id:id})
        if(diet_plan){
        let start_date=moment(diet_plan.start_date)
            start_date.hours(00).minutes(00)
            
        let end_date=moment(diet_plan.start_date)
            end_date.hours(23).minutes(59)
        
            let count_calories=[]
           
        for(let i=0;i<diet_plan.duration;i++){
        let count = await DietPlanItem.aggregate([
            {$match:
                {
                   $and:[{time_to_eat:{$gte:new Date(start_date.toISOString()),$lte: new Date(end_date.toISOString())}},{taken:true},{plan_id:diet_plan._id}]
                }},{
            $lookup:{ from: 'foods', localField: 'food', foreignField: '_id', as: 'food' }},
            {$unwind:{path:'$food',
            preserveNullAndEmptyArrays: true}},
            {$lookup:{
                    from:'servings',
                    localField:'food.serving',
                    foreignField:'_id',
                    as:'food.serving'
            }},
            {$unwind:{path:'$food.serving',
            preserveNullAndEmptyArrays: true}}, 
            {$group:{
                _id:null,
                protein:{$sum:'$food.serving.protein'},
                sugar:{$sum:'$food.serving.sugar'},
                calcium:{$sum:"$food.serving.calcium"},
                carbohydrate:{$sum:"$food.serving.carbohydrate"},
                vitamin_c:{$sum:"$food.serving.vitamin_c"},
                fat:{$sum:"$food.serving.fat"},
                calories:{$sum:"$food.serving.calories"}
                
            }} ,
            {$unwind:{path:'$group',
            preserveNullAndEmptyArrays: true}},      
        ])
        count_calories.push({...count[0],time:start_date.format('DD-MM-YYYY')})
        start_date.add(1,'day')
        end_date.add(1,'day')
        
    }

    start_date= moment()
    start_date.hours(00).minutes(00).seconds(00)
    end_date= moment()
    end_date.hours(23).minutes(59).seconds(59)

    count= await DietPlanItem.aggregate([
        {$match:
         {$and:[  
              {
                  time_to_eat:{$gte:new Date(start_date.toISOString()),$lte:new Date(end_date.toISOString())}
                },
                {
                   taken:true 
                }
         
        
        ]
        }
        }
        ,{$lookup:{

            from:'foods',
            localField:'food',
            foreignField:'_id',
            as:'food'
        }},
        {$unwind:{path:'$food',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'servings',
            localField:"food.serving",
            foreignField:"_id",
            as:'food.serving'
        }},
        {$unwind:{path:"$food.serving",preserveNullAndEmptyArrays:true}},

        {
            $group:{
                _id:'$meal',
                time_to_eat:{$first:'$time_to_eat'},
                protein:{$sum:"$food.serving.protein"},
                sugar:{$sum:'$food.serving.sugar'},
                calcium:{$sum:"$food.serving.calcium"},
                carbohydrate:{$sum:"$food.serving.carbohydrate"},
                vitamin_c:{$sum:"$food.serving.vitamin_c"},
                fat:{$sum:"$food.serving.fat"},
                calories:{$sum:"$food.serving.calories"},
                fiber:{$sum:'$food.serving.fiber'}
            }
        },{$sort:{_id:1}}
    ])   



    start_date=moment()
            start_date.hours(00).minutes(00)
            
            start_date.subtract(6,'day')
            
         end_date=moment()
            end_date.hours(23).minutes(59)
            end_date.subtract(6,'day')
            let week_report=[]
           
        for(let i=0;i<=6;i++){
        let count = await DietPlanItem.aggregate([
            {$match:
                {
                   $and:[{time_to_eat:{$gte:new Date(start_date.toISOString()),$lte: new Date(end_date.toISOString())}},{taken:true},{plan_id:diet_plan['_id']}]
                }},{
            $lookup:{ from: 'foods', localField: 'food', foreignField: '_id', as: 'food' }},
            {$unwind:{path:'$food',
            preserveNullAndEmptyArrays: true}},
            {$lookup:{
                    from:'servings',
                    localField:'food.serving',
                    foreignField:'_id',
                    as:'food.serving'
            }},
            {$unwind:{path:'$food.serving',
            preserveNullAndEmptyArrays: true}}, 
            {$group:{
                _id:null,
                protein:{$sum:'$food.serving.protein'},
                sugar:{$sum:'$food.serving.sugar'},
                calcium:{$sum:"$food.serving.calcium"},
                carbohydrate:{$sum:"$food.serving.carbohydrate"},
                vitamin_c:{$sum:"$food.serving.vitamin_c"},
                fat:{$sum:"$food.serving.fat"},
                calories:{$sum:"$food.serving.calories"}
                
            }} ,
            {$unwind:{path:'$group',
            preserveNullAndEmptyArrays: true}},      
        ])
        week_report.push({...count[0],time:start_date.calendar(null,{
            lastDay : '[Yesterday]',
            sameDay : '[Today]',
            nextDay : '[Tomorrow]',
            lastWeek : '[Last] dddd',
            nextWeek : 'dddd',
            sameElse : 'L'
        })})
        start_date.add(1,'day')
        end_date.add(1,'day')
        
    }
        res.send({plan_report:count_calories,daily_report:count,week_report})
    
}
else {
    res.status(404).send({msg:"Diet Plan Not Found.."})

}
    
    }
        catch(err){
            res.status(404).send({msg:"Diet Plan Not Found.."})
        }
    }

    else 
    res.status(404).send({msg:"Diet Plan Not Found.."})


}


















}