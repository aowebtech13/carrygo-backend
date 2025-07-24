/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
const ID = require("nodejs-unique-numeric-id-generator");
const { LoggedInAdmin, User } = require('../models');

const saveAdminLogin = async(payload) =>{
    const {ipAddress} = payload;
    console.log('payload====',payload)
    if(await LoggedInAdmin.findOne({ipAddress})) return LoggedInAdmin.updateOne({ipAddress},{$set:{dateLoggedIn:new Date()}})
    return LoggedInAdmin.create(payload)
}

const loggedInAdminsExceeded = async() =>{
    const admins = await LoggedInAdmin.find({userType: 'admin'});
    console.log('admins',admins.length)

    if(admins.length >= 3) return true
    return false;
}

const isSubAdminLoggedIn = async(userId) =>{
    const admins = await LoggedInAdmin.findOne({userId, userType: 'sub-admin'});
    return admins;
}

const deleteLoggedAdmin = async(userId) =>{
    const {ipAddress} = await getLoggedInAdmin(userId)
    console.log('ipAddress',ipAddress)
    return LoggedInAdmin.deleteOne({ipAddress});
}

const getLoggedInAdmin = async(userId) =>{
    const admin = await LoggedInAdmin.findOne({userId});
    return admin;
}

const checkUniqueId = async(uniqueId) =>{
    const idExist = await User.findOne({uniqueId})
    if(idExist && idExist.uniqueId){
        console.log('generating another ID', idExist.uniqueId,uniqueId)
        await checkUniqueId(ID.generate(new Date().toJSON()))
        return;
    }
    console.log('fresh new ID',uniqueId)
    return uniqueId;
}


module.exports = {
    saveAdminLogin,
    checkUniqueId,
    loggedInAdminsExceeded,
    isSubAdminLoggedIn,
    deleteLoggedAdmin,
    getLoggedInAdmin
}