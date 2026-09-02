const mongoose = require("mongoose");

const userschema= new  mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    store:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        default: null
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})
userschema.plugin(passportLocalMongoose.default || passportLocalMongoose, {
    usernameField: "email"   
});
module.exports = mongoose.model("User",userschema);