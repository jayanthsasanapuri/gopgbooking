const Admin = require('../models/AdminModel');
const Booking = require('../models/BookingModel');
exports.getDashboard = (req,res,next)=>{
    const successMessage = req.session.successMessage;
    req.session.successMessage = null;
    if(!req.session.admin){
        return res.redirect('/login');
    }
    res.render('admin/dashboard',{isLoggedIn:true,successMessage});
  }
exports.getAddNewPG = (req,res,next)=>{
    req.session.successMessage = null;
  res.render('admin/addnewpg',{
    isAdmin:true,
    isEdit:false,
    pg:null,
    successMessage:req.session.successMessage
  });
}
exports.postAddNewPG = async (req,res,next)=>{
   const admin = new Admin({
            pgName:req.body.pgName,
            pgType:req.body.pgType,
            description:req.body.description,
            state:req.body.state,
            city:req.body.city,
            area:req.body.area,
            landmark:req.body.landmark,
            address:req.body.address,
            rent:req.body.rent,
            deposit:req.body.deposit,
            maintenance:req.body.maintenance,
            roomType:req.body.roomType,
            capacity:req.body.capacity,
            availableRooms:req.body.availableRooms,
            gender:req.body.gender,
            amenities:req.body.amenities || [],
            imageUrl:req.body.imageUrl,
            ownerName:req.body.ownerName,
            phone:req.body.phone,
            email:req.body.email

        });
        await admin.save().
        then(()=>{
            req.session.successMessage = 'PG added successfully.';
            
          res.redirect('/admin/dashboard');
        }).catch(err=>{
            console.log(err);
            res.status(500).send('Error saving PG details.Please try again');
        });

}
exports.getPGs = async (req,res,next)=>{
     const successMessage = req.session.successMessage;
    req.session.successMessage = null;
    const pgs = await Admin.find();
    res.render('admin/PGListings',{
        pgs:pgs,
        isEdit:false,
        successMessage
        
    });
}
exports.postdeletePG = async (req,res,next)=>{
    await Admin.findByIdAndDelete(req.params.id).
    then(()=>{
        req.session.successMessage = 'PG deleted successfully.';
        res.redirect('/admin/pgs');
    }).catch(err=>{
        console.log(err);
        res.status(500).send('Error deleting PG. Please try again.');
    })
}
exports.postEditPG = async (req,res,next)=>{
    await Admin.findByIdAndUpdate(req.params.id,{
         pgName: req.body.pgName,
                pgType: req.body.pgType,
                description: req.body.description,
                state: req.body.state,
                city: req.body.city,
                area: req.body.area,
                landmark: req.body.landmark,
                address: req.body.address,
                rent: req.body.rent,
                deposit: req.body.deposit,
                maintenance: req.body.maintenance,
                roomType: req.body.roomType,
                capacity: req.body.capacity,
                availableRooms: req.body.availableRooms,
                gender: req.body.gender,
                amenities: req.body.amenities || [],
                imageUrl: req.body.imageUrl,
                ownerName: req.body.ownerName,
                phone: req.body.phone,
                email: req.body.email
    }).then(()=>{
        req.session.successMessage = 'PG details updated successfully.';
        res.redirect('/admin/pgs');
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send('Error updating PG details. Please try again.');
    })

}
exports.getEditPG = async(req,res,next)=>{
    req.session.successMessage = null;
    const pg = await Admin.findById(req.params.id)
    .then(pg=>{
        res.render('admin/addnewpg',{
            isEdit:true,
            pg:pg,
            successMessage:req.session.successMessage
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send('Error fetching PG details. Please try again.');
    })
}
exports.getBookings = async(req,res,next)=>{
    try{
        const bookings = await Booking.find().populate('pgId').populate('userId');
        res.render('admin/bookings',{
            bookings:bookings,
            isAdmin:true
        });
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error fetching bookings. Please try again.');
    }
        
    
};