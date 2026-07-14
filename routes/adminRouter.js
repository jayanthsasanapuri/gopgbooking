const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');

adminRouter.get('/dashboard', adminController.getDashboard);
adminRouter.get('/addnewpg', adminController.getAddNewPG);
adminRouter.post('/addnewpg', adminController.postAddNewPG);
adminRouter.get('/pgs', adminController.getPGs);
adminRouter.get('/editpg/:id', adminController.getEditPG);
adminRouter.get('/deletepg/:id', adminController.postdeletePG);
adminRouter.post('/deletepg/:id', adminController.postdeletePG);
adminRouter.post('/editpg/:id', adminController.postEditPG);
adminRouter.get('/bookings', adminController.getBookings);
module.exports = adminRouter;