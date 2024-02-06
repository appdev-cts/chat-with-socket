require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const twilioRoute = require('./routes/twilio.route');
const hbs = require('nodemailer-express-handlebars');
const http = require('http')
const server = http.createServer(app);

require('./database');
const io = require('socket.io')(8900,{
  cors:{
      origin:"*"
  }
})


//routes
const userRoutes = require('./routes/user.route')
const featuresRoutes = require('./routes/features.route');
const { emailTransporter } = require('./utils');
const chatRoutes = require('./routes/chat.route')
const messageRoutes = require('./routes/message.route')
 
const PORT = process.env.PORT || 8080;


// middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());


// twilio-sms 
app.use('/twilio-sms',twilioRoute);

// /api/v1
app.use('/api/v1/auth',userRoutes);
app.use('/api/v1',featuresRoutes)
app.use('/api/v1/chat',chatRoutes)
app.use('/api/v1/message',messageRoutes)



let users = [];
console.log(users)
const addUser = (userId, socketId) => {
    const existingUser = users.find(user => user.userId === userId);
    if (!existingUser) {
        users.push({ userId, socketId });
    }

};
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);

}   

const getUser = (userId)=>{
    const user = users.find((user) => user.userId === userId);
    return user ? user : null;
}

io.on("connection",(socket)=>{
    console.log("A user connected")
    // 
    socket.on("addUser",(userId)=>{
        console.log(userId,socket.id)
        addUser(userId,socket.id);
        io.emit("getUsers",users);
    }) 
 
    socket.on('sendMessage', ({ senderId, receiverId, text,photo }) => {
        const user = getUser(receiverId);
        console.log(senderId, receiverId, text,photo )
        if (!user) {
            console.error('Receiver not found');
            return;
        }
    
        if (!user.socketId) {
            console.error('SocketId not available for the receiver');
            return;
        }
    
        io.to(user.socketId).emit('getMessage', {
            senderId,
            text,
            photo
        });
    });
    
    socket.on("typing", ({ senderId, receiverId, }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("isTyping", { senderId });
        }
    });

    socket.on('disconnect',()=>{
        console.log('A user disconnected');
        removeUser(socket.id);
        io.emit("getUsers",users)
   
    })
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});