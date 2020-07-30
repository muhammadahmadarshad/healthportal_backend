const {Client} = require('../../models/Client')
const {DietPlan,diet_plan_validate} = require('../../models/Diet_Plan/Diet_Plan')
const {DietPlanItem,diet_plan_item_validate} = require('../../models/Diet_Plan/Diet_Plan_Item')
const {Food} = require('../../models/foods/foods')
const {Serving} = require('../../models/foods/foodServing')
const moment = require('moment')
const { DietPlanOrder } = require('../../models/Diet_Plan/DietPlanOrder')
const {Nutritionist} =require('../../models/Nutrionist/Nutritionist')
const c = require('config')

module.exports = {
/*Make Diet Plan*/
    make_diet_plan:async(req,res)=>{
    const client = await Client.findById(req.client._id)
    const {title,duration,start_date}= req.body
 
    let data={
        title,
        start_date,
        duration,
        owner_id:req.client._id
    }
    if(client['diet_plan'])
    {
        res.status(400).send({message:"Already Exists"})
    }
    else{

        const {error}= diet_plan_validate(data);
        if(error){
            res.status(400).send(error.details[0])
        }

        else{
         diet_plan=await  new DietPlan(data).save()
         client.diet_plan=diet_plan._id
         await client.save()
         res.send(await DietPlan.findOne({owner_id:req.client._id}).populate({path:'items'}))
        }
    }
    },

/*Add Meal to Diet Plan*/
add_meal:async (req,res)=>{

    

    if(req.client._id){
    let owner_id= req.client._id
    let diet_plan= await DietPlan.findOne({owner_id})
    let {meal,time_to_eat,food}=req.body;
    let foodexisted = await Client.findById(owner_id).populate({path:'saved_food'}).select({'saved_food':1,"_id":0})
    

    if(foodexisted['saved_food'].length){
    if(diet_plan){
        if(!diet_plan.created_by){
        end_date = moment(diet_plan.start_date).days(diet_plan.duration)
        time_to_eat= moment(time_to_eat,"YYYY/MM/DD HH:mm").toDate()
    
        let {error} = diet_plan_item_validate({plan_id:diet_plan._id+"",meal,time_to_eat,food},diet_plan.start_date,end_date.toString())
        console.log(error)
        if(error)
        res.status(400).send(error.details[0])
        else{
            existed_item= await DietPlanItem.findOne({plan_id:diet_plan._id,time_to_eat,food})
            console.log(existed_item)
            if(!existed_item){
            diet_plan_item = await new DietPlanItem({plan_id:diet_plan._id,meal,time_to_eat,food}).save()
            diet_plan.items.push(diet_plan_item._id)
            await diet_plan.save();
            res.send({message:"Successfully Added in your Diet Plan."})
            }
            else if(existed_item){
                res.status(400).send({message:"Already Added in this slot."})
            }
            else
            res.status(400).send({message:"Not Found"})
    }}

    else {
        res.status(400).send({message:"You can not add in diet which is created by Nutritionist"})
    }
    }
    else if(!diet_plan) {
        res.status(400).send({"message":"You Dont have Diet Plan."})
    }}

    else {
        res.status(400).send({"message":"Food does not exist in your saved foods."})
    }}

    else if(req.user._id){

        

        let _id= req.user._id
        let {meal,time_to_eat,food,client}=req.body;

        if(!client){

            res.status(400).send({path:'client',message:"Please Select Client"})
            
        }
        else {


        let diet_plan= await DietPlan.findOne({owner_id:client,created_by:_id})
       
        let foodexisted = await Nutritionist.findById(_id).populate({path:'saved_food'}).select({'saved_food':1,"_id":0})
        
    
        if(foodexisted['saved_food'].length){
        if(diet_plan){
            end_date = moment(diet_plan.start_date).days(diet_plan.duration)
            time_to_eat= moment(time_to_eat,"YYYY/MM/DD HH:mm").toDate()
            
            let {error} = diet_plan_item_validate({plan_id:diet_plan._id+"",meal,time_to_eat,food},diet_plan.start_date,end_date.toString())
            if(error)
            res.status(400).send(error.details[0])
            else{
                existed_item= await DietPlanItem.findOne({plan_id:diet_plan._id,time_to_eat,food})
                if(!existed_item){
                diet_plan_item = await new DietPlanItem({plan_id:diet_plan._id,meal,time_to_eat,food}).save()
                diet_plan.items.push(diet_plan_item._id)
                await diet_plan.save();
                res.send({message:"Successfully Added in your Diet Plan."})
                }
                else if(existed_item){
                    res.status(400).send({message:"Already Added in this slot."})
                }
                else
                res.status(400).send({message:"Not Found"})
        }
        }
        else if(!diet_plan) {
            res.status(400).send({"message":"You Dont have Diet Plan."})
        }}
    
        else {
            res.status(400).send({"message":"Food does not exist in your saved foods."})
        }











    }


}

else {
    res.status(401).send("You dont have access.")
}
},



getDietPlan:async(req,res)=>{
const page=parseInt(req.params.page)
const page_size= 12
let total_results=0;
const {_id} =req.client
const date= moment()

date.hours(00).minutes(00).seconds(00)
let diet_plan= await DietPlan.findOne({owner_id:_id}).populate({path:'items',match:{time_to_eat:{$gte:date}}
,populate:'food'
,options:{sort:['time_to_eat']},skip:(page-1)*page_size,limit:page_size})
if(!diet_plan){
    res.status(404).send({message:"Diet Plan not Found."})
}
else
    {
        total_results=await DietPlanItem.countDocuments({plan_id:diet_plan._id}).where({time_to_eat:{$gt:date}})
        res.send({diet_plan,total_results})
    }
},




delete_meal:async (req,res)=>{

let {user,client}=req
if(client._id){
const {id}= req.params
const diet_plan = await DietPlan.findOne({owner_id:req.client._id})

if(!diet_plan.created_by)
{
const diet_plan_item= await DietPlanItem.deleteOne({_id:id})
diet_plan.items= diet_plan.items.filter(item=>item!=id)
await diet_plan.save()


res.send({message:"deleted successfuly"})
}
else{


    res.status(400).send('You can not delete Diet Plan Item')
}


}

else if(user._id){
console.log(req.body)
const {id}= req.params
const {client_id}=req.body
const diet_plan = await DietPlan.findOne({owner_id:client_id,created_by:user._id})
const diet_plan_item= await DietPlanItem.deleteOne({_id:id})
diet_plan.items= diet_plan.items.filter(item=>item!=id)
await diet_plan.save()


res.send({message:"deleted successfuly"})

}


else{

    res.status(401).send('Unauthourized.')
}
},



update_meal:async(req,res)=>{
if(req.client._id){  
let {time_to_eat,meal,taken,_id,food}=req.body
let diet_plan=await DietPlan.findOne({owner_id:req.client._id})
if(diet_plan){

let diet_plan_item = await DietPlanItem.findById(_id)
end_date = moment(diet_plan.start_date).add(diet_plan.duration,"days")
time_to_eat= moment(time_to_eat).toString()
const to_be_update= {time_to_eat,meal,plan_id:diet_plan._id.toString(),food}

let {error} = diet_plan_item_validate(to_be_update,diet_plan.start_date,end_date.toString())
if(error){

    res.status(400).send(error.details[0])
}

else{

    diet_plan_item= await DietPlanItem.findByIdAndUpdate({_id:_id},{time_to_eat,meal,taken,food})

    
    res.send(diet_plan_item)
}


}

else{

    res.status(400).send({message:"Diet Plan dont exists"})
}
}


else if(req.user._id)
{
let {time_to_eat,meal,taken,_id,food,client}=req.body
let diet_plan=await DietPlan.findOne({owner_id:client,created_by:req.user._id})
if(diet_plan){
let diet_plan_item = await DietPlanItem.findById(_id)
end_date = moment(diet_plan.start_date).add(diet_plan.duration,"days")
time_to_eat= moment(time_to_eat).toString()
const to_be_update= {time_to_eat,meal,plan_id:diet_plan._id.toString(),food}

let {error} = diet_plan_item_validate(to_be_update,diet_plan.start_date,end_date.toString())
if(error){

    res.status(400).send(error.details[0])
}

else{

    diet_plan_item= await DietPlanItem.findByIdAndUpdate({_id:_id},{time_to_eat,meal,taken,food})

    console.log(diet_plan_item)
    
    res.send(diet_plan_item)
}

}

else{

    res.status(400).send({message:"Diet Plan dont exists"})
}


}
else{

    res.status(401).send({message:"Access Denied"})
}

},

todays_meal:async(req,res)=>{
if(req['client']!==undefined){
const {_id}=req.client
const diet_plan= await DietPlan.findOne({owner_id:_id}).select('_id')
 if(diet_plan){const time=moment()
 time.hours(00).minutes(00)
 const end_time=moment(time.toISOString())
 end_time.add(1,"day")   
 
 time.hours(00).minutes(00)
 let meals =await DietPlanItem.find({time_to_eat:{$gt:time.toString(),$lt:end_time.toString()},plan_id:diet_plan['_id']})
            .populate({path:'food',select:{'food_name':1,"food_id":1,'serving':-1},options:{autopopulate:false}})
      
 res.send({meals})
 }

 else {
     res.status(400).send({message:"You Dont have diet plan."})
 }
}

else {

    res.status(401).send({message:"Unauthorized."})
}

}

,
get_weekly_report:async (req,res)=>{

    if(req.client){
        let diet_plan= await DietPlan.findOne({owner_id:req.client._id})
        if(diet_plan!==null){  
        let start_date=moment()
            start_date.hours(00).minutes(00)
            
            start_date.subtract(6,'day')
            
        let end_date=moment()
            end_date.hours(23).minutes(59)
            end_date.subtract(6,'day')
            let count_calories=[]
           
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
        count_calories.push({...count[0],time:start_date.calendar(null,{
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

        
        res.send(count_calories)
    }

    else res.send([])


}

    else 
        res.send({})


},



get_today_report:async (req,res)=>{

    if(req.client){

        diet_plan= await DietPlan.findOne({owner_id:req.client._id})

        start_date= moment()
        start_date.hours(00).minutes(00).seconds(00)
        console.log(req.client)
        end_date= moment()
        end_date.hours(23).minutes(59).seconds(59)
        if(diet_plan)
        {

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

            res.send(count)
        }

        else{

            res.status(400).send({message:"You dont have Diet Plan"})
        }


    }


    else{

        res.status(401).send({message:"Unauthorized"})


    }




},



get_complete_report:async (req,res)=>{

    if(req.client){
        let diet_plan= await DietPlan.findOne({owner_id:req.client._id})
        let start_date=moment(diet_plan.start_date)
            start_date.hours(00).minutes(00)
            
        let end_date=moment(diet_plan.start_date)
            end_date.hours(23).minutes(59)
        
            let count_calories=[]
           
        for(let i=0;i<diet_plan.duration;i++){
        let count = await DietPlanItem.aggregate([
            {$match:
                {
                   $and:[{time_to_eat:{$gte:new Date(start_date.toISOString()),$lte: new Date(end_date.toISOString())}},{taken:true}]
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

        
        res.send(count_calories)
    }

    else 
        res.send({})


},


/*Make Diet Plan By Nutritionist*/
make_diet_plan_nutritionist:async(req,res)=>{
    
   if(req.user){
    console.log(req.body)
    
    const {title,duration,start_date,client_id,order_id}= req.body 
    const client = await Client.findById(client_id)
    try{await DietPlan.findOneAndDelete({_id:client.diet_plan})} catch(err){}
    let order= await DietPlanOrder.findById(order_id) 
    let data={
        title,
        start_date,
        duration,
        owner_id:client._id+""

        }
        const {error}= diet_plan_validate(data);
        
        if(error){
            res.status(400).send(error.details[0])
        }

        else{
         diet_plan=await  new DietPlan({...data,created_by :req.user._id}).save()
         client.diet_plan=diet_plan._id
         await client.save()
         order.status="Diet Plan Created"
         await order.save()
         res.send({msg:"Diet Plan Created Successfully..",plan_id:diet_plan._id})
        }
    }

    else {
        res.status(401).send("Unauthorized")
    }
    },


    get_active_diet_plans:async(req,res)=>{

        let {user}=req  
        {
            let page=parseInt(req.params.page)
            let page_size=12
            
            if(user){

                let total_results= await DietPlan.find({created_by:user._id}).countDocuments() 

                let diet_plans= await DietPlan.find({created_by:user._id}).populate('owner_id').sort({updatedAt:1}).skip((page-1)*page_size
                ).limit(page_size)

                res.send({total_results,diet_plans})
            }

            else {

                res.status(401).send('Unauthorized')
            }
        }


    }
    ,get_diet_plan_details:async (req,res)=>{
        let {user,client}=req
        if(user._id){

            let {id}=req.params
            try{
            let diet_plan =await DietPlan.findOne({_id:id,created_by:user._id}).populate('owner_id').populate('created_by')
                
            if(diet_plan){
                console.log(diet_plan)
                res.send(diet_plan)
            
            }

            else{

                res.status(404).send('Not Found')
            }
        
        }
            
            catch(err){

                
                res.status(404).send('Not Found')

            }


        }

        else if(client._id){

            let {id}=req.params
            try{
            let diet_plan =  (await DietPlan.findOne({_id:id,owner_id:client._id})).populate('owner_id').populate('created_by')
                
            if(diet_plan){

                res.send(diet_plan)
            
            }

            else{

                res.status(404).send('Not Found')
            }
        
        }
            
            catch(err){

                
                res.status(404).send('Not Found')

            }


        }
       


    },

    
get_diet_plan:async(req,res)=>{
    
    let {user}=req
    if(user._id){
    const page=parseInt(req.params.page)
    const page_size= 12
    let total_results=0;
    const {id} =req.params
    const date= moment()
    
    date.hours(00).minutes(00).seconds(00)
    try{
    let diet_plan= await DietPlan.findOne({_id:id}).populate({path:'items',match:{time_to_eat:{$gte:date}}
    ,populate:'food'
    ,options:{sort:['time_to_eat']},skip:(page-1)*page_size,limit:page_size})

    if(!diet_plan){
        res.status(404).send({message:"Diet Plan not Found."})
    }
    else
        {
            total_results=await DietPlanItem.countDocuments({plan_id:diet_plan._id}).where({time_to_eat:{$gt:date}})
            res.send({diet_plan,total_results})
        }
    }
    catch(err){

        res.status(404).send({message:"Diet Plan not Found."})

    }

}

else {


    res.status(401).send("Unauthorized...")
}
},

get_clients:async (req,res)=>{

    if(req.user._id){

    let clients= await DietPlan.find({created_by:req.user._id}).populate('owner_id').select('owner_id')
        
    res.send(clients)

    }

    else {


        res.status(401).send('Unauthorized..')
    }




}






}
