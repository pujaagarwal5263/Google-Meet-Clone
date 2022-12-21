const express=require("express");
const { authenticate } = require("../middlewares/authenticate");
const {userRegistration, userLogin, getRegisterPage, logout,
    getLoginPage, getMeetpage, getNewMeet, getYourRoom, joinUser} = require("../userControllers/controllers");
const router=express.Router();

router.get("/",getRegisterPage)
router.get("/login",getLoginPage)
router.post("/signup",userRegistration)
router.post("/login",userLogin)
router.get("/logout",logout);

//protected routes
router.use(authenticate)
router.get('/user/:room', getYourRoom)
router.get("/meetpage",getMeetpage)
router.get("/newmeet",getNewMeet)
router.post("/joinuser",joinUser)

module.exports=router;