/* eslint-disable import/order */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
// const app = express();
const serverApp = require('../app');
const moment = require('moment');
 
const server = require('http').createServer(serverApp);
const io = require('socket.io')(server, {cors: {origin: '*'}});

const { chatService } = require('../services');
const { getUserById, updateUser } = require('../services/user.service');

io.on('connection', socket =>{
    console.log("socket ",socket.id);

    socket.on("new-user", function (data) {
        console.log("new user in ==> ",data);
        socket.room = `${data.adminId}-${data.customerId}`;
        socket.join(socket.room);
    });

    socket.on("read-messages", function (data) {
        chatService.readMessage(data.adminId,data.customerId)
    });

    socket.on("typing", async function (data) {
        const user = await getUserById(data.userId);
        socket.to(socket.room).emit('typing', {typing: data.typing, roomId: socket.room, message: data.typing ? `${user.firstname} is typing` : `${user.firstname} online`});
    });

    socket.on("online", async function (data) {
        console.log("user now online ==> ",data);
        console.log("user now online ==> ",socket.room);
        socket.user = data.userId;
        await updateUser(data.userId,{online: true})
        const user = await getUserById(socket.user);
        socket.to(socket.room).emit('user-connected', {roomId: socket.room, message: `${user.firstname} joined the conversation`});
    });

    socket.on('disconnect', async function(){
        console.log("user diconnected ==> room",socket.room);
        console.log("user diconnected ==> user",socket.user);
        if(socket.user){
            console.log('moment()',moment().add(1, 'hours'))
            console.log('date()',new Date())
            console.log('date.now()',Date.now())
            await updateUser(socket.user,{online: false, lastSeen: moment().add(1, 'hours')})
            const user = await getUserById(socket.user);
            socket.leave(socket.room);
            socket.to(socket.room).emit('user-left', {roomId: socket.room, message: `${user.firstname} left the conversation`});
        }
    });

    
    socket.on('send-message', async payload =>{
        const {adminId, customerId, senderId,message} = payload;
        console.log("sendind ==> ",socket.id);
        const messageSent = await chatService.sendMessage({adminId, customerId,senderId,message});
        // io.emit('event-name', callback) to all (including this user)
        // socket.broadcast.emit('event-name', callback) other users but this
        // socket.to(socket_id).emit('event-name', callback) // to a specific user
        const chats = await chatService.getChatsSocket(senderId);
        const messages = await chatService.getMessages(messageSent.chatId,{limit: 1, page: 1},'desc');

        socket.emit('get-chats', chats)
        io.in(socket.room).emit('get-messages', messages);
    })
});

module.exports = server;