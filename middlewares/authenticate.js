require("cookie-parser");
const User=require("../models/userSchema")
var jwt=require("jsonwebtoken");
require('dotenv').config()

const authenticate=async(req,res,next)=>{
    try{
        let token;
        const cookie=req.headers.cookie;
        if(!cookie){
            throw new Error('No token provided');
        }

        const cookieArray=cookie.split("; ");
        for (let i = 0; i < cookieArray.length; i++) {
         const prefix=cookieArray[i].slice(0,8);
         if(prefix=="jwttoken"){
             token=cookieArray[i].slice(9,cookieArray[i].length)
         } 
        }

        const verifyToken=await jwt.verify(token,process.env.TOKEN_SECRET_KEY);
        if(!verifyToken){
        throw new Error('Token could not be verified');
        }
        req.user=await User.findOne({_id: verifyToken._id});
        next();

    }catch(err){
        if(err=="Error: No token provided"){
            //res.redirect(400, '/login');
            res.status(400).send(`<h3>No token provided: Please login to access the page. <br> <a href="/login">Login</a></h3>`);
        }else if(err="Error: Token could not be verified"){
           res.status(400).send("Token could not be verified: Incorrect token provided");
        }
        else{
           res.status(400).send(`Unauthorized: Something went wrong. Please relogin`);
        }
    }
} 
module.exports={authenticate};
