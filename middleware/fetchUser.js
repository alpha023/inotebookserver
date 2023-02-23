const jwt= require('jsonwebtoken');
const JWT_SECRET="alpha.beta$delta";

const fetchUser=(req,res,next)=>{

    //get user from jwt token and add id to req object
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({error:"plzz auth with a valid token : Access Denied",success:false});
    }
    try {

        const data=jwt.verify(token,JWT_SECRET);
        //console.log(data);
        req.user=data.user;
        next();
        
    } catch (error) {

        res.status(401).send({success:false,error:"plzz auth with a valid token : Access Denied"});
        
    }

    

};

module.exports=fetchUser;