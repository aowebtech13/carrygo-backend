/* eslint-disable no-console */
const moment = require('moment');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
// const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    uniqueId: {
      type: String, 
    },
    lastName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    avatarId: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: moment().add(1, 'hours')
    },
    gender: {
      type: String,
      trim: true,
    },
    userType: { // riders/dsos/admin/investors...
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    // role: {
    //   type: String,
    //   enum: roles,
    //   default: 'user',
    // },
    status: {
      type: String,
      default: 'pending',
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    cashPayment: {
      type: Boolean,
      default: false,
    },
    walletPayment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  if(user && (user.status === 'incomplete' || user.status === 'deleted')) {
    await this.deleteMany({email})
    return false;
  }
  return !!user;
};

userSchema.statics.isPhoneNumberTaken = async function (phone) {
  // eslint-disable-next-line no-param-reassign
  phone = phone.startsWith('0')
   ? `+234${phone.slice(1)}` 
   : phone;
  const user = await this.findOne({ phone });
  if(user && (user.status === 'incomplete' || user.status === 'deleted')) {
    await this.deleteMany({phone})
    return false;
  }
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
