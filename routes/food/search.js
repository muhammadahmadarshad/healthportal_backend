const fatsecret = new require('fatsecret');
const router= require("express").Router()
const fatAPI=new fatsecret("583c06c6b7884d689bbcb5994e9ea5eb", "93340e4d0cf0447aab056fa8950032fc")
const {Food} = require('../../models/foods/foods')
const {Client} =require('../../models/Client')
const {Nutritionist} = require('../../models/Nutrionist/Nutritionist')
const {auth} = require('../../middlewares/auth')

router.get('/food_search/:search/:page_no',(req,res)=>{

    let {search,page_no}=req.params;    
    fatAPI
      .method('foods.search', {
        search_expression: search,
        max_results: 15,
        page_number:page_no
      })
      .then(function(results) {
        if(results.error){
          res.status(404).send("Not Found")
          
        }
        else
        res.send(results);
      })
      .catch(err => (
          res.status(404).send("Not Found")
      ));

})







router.get('/recipes/:search/:page',(req,res)=>{

    let {search,page}=req.params;

    
    fatAPI
      .method('recipes.search', {
        search_expression: search,
        max_results: 9,
        page_number:page
      })
      .then(function(results) {
        res.send(results);
      })
      .catch(err => (
          res.send("Not Found")
      ));

})




router.get('/recipiesByID/:id',(req,res)=>{

    let recipe_id=req.params.id;

    
    fatAPI
      .method('recipe.get', {
        recipe_id
      })
      .then(function(results) {
        res.send(results);
      })
      .catch(err => (
          res.send("Not Found")
      ));

})




router.get('/foodById/getFood/:id', auth,(req,res)=>{

    let food_id=parseInt(req.params.id);
    console.log(req.user)
    fatAPI
      .method('food.get', {
        food_id:food_id
      })
      .then(async function(results) {
        let exists ;
        if(req['client'][
        '_id'
        ]){
          exists = await Client.findById(req.client._id).populate({path:'saved_food',match:{food_id:results.food.food_id}}).select('saved_food')
    
        }

        else if(req['user'][
          '_id'
        ]){
          exists = await Nutritionist.findById(req.user._id).populate({path:'saved_food',match:{food_id:results.food.food_id}}).select('saved_food')
        
        }
        
        if(exists.saved_food.length){
          res.send({...results,food:{...results.food,saved:true}});


        }
        else
        res.send({...results,food:{...results.food,saved:false}});
      })
      .catch(err => (
          res.send("Not Found")
      ));

})



module.exports=router





