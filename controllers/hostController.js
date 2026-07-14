const Admin = require('../models/AdminModel');
const Booking = require('../models/BookingModel');
const Wishlist = require("../models/wishlistmodel");
exports.getbooknow = (req,res,next) =>{
    res.render('card');
}
exports.getCard = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const search = req.query.search || "";
    const city = req.query.city || "";
    const rent = req.query.rent || "";
    const gender = req.query.gender || "";
    let filter = {};
    if (search) {
        filter.pgName = {
            $regex: search,
            $options: "i"
        };
    }
    if (city) {
        filter.city = city;
    }
    if (rent) {
        filter.rent = {
            $lte: Number(rent)
        };
    }
    if (gender) {
        filter.gender = gender;
    }
    const pgs = await Admin.find(filter);
    const locations = await Admin.distinct("city");
    const wishlist = await Wishlist.find({
        userId: req.session.user.userId
    });
    const wishlistSet = new Set(
        wishlist.map(item => item.pgId.toString())
    );
    res.render("card", {
        pgs,
        locations,
        wishlistSet,
        user: req.session.user,
        isLoggedIn: true
    });
};
exports.getViewdetails = async (req,res,next) =>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    try{
         const pg = await Admin.findById(req.params.id);
          res.render('viewdetails',{
            pg:pg,
            user:req.session.user
        
    });

}catch(err){
    console.log(err);
    res.status(500).send("Error while Loading the PG");
}   
    
}
exports.getBooknow = async(req,res,next) =>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    const pg = await Admin.findById(req.params.id);
    res.render('confirmbooking',{
        pg,
        user:req.session.user
    });
}
exports.postContinuetoPayment = async(req,res,next) =>{
    try{
        const pg = await Admin.findById(req.params.id);
        const{
             mobileNumber,
            checkIn,
            checkOut,
            occupation,
            emergencyContact,
            notes
        }=req.body;
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        if(endDate<=startDate){
            return res.status(400).send('Check-out date must be after check-in date');
        }
        const days = Math.ceil((endDate-startDate)/(1000*60*60*24));
        const rentAmount = Math.ceil((pg.rent/30)*days);
        const totalAmount = rentAmount+(pg.deposit||0);
          const booking = {
            mobileNumber,
            checkIn,
            checkOut,
            occupation,
            emergencyContact,
            notes,
        };
        res.render('payment',{
            pg,
            booking,
            days,
            rentAmount,
            totalAmount,
            user:req.session.user
        });
        console.log("booking object:", booking);
    }
    catch(err){
       console.log(err);
       res.status(500).send('Error while loading the payment page');
    };
}
exports.postPaymentSuccess = async(req,res,next)=>{
    try{
        const pg = await Admin.findById(req.params.id);
        const startDate = new Date(req.body.checkIn);
        const endDate = new Date(req.body.checkOut);
         const days = Math.ceil(
            (endDate - startDate) / (1000 * 60 * 60 * 24)
        );
         const rentAmount = Math.ceil(
            (pg.rent / 30) * days
        );
        const deposit = pg.deposit || 0;

        const totalAmount = rentAmount + deposit;
        const booking = new Booking({

    userId:req.session.user.userId,
    pgId:pg._id,
    mobileNumber:req.body.mobileNumber,
    checkIn:req.body.checkIn,
    checkOut:req.body.checkOut,
    occupation:req.body.occupation,
    emergencyContact:req.body.emergencyContact,
    notes:req.body.notes,
    rentAmount:rentAmount,
    deposit:deposit,
    totalAmount:totalAmount,
    paymentStatus:'Paid',
    bookingStatus:'Confirmed'
});
await booking.save();
       console.log(req.body);
        res.render('paymentsuccess',{
            booking,
            pg,
            user:req.session.user

        });
    }
    catch(err){
        console.log(err);
        res.status(500).send(
            'Error while saving booking'
        );
    }
};
exports.getMyBookings = async(req,res,next)=>{
     if(!req.session.user){
        return res.redirect('/login');
     }
     try{
        const bookings = await Booking.find({
            userId:req.session.user.userId
        })
        .populate("pgId")
        .sort({createdAt: -1});
        res.render("mybookings",{
            bookings,
            user:req.session.user,
            isLoggedIn:true
        })
     }
     catch (err) {
        console.log(err);
        res.status(500).send("Error while loading bookings.");

    }
};