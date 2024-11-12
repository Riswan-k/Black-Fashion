const express = require('express')
const userRoute = express()
const profileController = require('../controllers/userProfileController')
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const walletController = require('../controllers/walletController');
const userVerificationController = require("../controllers/userVerification");
const orderController = require('../controllers/orderController');
userRoute.set('views','./views/users')

const userAuth = require('../middlewares/userAuth')
const passport = require('passport')


userRoute.get('/search', userController.searchProducts); 
 

/***************************************************** HOME,SHOP,PRODUCT_DETAILS,WOMEN ***************************************************************************************/


userRoute.get('/',userController.renderHome)
userRoute.get('/shop',userController.renderShop)
userRoute.get('/productDetails/:productId',userController.renderProductDetails);
userRoute.get('/women',userController.renderWomen)
userRoute.get('/mens',userController.renderMens)
userRoute.get('/sort/:category/:criteria', userController.sortProducts);
userRoute.get('/wishlist',userController.renderWishlist)
userRoute.get('/addToWishlist',userController.addToWishlist)
userRoute.get('/RemoveFromWishlist',userController.RemoveFromWishlist)
   





/***************************************************** USER SIGNUP,SIGN IN,LOGOUT ***************************************************************************************/

userRoute.get('/signUp',userAuth.is_logout,userVerificationController.renderSignUp)
userRoute.post('/signUp',userVerificationController.insertUser)
userRoute.get('/login',userAuth.is_logout,userVerificationController.renderLogin)
userRoute.post('/login',userVerificationController.verifyLogin)
userRoute.get('/logout',userAuth.is_login,userVerificationController.logout)
userRoute.get('/forgotPassword',userVerificationController.renderForgotPassword)
userRoute.post('/findAccount',userVerificationController.findAccount)
userRoute.post('/verifyAccount',userVerificationController.sendOtp)
userRoute.get('/resetotp',userVerificationController.loadResetotp)
userRoute.post('/verifyResetOtp',userVerificationController.verifyResetOtp)
userRoute.get('/changePassword',userVerificationController.renderChangePassword)
userRoute.post('/resetPassword',userVerificationController.changePassword)
userRoute.get('/otp',userAuth.is_logout,userVerificationController.renderOtp)
userRoute.post('/verifyOTP',userVerificationController.verifyOtp);
userRoute.get('/resendOtp',userAuth.is_logout,userVerificationController.resendOtp)


userRoute.get('/orderplaced',userAuth.is_login,cartController.renderOrderPlaced)



const { renderHome } = require('../controllers/userController');



// Google OAuth Routes
userRoute.get('/auth', passport.authenticate('google', { 
  scope: ['email', 'profile'],
  prompt: 'select_account'  
}));

userRoute.get('/home', (req, res) => {
  if (req.user) {
      req.session.userId = req.user;
      res.render('home', { userData: req.user });
  } else {
      res.redirect('/login');
  }
});

userRoute.get('/auth/google/callback', passport.authenticate('google', { 
  failureRedirect: '/login',
  successRedirect: '/home'
}));



/***************************************************** USER PROFILE ***************************************************************************************/

userRoute.get('/profile',profileController.renderProfile)
userRoute.get('/edit-profile',profileController.renderEditProfile)
userRoute.post('/edit-profile',profileController.updateProfile)
userRoute.get('/address',profileController.renderaddress)
userRoute.get('/add-address',profileController.renderAddNewAddress)
userRoute.post('/add-address',profileController.insertNewAddress)
userRoute.get('/edit-address',profileController.renderEditAddress)
userRoute.post('/update-address',profileController.updateAddress)
userRoute.delete('/delete-address/:id', profileController.deleteAddress);
userRoute.get('/coupons',userAuth.is_login,profileController.renderCoupon)




/***************************************************** CART ***************************************************************************************/

userRoute.get('/cart',userAuth.is_login,cartController.renderCart);
userRoute.get('/addToCart',userAuth.is_login,cartController.addToCart);


userRoute.get('/checkout',userAuth.is_login,cartController.loadCheckout)
userRoute.post('/updateCartItem',userAuth.is_login,cartController.updateCartItem)
userRoute.post('/removeCartItem',userAuth.is_login,cartController.removeCartItem)
userRoute.post('/placeOrder',userAuth.is_login,cartController.placeOrder)
userRoute.post('/applyCoupon', userAuth.is_login, cartController.applyCoupon);
userRoute.post('/removeCoupon', userAuth.is_login, cartController.removeCoupon);
userRoute.post('/verifyRazorpayPayment',userAuth.is_login, cartController.verifyRazorpayPayment);
userRoute.get('/addNewAddress',userAuth.is_login,cartController.addNewAddress)
userRoute.post('/addCheckoutAddress',userAuth.is_login,cartController.insertCheckoutAddress)
userRoute.delete('/removeAddress/:id',userAuth.is_login,cartController.removeAddress)



/************************************Orders******************************************/ 

userRoute.get('/myOrders',userAuth.is_login,profileController.renderMyOrder)
userRoute.get('/orderDetails',userAuth.is_login,profileController.renderOrderDetails)
userRoute.post('/cancelOrder', userAuth.is_login,profileController.cancelOrder);
userRoute.get('/refferal',userAuth.is_login,profileController.renderRefferal)
userRoute.post('/returnOrder',userAuth.is_login,profileController.returnOrderRequest)


/************************************* Wallet ********************************/

userRoute.get('/Wallet',userAuth.is_login,walletController.renderWallet)
userRoute.post('/add-money',userAuth.is_login,walletController.addMoneyToWallet);

userRoute.post('/initiatePayment',userAuth.is_login,profileController.initiatePayment);
userRoute.post('/verifyPayment', userAuth.is_login,profileController.verifyPayment);
userRoute.get('/invoice/:orderId/:productId', userAuth.is_login,profileController.generateInvoice);



userRoute.get('*', (req, res, next) => {
  if (req.url.startsWith('/admin')) {
    return next();
  }else if (req.url.startsWith('/auth/callback')) {
    return next();
  }
  res.render('404'); 
});


module.exports = userRoute;