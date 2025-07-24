/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
const axios = require('axios');

const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  const isExpired = (date) =>{
      const now = new Date();
      if(Date.parse(date) - Date.parse(now) < 0){
          return true
      }
          return false;
  }
  
  const paginate = (items, options) => {
      const page = options ? options.page : 1;
      const limit = options ? options.limit : 10;
      const offset = (page - 1) * limit;
  
      const results = items.slice(offset).slice(0, limit);
      const totalPages = Math.ceil(items.length / limit);
      const totalResults = items.length;
  
      return {
      results,
      meta: {
        page,
        limit,
        totalPages,
        totalResults,
      },
      };
}

const sortItems = (item, sortBy, order) =>{
    const sorted = item.sort(function (x, y) { 
        if(order === 'desc') return x[sortBy] + y[sortBy];
        return x[sortBy] > y[sortBy] && 1 || -1;
    });
    return sorted
}

const createPassword = async(data)=>{
    const password = await axios({
      method: 'POST',
      url: 'https://mobile-server-staging.herokuapp.com/api/v1/rider/password',
      headers: {
        'content-type': 'application/json',
      },
      data,
    })
    .then((docs) => {return docs})
    .catch((error) => {return error})
    return password;
  }

const dateDifference = (startDate, endDate)=>{
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

const formatData = (data)=>{
  if(data._doc){
    delete data._doc._id
    delete data._doc.createdAt
    delete data._doc.updatedAt
    delete data._doc.__v
  }else{
    delete data._id
    delete data.createdAt
    delete data.updatedAt
    delete data.__v
  }
  return data;
}
  
  module.exports = {
      paginate,
      isExpired,
      sortItems,
      createPassword,
      getRndInteger,
      dateDifference,
      formatData
  };
  