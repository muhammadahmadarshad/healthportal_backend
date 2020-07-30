const {Queries} = require('../../models/queries/Queries')
const {Conversation} = require('../../models/queries/Conversation')
const { auth } = require('../../middlewares/auth')
const Router= require('express').Router()



Router.post('/sendMessage',auth,async(req,res)=>{

    const {user,client}= req
    const {query,nutri_id}= req.body
    
    if(req.client['_id'])
    {

        
    
        let conversation= await Conversation.findOne({nutritionist:nutri_id,client:client._id})
        if(conversation){    
            let msg= new Queries({
                conversation_id:conversation._id,
                query,
                author_id:client._id
    
            })   
            result= await msg.save()
        conversation.messages.push(result._id)  
       await conversation.save()   
    }
    else{

       let conversation = await new Conversation({nutritionist:nutri_id,client:client._id})
       let msg= new Queries({
        conversation_id:conversation._id,
        query,
        author_id:client._id

    })   
    result= await msg.save()
         conversation.messages.push(result._id)
         conversation.save()
    }

    res.send({success:true,msg:"Sent Successfully.."})
}

else

    res.status(400).send({success:false,msg:"Error"})

})



Router.get('/get_all_conversation',auth,async (req,res)=>{


    let {user,client}= req
    if(client._id){

     let result=  await Conversation.find({client:client._id}).populate('nutritionist').sort({updateAt:1})

     if(result){

        res.send(result)
     }
     else{

        res.status(404).send("Not Found")
     }

    }


    else if(user._id){

        let result=  await Conversation.find({nutritionist:user._id}).populate('client').sort({updateAt:1})
   
        if(result){
   
           res.send(result)
        }
        else{
   
           res.status(404).send("Not Found")
        }
   
       }

    else{

        res.status(404).send("Not Found")
    }

})



Router.get('/get_all_messages/:id',auth,async (req,res)=>{
    try{
    let conversation = await Conversation.findOne({_id:req.params.id}).populate({path:'messages', options: { sort: { 'createdAt': -1 } ,populate:{path:"author_id"}}})
    console.log(conversation)
    if(conversation){

        res.send(conversation)
    }
    else {

        res.status(404).send('Not Found')
    }}
    catch(err){

        res.status(404).send('Not Found')
    }
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


module.exports= Router