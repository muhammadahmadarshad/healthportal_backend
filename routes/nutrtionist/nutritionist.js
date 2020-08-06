const router = require('express').Router()
const {
        deleteSpeciality,deleteExperience,signup,login,addEducation,deleteEducation,
        updateExperience,getEducation,updateEducation,addExperience,addSpeciality,updateSpeciality,get_all,block_account,me,find, find_by_id, update_account,
        ForgotPassword,ResetPassword,VerifyCode, ChangePassword
    }   = require('./nutritionistRoutes')
const {auth}= require('../../middlewares/auth')

router.post('/signup',signup)
router.post('/login',login)
router.get('/get_all/:page',get_all)
router.put('/block/:_id',auth,block_account)
router.get('/me',auth,me)
router.post('/find',find)
router.put('/update/',auth,update_account)
router.put('/change_password',auth,ChangePassword)
router.post("/forgotPassword",ForgotPassword)
router.post("/resetPassword",ResetPassword)
router.post('/verify_opt',VerifyCode)
router.get('/find_by_id/:_id',find_by_id)

/*Education*/
router.post('/addEducation',auth,addEducation)
router.get('/getEducation',auth,getEducation)
router.delete('/deleteEducation/:id',auth,deleteEducation)
router.patch('/updateEducation/:id',auth,updateEducation)

/*Experience*/
router.post('/addExperience',auth,addExperience)
router.delete('/deleteExperience/:id',auth,deleteExperience)
router.patch('/updateExperience/:id',auth,updateExperience)

/*Speciality */
router.post('/addSpeciality',auth,addSpeciality)
router.delete('/deleteSpeciality/:id',auth,deleteSpeciality)
router.patch('/updateSpeciality/:id',auth,updateSpeciality)


module.exports=router