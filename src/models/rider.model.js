const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    dsoId: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: String,
        trim: true,
    },
    online: {
        type: Boolean,
        trim: true,
    },
    lastLng: {
        type: Number,
        trim: true,
    },
    lastLat: {
        type: Number,
        trim: true,
    },
    vehicleType: {
        type: String,
        trim: true,
    },
    vehicleYear: {
        type: String,
        trim: true,
    },
    vehicleModel: {
        type: String,
        trim: true,
    },
    licenseNumber: {
        type: String,
        trim: true,
    },
    healthCertificate: {
        type: String,
        default: '',
        trim: true,
    },
    riderCard: {
        type: String,
        default: '',
        trim: true,
    },
    selectedIdCard: {
        type: String,
        trim: true,
    },
    idCard: {
        type: String,
        default: '',
        trim: true,
    },
    passport: {
        type: String,
        default: '',
        trim: true,
    },
    originCertificate: {
        type: String,
        default: '',
        trim: true,
    },
    lasra: {
        type: String,
        default: '',
        trim: true,
    },
    guarantorForm: {
        type: String,
        default: '',
        trim: true,
    },
    academicCredentials: {
        type: String,
        default: '',
        trim: true,
    },
    roadWorthiness: {
        type: String,
        default: '',
        trim: true,
    },
    vehicleReceipt: {
        type: String, 
        default: '',
        trim: true,
    },
    chasisNumber: {
        type: String,
        default: '',
        trim: true,
    },
    engineNumber: {
        type: String,
        default: '',
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
    const rider = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!rider;
  };

/**
 * @typedef Rider
 */
const Rider = mongoose.model('Rider', schema);

module.exports = Rider;
