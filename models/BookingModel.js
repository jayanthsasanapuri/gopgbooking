const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  pgId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Admin',
    required:true
  },
  mobileNumber:{
    type:String,
    required:true
  },
  checkIn:{
    type:Date,
    required:true,
  },
  checkOut:{
    type:Date,
    required:true,
  },
  occupation:{
   type:String,
   required:true,
  },
  emergencyContact:{
   type:String,
   required:true
  },
  notes:String,
  rentAmount:Number,

  deposit:Number,

  totalAmount:Number,
  paymentStatus:{
        type:String,
        default:'Paid'
  },

  bookingStatus:{
        type:String,
        default:'Confirmed'
  }
},{
  timestamps:true
});
module.exports = mongoose.model('Booking',bookingSchema);