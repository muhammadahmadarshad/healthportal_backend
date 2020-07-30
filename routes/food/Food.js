const router = require ('express').Router()
const {Food}= require('../../models/foods/foods')
const {Serving}=require('../../models/foods/foodServing')
const {auth} =require('../../middlewares/auth')
const {Client} = require('../../models/Client')
const {Nutritionist} = require('../../models/Nutrionist/Nutritionist')

router.post('/add_to_favourite',auth,async (req,res)=>{
    const {

        brand_name,
        food_id,
        food_name,
        food_type,
        serving
        }=req.body

        console.log(req.client['_id'])
        if(req.client['_id']){
            const exists =await Client.findById(req.client._id).populate({path:'saved_food',match:{food_id},populate:{path:"serving",model:'serving'}}).select('saved_food')
            if(!exists.saved_food['length']){
                let client = await Client.findById(req.client._id).select('saved_food')
                let serv = await Serving.findOne({serving_id:serving.serving_id})
                let food = await Food.findOne({food_id:food_id})
               
                if(!serv){
                     serv = await new Serving(serving).save()
                }
                if(!food){
                     food = await new Food({brand_name,food_id,food_name,food_type,serving:serv._id}).save()
                }
                client.saved_food.unshift(food._id)  
                await client.save()
                res.send({msg:'Successfully Saved.'})
            }
            else{
                res.status(400).send({msg:"Already Saved"})
            }
        }

    else if(req['user']){

        console.log(req.user)
        const exists =await Nutritionist.findById(req.user._id).populate({path:'saved_food',match:{food_id},populate:{path:"serving",model:'serving'}}).select('saved_food')
        if(!exists.saved_food['length']){
            let nutri = await Nutritionist.findById(req.user._id).select('saved_food')
            let serv = await Serving.findOne({serving_id:serving.serving_id})
            let food = await Food.findOne({food_id:food_id})
           
            if(!serv){
                 serv = await new Serving(serving).save()
            }
            if(!food){
                 food = await new Food({brand_name,food_id,food_name,food_type,serving:serv._id}).save()
            }
            nutri.saved_food.unshift(food._id)  
            await nutri.save()
            res.send({msg:'Successfully Saved.'})
        }
        else{
            res.status(400).send({msg:"Already Saved"})
        }

    }

    })


router.delete('/delete_from_favourite',auth,async(req,res)=>{
    console.log(req.user)
    if(req.client._id){
    const {_id}=req.client
    const {food_id}=req.body
    const existed = await Client.findById(_id).populate({path:'saved_food',match:{food_id:food_id}})
    const deleted_food= await Food.findOne({food_id})
   
    if(deleted_food&&existed){
        const client = await Client.findById(_id).select('saved_food')
        client.saved_food=client.saved_food.filter(fd=>{
            return(fd!=deleted_food._id+"")
            })
        await client.save();
        res.send({msg:'Removed From Save..'})
    }
    else
    res.status(400).send({msg:'Bad Request.'})}

   else if(req.user._id){
        const {_id}=req.user
        const {food_id}=req.body
        const existed = await Nutritionist.findById(_id).populate({path:'saved_food',match:{food_id:food_id}})
        const deleted_food= await Food.findOne({food_id})
        console.log(existed,deleted_food)
        
        if(deleted_food&&existed){
            const nutri = await Nutritionist.findById(_id).select('saved_food')
            nutri.saved_food=nutri.saved_food.filter(fd=>{
                return(fd!=deleted_food._id+"")
                })
            await nutri.save();
            res.send({msg:'Removed From Save..'})
        }
        else
        res.status(400).send({msg:'Hello.'})}
    else 
        res.status(400).send({msg:"Hi"})
})


router.get('/get_favourite/:page',auth,async(req,res)=>{

    const page = parseInt(req.params.page)
    const page_size = 10 
    let total_results=0;
    if(req['client']['_id'
    ]){
        total_results=(await Client.findById(req.client._id)).saved_food.length
        const Foods= await Client.findById(req.client._id).populate({path:'saved_food',options: {
            sort:{food_name:1},
            skip:(page-1)*page_size,
            limit : page_size,
        
        }}).select('saved_food')
        
        res.status(200).send({Foods,total_results})
    } 
  
    else if(req['user']){
        total_results=(await Nutritionist.findById(req.user._id)).saved_food.length
        const Foods= await Nutritionist.findById(req.user._id).populate({path:'saved_food',options: {
            sort:{food_name:1},
            skip:(page-1)*page_size,
            limit : page_size,
        }}).select('saved_food')
        res.status(200).send({Foods,total_results})
    }
    else
        res.status(400).send({msg:"Bad Request"})
})


module.exports=router