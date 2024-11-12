const User = require("../models/userModel");
const Coupon = require('../models/couponModel')
const ProductOffer = require('../models/productOffer')
const productModel = require("../models/productModel");
const CategoryOffer = require("../models/categoryOffer");
const categoryModel = require("../models/categoryModel");




const renderCoupons = async(req,res)=>{
    try {
     
      const coupons = await Coupon.find();
  
     
      res.render('coupons', { coupons });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  
  }

const addCoupons = async (req, res) => {
    try {
      const { code, discountType, discountValue, minPurchaseAmount, validity } = req.body;
  
 
      //negatvie value
      if (parseFloat(discountValue) < 0) {
        req.flash('error', 'Discount value cannot be negative');
        return res.redirect('/admin/coupons');
    }


      //already
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        req.flash('error', 'Coupon code already exists');
        return res.redirect('/admin/coupons');
      }
  
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + parseInt(validity));
     
      if(parseFloat(validity) < 0 ){
        req.flash('error', 'ExpiryDate Cannot Be Negative');
        return res.redirect('/admin/coupons');
      }


      if (parseFloat(discountValue) > parseFloat(minPurchaseAmount)) {
        console.log(discountValue + ' discountValue');
        console.log(minPurchaseAmount + ' minPurchaseAmount');
        req.flash('error', 'Discount value cannot exceed minimum purchase amount');
        return res.redirect('/admin/coupons');
      }
      const newCoupon = new Coupon({
        code,
        discountType,
        discountValue,
        minPurchaseAmount,
        validity: expiryDate
      });
  
      await newCoupon.save();
  
      req.flash('success', 'Coupon added successfully');
      res.redirect('/admin/coupons');
    } catch (error) {
      console.error('Error adding coupon:', error);
      req.flash('error', 'An error occurred while adding the coupon');
      res.redirect('/admin/coupons');
    }
  };
  
  



  const removeCoupon = async (req, res) => {
    try {
      const couponId = req.params.couponId;
  
 
      await User.updateMany(
        { "availableCoupons.couponId": couponId },
        { $pull: { availableCoupons: { couponId } } }
      );
  
    
      await User.updateMany(
        { usedCoupons: couponId },
        { $pull: { usedCoupons: couponId } }
      );
  
    
      await Coupon.findByIdAndDelete(couponId);
  
      res.status(200).json({ message: 'Coupon removed successfully' });
    } catch (error) {
      console.error("Error in removeCoupon:", error);
      res.status(500).json({ error: 'Failed to remove coupon' });
    }
  };
  
  



  const renderOffers = async (req, res) => {
    try {
      const offers = await ProductOffer.find().populate('productId');
      
      res.render('productOffer', { offers });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Error fetching offers");
    }
  };
  

const addOffer = async (req, res) => {
  try {
   const products = await productModel.find({})
   res.render('addProductOffer',{products})
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ error: 'An error occurred while adding the offer' });
  }
};


const addProductOffer = async (req, res) => {
  try {
    const { description, selectedProduct, discountValue, startDate, endDate } = req.body;

    
    if (discountValue > 50) {
      req.flash('error', 'Offer should be below 50%');
      return res.redirect('/admin/addOffer');
    }

  //   if (parseFloat(discountValue) < 0) {
  //     req.flash('error', 'Discount value cannot be negative');
  //     return res.redirect('/admin/coupons');
  // }

  //already
  if(parseFloat(discountValue)< 0) {
    req.flash('error', 'Discount offer cannot be negative');
    return res.redirect('/admin/addOffer')
  }
    
    const existingOffer = await ProductOffer.findOne({
      productId: selectedProduct,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }, 
      ],
    });

    if (existingOffer) {
      req.flash('error', 'This product already has an active offer during the selected period.');
      return res.redirect('/admin/addOffer');
    }

    
    const productOffer = new ProductOffer({
      description: description,
      discountValue: discountValue,
      startDate: startDate,
      endDate: endDate,
      productId: selectedProduct,
    });

    await productOffer.save();
    res.redirect('/admin/product-offers');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};




const removeProductOffer  = async(req,res)=>{
  try{
 const {offerId} = req.params

 const productWithId = await ProductOffer.findById(offerId)

 await productWithId.deleteOne()
 res.json(200)
  }catch(error){
    console.log(error.message)
  }
}


const renderCategoryOffer = async(req,res)=>{
  try{
    const offers = await CategoryOffer.find().populate('categoryId'); 
res.render('categoryOffers',{offers})
  }catch(error){
    console.log(error.message);
  }
}

const renderAddCategoryOffer =  async (req, res) => {
  try {
   const categories = await categoryModel.find({})
   res.render('addCategoryOffer',{categories})
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ error: 'An error occurred while adding the offer' });
  }
};

const AddCategoryOffer = async (req, res) => {
  try {
    const { description, selectedCategory, discountValue, startDate, endDate } = req.body;

    
    if (discountValue > 50) {
      req.flash('error', 'Offer should be below 50%');
      return res.redirect('/admin/addCategoryOffer');
    }


    //negative 
    if (parseFloat(discountValue)< 0){
      req.flash('error', 'Discount Offer Cannot be negative');
      return res.redirect('/admin/addCategoryOffer');
    }

    
    const existingOffer = await CategoryOffer.findOne({
      categoryId: selectedCategory,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }, 
      ],
    });

    if (existingOffer) {
      req.flash('error', 'This category already has an active offer during the selected period.');
      return res.redirect('/admin/addCategoryOffer');
    }

    
    const categoryOffer = new CategoryOffer({
      description: description,
      discountValue: discountValue,
      startDate: startDate,
      endDate: endDate,
      categoryId: selectedCategory,
    });

    await categoryOffer.save();
    res.redirect('/admin/category-offers');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const removeCategoryOffer = async(req,res)=>{
  try{
 const {offerId} = req.params

 const categroyWithId = await CategoryOffer.findById(offerId)

 await categroyWithId.deleteOne()
 res.json(200)
  }catch(error){
    console.log(error.message)
  }
}

const calculateFinalPrice = async (productId, originalPrice) => {
  try {
    const currentDate = new Date();
    
   
    const product = await Products.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    let priceAfterCategoryOffer = originalPrice;

   
    const categoryOffer = await CategoryOffer.findOne({
      categoryId: product.categoryId, 
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    if (categoryOffer) {
      const categoryDiscount = categoryOffer.discountValue / 100;
      priceAfterCategoryOffer = originalPrice - (originalPrice * categoryDiscount);
      console.log(`Price after applying category offer: ${priceAfterCategoryOffer}`);
    }

   // Check for active product offer
    let finalPrice = priceAfterCategoryOffer;
    const productOffer = await ProductOffer.findOne({
      productId: productId,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    if (productOffer) {
      const productDiscount = productOffer.discountValue / 100;
      finalPrice = priceAfterCategoryOffer - (priceAfterCategoryOffer * productDiscount);
      console.log(`Price after applying product offer: ${finalPrice}`);
    }

    return finalPrice;
  } catch (error) {
    console.error("Error calculating final price:", error.message);
    throw new Error("Failed to calculate final price");
  }
};


module.exports = {
    renderCoupons,
    addCoupons,
    removeCoupon,
    renderOffers,
    addOffer,
    addProductOffer,
    removeProductOffer,
    renderCategoryOffer,
    renderAddCategoryOffer,
    AddCategoryOffer,
    removeCategoryOffer,
    calculateFinalPrice
}