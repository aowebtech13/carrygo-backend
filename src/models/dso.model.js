const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const schema = mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      companyName: {
        type: String,
        trim: true,
      },
      companyDescription: {
        type: String,
        trim: true,
      },   
      cac: {
          type: String,
          // required: true,
          trim: true,
      },
      carrierMode: {
        type: String,
        trim: true,
      },
      hackneyPermit: {
            type: String,
            default: '',
            trim: true,
      },
      idCard: {
        type: String,
        default: '',
        trim: true,
      },
      selectedIdCard: {
        type: String,
        default: '',
        trim: true,
      },
      roadWorthiness: {
            type: String,
            // required: true,
            trim: true,
      },
      license: {
          type: String,
          default: '',
          trim: true,
      },
      vehicleModel: {
          type: String,
          // required: true,
          trim: true,
      },
      vehicleReceipt: {
        type: String,
        trim: true,
      },
      licensePlateNumber: {
          type: String,
          // required: true,
          trim: true,
      },
      engineNumber: {
          type: String,
          // required: true,
          trim: true,
      },
      chasisNumber: {
          type: String,
          // required: true,
          trim: true,
      },
      autoVin: {
          type: String,
          trim: true,
      },
      officeLocation: {
          type: String, 
          trim: true,
      },
      dateRegistered: {
          type: Date, 
          default: Date.now()
      },
    },
    {
      timestamps: true,
    }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);
schema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
 schema.statics.isEmailTaken = async function (email, excludeUserId) {
    const dso = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!dso;
  };

/**
 * @typedef DSO
 */
const DSO = mongoose.model('DSO', schema);

module.exports = DSO;
