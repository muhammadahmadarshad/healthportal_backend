const {Product,validateProduct} = require('../../models/Shop/Product')
const router = require('express').Router()
const {auth} = require('../../middlewares/auth')
const cloudinary=require('../../middlewares/cloudinaryupload')
const multer=require('../../middlewares/multer')
const fs= require('fs')

router.post('/addProduct',auth,multer.upload,async (req,res)=>{

    if(req.admin){
        let {
            name,
            price,
            category,
            qty,
            image,
            facts,
            description,
            brand}=req.body
        let {file}=req
            image=file

        let product = {
            name,
            description,
            price,
            category,
            qty,
            facts,
            brand,
        }

        const {error}=validateProduct(req.body)

        if(error){
            res.status(400).send(error.details[0])
        }

        else{
            let upload_image=''
            if(image){
            upload_image=await cloudinary.uploader.upload(file.path,{public_id:`shop/${new Date().toISOString()}`,
            
            responsive_breakpoints: 
            { create_derived: true, 
              min_width: 200, 
              max_width: 400 },
            tags:"shop"})
            fs.unlinkSync(image.path)
            }
            product = new Product({...product,image:upload_image})
            res.send(await product.save())
        }
    
    }
else 
    res.status(401).send("Access Denied")
})



router.delete('/delete_product/:id',auth,async (req,res)=>{
    if(req.admin){
        let product = await Product.findOneAndDelete({_id:req.params.id})
        response=await cloudinary.api.delete_resources([product.image.public_id])
        
        res.send({message:"Deleted Successfully"})
    }


    else 
    res.status(401).statusMessage("Access Denied")
})


router.get('/get_all_products/:page',async(req,res)=>{
    
    const page_size = 8 
    const page = (parseInt(req.params.page)-1)*page_size
    let total_results= await Product.countDocuments()
    let products= await Product.find().skip(page).limit(page_size)
    res.send({products,total_results})

})


router.get('/product_details/:id',async(req,res)=>{

    const {id}=req.params
    try{
        let product = await Product.findById(id)
        if(product){
    
            res.send(product)
    
        }
    
        else
        res.status(404).send({message:"Not Found"}) 

    }
    catch(err){

        res.status(404).send({message:"Not Found"})

    }


})





router.put('/updateProduct/:id',auth,multer.upload,async (req,res)=>{

    if(req.admin){
        let {
            name,
            price,
            category,
            qty,
            facts,
            description,
            brand,featured}=req.body


    let product =await Product.findById(req.params.id)
    if(product){
        let {file}=req
            image=file
        if(image){
            let upload_image=await cloudinary.uploader.upload(file.path,{public_id:`shop/${new Date().toISOString()}`,tags:"shop"})
        
            fs.unlinkSync(image.path)
            response=await cloudinary.api.delete_resources([product.image.public_id])
            product.image= upload_image

        }

        let p = {
            name,
            description,
            price,
            category,
            qty,
            facts,
            brand,
        }

        const {error}=validateProduct(p)

        if(error){
            res.status(400).send(error.details[0])
        }
        else{
            product.description=description,
            product.name=name,
            product.price=price,
            product.qty=qty,
            product.category=category,
            product.brand= brand
            product.facts=facts
            product.featured=featured
            await product.save()
            res.send({message:"Updated Successfully"})
        }}
        else 
            res.status(400).send({msg:"Product not Found"})
    }
else 
    res.status(401).send("Access Denied")
})



/*Search Products */
router.get('/search_products/:product/:page',async(req,res)=>{
    
    const {product,page}=req.params
    
    const total_results= await Product.find().or([{name:{$regex:new RegExp("^" + product, "i") }}
        ,{category:{$regex:new RegExp("^" + product, "i")}},
        {description:{$regex:new RegExp("^" + product, "i")}},
        {facts:{$regex:new RegExp("^" + product, "i")}},
        {brand:{$regex:new RegExp("^" + product, "i")}}
      
    ]).countDocuments()

    const products=await Product.find().or([{name:{$regex:new RegExp("^" + product, "i") }}
    ,{category:{$regex:new RegExp("^" + product, "i")}},
    {description:{$regex:new RegExp("^" + product, "i")}},
    {facts:{$regex:new RegExp("^" + product, "i")}},
    {brand:{$regex:new RegExp("^" + product, "i")}}

]).skip((parseInt(page)-1)*12).limit(12)

    res.send({products,total_results})


})



router.get('/featured_products',async(req,res)=>{


    let products= await Product.find({featured:true}).limit(4)

    res.send(products)

})















module.exports=router





