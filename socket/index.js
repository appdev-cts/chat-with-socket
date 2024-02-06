const io = require('socket.io')(8900,{
    cors:{
        origin:"*"
    }
})

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