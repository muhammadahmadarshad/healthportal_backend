const {Queries} = require('../../models/queries/Queries')
const {Conversation} = require('../../models/queries/Conversation')
const { auth } = require('../../middlewares/auth')
const Router= require('express').Router()



Router.post('/sendMessage',auth,async(req,res)=>{

    const {client}= req
    const {query,nutri_id}= req.body
    
    if(req.client['_id'])
    {

        
    
    
   
            let msg= new Queries({
               
                query,
                author_id:client._id,
    nutritionist:nutri_id

    
            })   
            result= await msg.save()
            res.send({success:true,msg:"Sent Successfully.."})
   
    }


   

else

    res.status(400).send({success:false,msg:"Error"})

})




Router.get('/get_all_messages/:page',auth,async (req,res)=>{

    let {user,client} = req

    let page= parseInt(req.params.page)
    if(user){

    
    total_results= await Queries.find({nutritionist:user._id,response:""}).countDocuments()
    messages= await Queries.find({nutritionist:user._id,response:""}).populate('author_id').skip((page-1)*12).limit(12)  

    if(total_results>0)
        res.send({total_results,messages})
    else{

        res.status(404).send({success:false,msg:'No Quereies Avaiable'})
    }
}


else if(client){

        
    total_results= await Queries.find({author_id:client._id,}).countDocuments()
    messages= await Queries.find({author_id:client._id}).populate('nutritionist').skip((page-1)*12).limit(12)  

    if(total_results>0)
        res.send({total_results,messages})
    else{

        res.status(404).send({success:false,msg:'No Quereies Avaiable'})
    }
}

else {

    res.status(401).send('Unauthorized...')
}
})


Router.get('/count_messages/',auth,async (req,res)=>{

    let {user} = req
    total_results= await Queries.find({nutritionist:user._id,response:""}).countDocuments()
    res.status(200).send({total_results})
})


Router.put('/update_message',auth,async(req,res)=>{
    let {user}=req
    let {msg_id,response}=req.body
    if(user._id){

        let message = await Queries.findById(msg_id)
        if(message){
        message.response=response
        await message.save()
        res.send({success:true,msg:"Sent"})
    }
    else
    res.status(404).send({success:false,msg:"Not Found"})
    }

    else{

        res.status(401).send({success:false,msg:"Unauthorized.."}) 
    }
    
})


Router.get('/message_by_id/:id',auth,async (req,res)=>{

    let {user,client}=req
    if(user){
       try{ let message=  await Queries.findById(req.params.id).populate('author_id')
        
        if(message){

            res.send(message)
        }
        else {
            res.status(404).send('Not Found')
            
        }
    
    }
        catch(err){


            res.status(404).send('Not Found')
        }
    }

   else if(client){
        try{ let message=  await Queries.findById(req.params.id).populate('nutritionist').populate('author_id')
         
         if(message){
 
             res.send(message)
         }
         else {
             res.status(404).send('Not Found')
             
         }
     
     }
         catch(err){
 
 
             res.status(404).send('Not Found')
         }
     }

     else {

        res.status(404).send('Not Found')
     }


})


module.exports= Router