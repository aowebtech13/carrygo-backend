/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
const httpStatus = require('http-status');
const { getUserById, getAdmin } = require('../services/user.service');
const ApiError = require('../utils/ApiError');

const checkPrivileges = 
    (...privilege) => 
    async(req,res,next) =>{
    let userId;
    if(req.body.userId) userId = req.body.userId
    else if(req.body.adminId) userId = req.body.adminId
    else if(req.params.userId) userId = req.params.userId
    else if(req.params.adminId) userId = req.params.adminId

    console.log('userId',userId);
    if(!userId){
        return next(new ApiError(httpStatus.BAD_REQUEST, 'Admin ID is required'));
    }
    const user = await getUserById(userId)
    if(!user) return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
    const {userType} = user
    console.log('userType',userType);

    if(userType === 'sub-admin'){
        const admin = await getAdmin({_id: user.id})
        const {privileges} = admin
        console.log('privileges',privileges);
        const privilegesInLowerCaps = privileges.map(el => {
            return el.toLowerCase();
        });

        console.log('privilegesInLowerCaps',privilegesInLowerCaps);
        console.log('privilege',privilege);

        if(!privilegesInLowerCaps.includes(privilege)){
            console.log('unat');
            return next(new ApiError(httpStatus.UNAUTHORIZED, "You don't have access to this feature"));
        }
        console.log('pass');
        next();
    }else if(userType === 'admin') next();
    else return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized')); // customers can access also
}

module.exports = {
    checkPrivileges
}