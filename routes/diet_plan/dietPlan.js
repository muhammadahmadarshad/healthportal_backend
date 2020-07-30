const router = require('express').Router()
const {make_diet_plan,get_weekly_report,add_meal,
       getDietPlan,delete_meal,todays_meal,update_meal,
        get_today_report,
        get_complete_report,
        make_diet_plan_nutritionist,
        get_active_diet_plans,
        get_diet_plan,get_diet_plan_details, get_clients
        } =require('../diet_plan/DietPlanRoutes')
const {auth} = require('../../middlewares/auth')


router.post('/make_diet_plan',auth,make_diet_plan)
router.post('/nutri/make_diet_plan',auth,make_diet_plan_nutritionist)
router.post('/add_meal',auth,add_meal)
router.get('/get_diet_plan/:page',auth,getDietPlan)
router.get('/get_diet_plan_details/:id',auth,get_diet_plan_details)
router.get('/nutri/get_diet_plans/:page',auth,get_active_diet_plans)
router.get('/nutri-diet-plan/:id/:page',auth,get_diet_plan)
router.delete('/delete_meal/:id',auth,delete_meal)
router.get('/todays_meal',auth,todays_meal)
router.put('/update_meal',auth,update_meal)
router.get('/report',auth,get_weekly_report)
router.get('/today_report',auth,get_today_report)
router.get('/complete_report',auth,get_complete_report)
router.get('/clients',auth,get_clients)
module.exports= router