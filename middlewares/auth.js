/*
@ authentication middleware
*/
const jwt=require('jsonwebtoken')
const config=require('config')
exports.auth=async(req,res,next)=>{
const token=req.header('x-auth-token')
if(!token)
{
    res.status(401).send("Access Denied")
}
else
{
    try{
        const decode=jwt.verify(token,config.get('jwtPrivateKey'))
        if(decode.account_type==='client')
        req.client=decode;
        else if(decode.account_type==='nutritionist')
        req.user=decode
        else{
            
            req.admin=decode
        }
        
        
        next()
    
    }
    catch(ex)
    {
        res.status(400).send("Invalid Token.")
    }
}
}