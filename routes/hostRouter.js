const express = require('express');
const hostRouter = express.Router();
const hostController = require('../controllers/hostController');

hostRouter.get('/booknow', hostController.getbooknow);
hostRouter.get('/card', hostController.getCard);
hostRouter.get('/viewdetails/:id',hostController.getViewdetails);
hostRouter.get('/confirmbooking/:id',hostController.getBooknow);
hostRouter.post('/payment/:id',hostController.postContinuetoPayment);
hostRouter.post('/paymentsuccess/:id',hostController.postPaymentSuccess);
hostRouter.get('/mybookings',hostController.getMyBookings);
module.exports = hostRouter;