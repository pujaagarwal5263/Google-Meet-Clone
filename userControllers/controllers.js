const User = require("../models/userSchema");
const jwt=require("jsonwebtoken")
const { v4: uuidV4 } = require('uuid')
const bcrypt=require("bcrypt")

const getRegisterPage=(req,res)=>{
  return res.render('signup')
}

const getLoginPage=(req,res)=>{
  return res.render('login')
}

const getMeetpage=(req,res)=>{
  //console.log(req.user);
  //localStorage.setItem("user",req.user.name)
  return  res.render('meetpage')
}

const getNewMeet=(req,res)=>{
  return res.redirect(`/user/${uuidV4()}`)
}

const getYourRoom=(req,res)=>{
  let username;
  // const username=cookieArray[0].slice(5,cookieArray[0].length-1); 
  const cookie=req.headers.cookie;
  const cookieArray=cookie.split("; ");

  for (let i = 0; i < cookieArray.length; i++) {
   const prefix=cookieArray[i].slice(0,4);
   if(prefix=="user"){
       username=cookieArray[i].slice(5,cookieArray[i].length)
   } 
  }

  return res.render('room', { roomId: req.params.room, username: username })
}

const joinUser=(req,res)=>{
  return res.redirect(`/user/${req.body.roomid}`)
}
const userRegistration=async(req,res)=>{
  var {name, email,password, cpassword}=req.body;
  if(!name || !email || !password || !cpassword){
    return res.status(400).render('signup',{error: "Please fill the data properly"});
  }
  if(password!==cpassword){
    return res.status(400).render('signup',{error: "Passwords do not match"});
  }

  try{
   const userExist=await User.findOne({email: email});
   if(userExist){
    return res.status(400).render('signup',{error: "Credentials already exist"});
   }else{
    password=await bcrypt.hash(password,10);
    const user = new User({name,email,password});    
    const userRegister=await user.save();
    if(userRegister){
        return res.status(200).redirect('/login')
    }else{
       return res.status(500).render('signup',{error: "Failed to register"})
    }
   }
  }catch(err){
   console.log(err);
  }
}

const userLogin=async(req,res)=>{
    const {email,password}=req.body;
    if( !email || !password){
        return res.status(400).render('login',{error: "Please fill the data properly"});
    }
    try{
        const userExist=await User.findOne({email: email});
        if(userExist){
          const isMatch= await bcrypt.compare(password,userExist.password);;
          if(!isMatch){
            return res.status(401).render('login',{ error:"Invalid Credentials"})
          }
          else{
            const token=jwt.sign({_id:userExist._id},process.env.TOKEN_SECRET_KEY);
            res.cookie("jwttoken",token);
            res.cookie("user",userExist.name)
            return res.status(200).redirect('/meetpage')
          }
        }else{
            return res.status(404).render('login',{ error:"User not registered"})
        }
       }catch(err){
        console.log(err);
       }
}

const logout=(req,res)=>{
  res.clearCookie('user');
  res.clearCookie('jwttoken',{path: "/"});
  return res.status(200).render('logout');
}

module.exports={userRegistration, userLogin, getRegisterPage, 
  getLoginPage, getMeetpage, getNewMeet, getYourRoom, joinUser, logout}