const express = require('express')
const app = express()
require("cookie-parser");
const fs=require("fs")
const path=require("path")
const https=require("https")

const { v4: uuidV4 } = require('uuid')
const bodyParser=require("body-parser");
require('dotenv').config()

//const server = require('http').Server(app)
const server=https.createServer({
    key:fs.readFileSync(path.join(__dirname,'cert','key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'cert','cert.pem')),
 },app)

const io = require('socket.io')(server)
const PORT=process.env.PORT || "";

const router = require('./routes/router')
require("./config/db-connection")

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

io.on("connection",(socket)=>{
    socket.on("join-room",(roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit("user-connected",userId)
        
        socket.on("send-chat",(message,username)=>{
            io.to(roomId).emit("show-to-room",message,username);
         })

        socket.on("disconnect",()=>{
            socket.to(roomId).emit("user-disconnected",userId)
        })
    })

})

  app.use(router)

server.listen(PORT,()=>{
    console.log("server is running at 8000");
})