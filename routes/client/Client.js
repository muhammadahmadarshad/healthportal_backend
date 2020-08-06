const app=require('express').Router()
const {Signup,Login,ForgotPassword,VerifyToken,ResetPassword,Me,UpdateAccount,ChangePassword, VerifyCode}=require('./ClientRoute')
const {auth} = require('../../middlewares/auth')
app.post("/signup",Signup)

/*
@ Account Verify Route
*/



app.post("/forgotPassword",ForgotPassword)
app.post("/resetPassword",ResetPassword)
app.post('/verify_opt',VerifyCode)
app.post("/login",Login)
app.get('/me',auth,Me)

app.put('/update_account',auth,UpdateAccount)
app.put('/change_password',auth,ChangePassword)
module.exports=app;