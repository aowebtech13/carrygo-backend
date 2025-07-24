/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Chat = require('../models/chat.model')
const User = require('../models/user.model')
const Message = require('../models/message.model')
const { paginate, sortItems } = require('../utils/extras');

/**
 * Get Orders
 * @param {object} body
 * @returns {String}
 */
const sendMessage = async (payload) => {
    let { adminId, customerId, senderId, message } = payload;

    if(!(await User.findById(adminId))) throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
    else if(!(await User.findById(customerId))) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const chats = await getChatsById(adminId,customerId);
    console.log("chats ",chats);
    if(!chats){
        // create the chat
        const chatId = mongoose.Types.ObjectId();
        Chat.create({
            chatId,
            adminId,
            customerId,
            lastMessage: message,
        });
        return Message.create({chatId,senderId,message,adminId,customerId});
    }
    Message.create({chatId:chats.chatId,senderId,message,adminId,customerId});
    // update the chats
    const updateChat = await Chat.findOneAndUpdate(
        { adminId,customerId},
        {
            "$set": {
                lastMessage: payload.message,
                lastMessagePostedAt: Date.now()
            }
        },
        {new: true}
    ).then(docs =>{return docs});
    return updateChat
};

const getChatsById = async (adminId,customerId) => {
    return Chat.findOne({adminId,customerId});
};

const readMessage = async (adminId,customerId,readerId) => {
    const messages = await Message.updateMany({adminId, customerId, senderId: readerId},{$set: {read: true}})
    return messages;
};

// coming back to options 'getMessages' and 'getChats'
const getMessages = async (chatId,options,order='asc') => {
    const messages = order === 'desc' 
        ? await Message.find({chatId}, '-__v -_id -createdAt').sort({$natural:-1})
        : await Message.find({chatId}, '-__v -_id -createdAt');
    const chat = await Chat.findOne({chatId})
    const user = chat ? await User.findById(chat.customerId) : {};
    console.log('messages',messages);
    console.log('chat',chat);
    console.log('user',user);
    const activeMessages = messages.map(async message=>{
        return {
            ...message._doc,
            customerName: `${user.firstName} ${user.lastName}`,
            customerImage: user.avatar,
        }
    });
    const getActiveMessages = await Promise.all(activeMessages).then(docs => {return docs});
    if(options){
        if(options.sortBy){
            const sortedMessages = sortItems(getActiveMessages,options.sortBy, options.order || '');
            return paginate(sortedMessages,options);;
        }
    }
    return paginate(getActiveMessages,options);   
};

const getMessagesByUser = async (adminId,customerId,options,order='asc') => {
    const messages = await Message.find({
            adminId, customerId}, '-__v -createdAt')
            .sort({$natural:-1});
    const user = await User.findById(customerId);
    const admin = await User.findById(adminId);
    const activeMessages = messages.map(async message=>{
        return {
            ...message._doc,
            customerName: `${user.firstName} ${user.lastName}`,
            customerImage: user.avatar,
        }
    });
    const getActiveMessages = await Promise.all(activeMessages).then(docs => {return docs});
    if(options){
        if(options.sortBy){
            console.log('options',options);
            const sorted = sortItems(getActiveMessages,options.sortBy, options.order || '');
            return paginate(sorted,options);;
        }
    }
    return paginate(getActiveMessages,options);
};

const getChats = async (userId,options) => {
    const chats = await Chat.find({
        $or: [{adminId: userId},{customerId: userId}],
    }, '-__v -_id -createdAt -updatedAt')
    
    console.log('chats ',chats);
    const activeChats = chats.map(async chat => {
        const user = await User.findById(chat.customerId);
        const admin = await User.findById(chat.adminId);
        const adminMessages = await Message.find({chatId:chat.chatId,senderId:chat.adminId,read:false});
        const customerMessages = await Message.find({chatId:chat.chatId,senderId:chat.customerId,read:false});

        return {
            ...chat._doc,
            customerName: `${user.firstName} ${user.lastName}`,
            customerImage: user.avatar,
            adminName: `${admin.firstName} ${admin.lastName}`,
            adminImage: admin.avatar,
            unread_admin_messages: adminMessages.length,
            unread_customer_messages: customerMessages.length,
        }
    });
   const getActiveChats = await Promise.all(activeChats).then(docs => {return docs});
   if(options){
       if(options.sortBy){
            const sortedChats = sortItems(getActiveChats,options.sortBy, options.order || '');
            return paginate(sortedChats,options);;
        }
    }
    return paginate(getActiveChats,options); 
};

const getChatsSocket = async (userId,options) => {
    const chats = await Chat.find({
        $or: [{adminId: userId},{customerId: userId}],
    }, '-__v -_id -createdAt -updatedAt').sort({$natural:-1}); 
    
    console.log('chats ',chats);
    const activeChats = chats.map(async chat => {
        const user = await User.findById(chat.customerId);
        const admin = await User.findById(chat.adminId);
        // console.log('user ',user);

        return {
            ...chat._doc,
            customerName: `${user.firstName} ${user.lastName}`,
            customerImage: user.avatar,
            adminName: `${admin.firstName} ${admin.lastName}`,
            adminImage: admin.avatar,
        }
    });
   const getActiveChats = await Promise.all(activeChats).then(docs => {return docs});
   if(options){
       if(options.sortBy){
            const sortedChats = sortItems(getActiveChats,options.sortBy, options.order || '');
            return paginate(sortedChats,options);;
        }
    }
    return paginate(getActiveChats,options); 
};

module.exports = {
    sendMessage,
    getChats,
    getChatsSocket,
    getMessages,
    getMessagesByUser,
    readMessage
};
