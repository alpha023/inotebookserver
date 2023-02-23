const express=require('express');
const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const fetchUser=require('../middleware/fetchUser')

const JWT_SECRET="alpha.beta$delta";

const {body,validationResult}=require('express-validator');
const router=express.Router();


//ROUTE 1 : create a User using : POST "/api/auth/". doesnt require auth
//no login required

router.post('/createuser',[
    body('email','abe kesi email daal rha').isEmail(),
    body('name',"Enter Valid Name").isLength({min:3}),
    body("password",'thoda lamba password daal').isLength({min:8})
],async (req,res)=>{

    //if errors return bad req and errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array(),success:false})
    }

    //check whether user with this email exist
    try {

        let user=await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({success:false,msg:"User Already Exists"})
        }

        const salt=await bcrypt.genSalt(10);
        const secPass=await bcrypt.hash(req.body.password,salt);
        //create a new user
        user=await User.create({
            name:req.body.name,
            password:secPass,
            email:req.body.email
        });

        //when user got login we will send a token security token to it
        const data={
            user:{
                id:user.id
            }
        };
        const authToken=jwt.sign(data,JWT_SECRET);
        // console.log(authToken);
        res.json({authToken:authToken,success:true,name:req.body.name,email:req.body.email});
        
    } catch (error) {

        // console.log(error);
        res.status(500).json({success:false,msg:"Internal Server Error"});
        
    }
    
    //user.save();
    // .then((user)=>{
    //     user.save();
    //     res.json(user); 
    // }).catch(err=>{
    //     console.log(err);
    //     res.json({error:"yrr unique email daalo",message:err.message})
    // });
    // console.log(req.body);
    // const user=User(req.body);
    // user.save();
    // console.log("user saved successfully...")
   

});

//ROUTE 2 : authentication of a user using:POST "/api/auth/login"-no login required
router.post('/login',[
    body('email','valid email daal').isEmail(),
    body('password','thoda lamba password daal').exists()
],async (req,res)=>{

    //if errors return bad req and errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {email,password}=req.body;
    try {
        let user=await User.findOne({email:email});
        if(!user){
            //console.log("user not exists");
            return res.status(400).json({userExists:false,success:false,msg:"emai-id not exist try to Sign Up"})
        }

        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){

            return res.status(400).json({passwordMatch:false,msg:"incorrect password",success:false})
        }

        const data={
            user:{
                id:user.id
            }
        };
        const authToken=jwt.sign(data,JWT_SECRET);
        res.json({
            authToken:authToken,
            success:true,
            name:user.name,
            email:user.email
    });
        
    } catch (error) {

        // console.log(`error occured ${error}`);
        res.status(500).json({success:false,msg:"InterNal Server Error"});
        
    }



});

//ROUTE 3 : Get Logged In User Details using : GET "/api/auth/getuser" login required
router.get("/getuser",fetchUser,async (req,res)=>{

    try {

        const userId=req.user.id;
        const user=await User.findById(userId).select("-password");
        res.send(user);
        
    } catch (error) {

        // console.log(error.message);
        res.status(500).json({success:false,msg:"Internal Server Error"});
        
    }

})


module.exports=router;
