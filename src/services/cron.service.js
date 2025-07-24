const cron = require('node-cron');
const { dateDifference } = require('../utils/extras');
const { getAllPromoCodes, deletePromoCode } = require('./user.service');

const task = cron.schedule('0 0 0 * * *', async() => {
    const promos = await getAllPromoCodes();
    if(promos.length > 0){
        promos.map(async promo =>{
            const diff = dateDifference(promo.createdAd, Date.now())
            if(diff >= promo.duration){
                await deletePromoCode(promo.promoCode)
            }
            return null;
        })
    }
})

const startCronJob = () =>{task.start()}
const destroyCronJob = () =>{task.destroy()}

module.exports = {
    startCronJob,
    destroyCronJob,
}