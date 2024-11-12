const Products = require('../models/productModel')
const User = require("../models/userModel");
const Address = require("../models/userAddress");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Coupons =  require('../models/couponModel')
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const { razorpay_id, razorpay_secret } = process.env
const Razorpay = require("razorpay");



const razorpayInstance = new Razorpay({
    key_id: razorpay_id,
    key_secret: razorpay_secret
})

const renderProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect("/login");
        }

        const userData = await User.findById(userId);

        if (!userData) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        res.render("profile", { userData });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const renderEditProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect("/login");
        }

        const userData = await User.findById(userId);

        if (!userData) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        res.render("editprofile", { userData });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
      const userId = req.session.userId;
      let { name = '', mobile = '' } = req.body;

      name = name.trim();
  
      mobile = mobile.trim();
  
      
      if (name === "" || mobile === "") {
        req.flash('error', 'All fields are required');
        return res.redirect('/edit-profile');
      }
  

      const nameRegex = /^[a-zA-Z ]+$/;
      if (!nameRegex.test(name)) {
        req.flash('error', 'Please enter a valid name ');
        return res.redirect('/edit-profile');
      }
  
    
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
        req.flash('error', 'Please enter a valid number');
        return res.redirect('/edit-profile');
      }
  

      const updatedProfile = await User.findByIdAndUpdate(userId, { name,mobile }, { new: true });
  
      if (updatedProfile) {
        res.redirect("/profile");
      } else {
        req.flash('error', 'Failed to update profile');
        res.redirect('/edit-profile');
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  

const renderaddress = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect("/login");
        }

        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        const addresses = await Address.find({ userId });

        res.render("address", { userData: user, addresses });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const renderAddNewAddress = async (req, res) => {
    try {
        res.render("addnewaddress");
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const insertNewAddress = async (req, res) => {
    try {
      const userId = req.session.userId;
      const { pincode, locality, address, city, state, addresstype } = req.body;
      const trimmedPincode = pincode.trim();
      const trimmedLocality = locality.trim();
      const trimmedAddress = address.trim();
      const trimmedCity = city.trim();
      const trimmedState = state.trim();

  
      if (!userId) {
        req.flash("error", "You must be logged in to perform this action");
        return res.redirect("/login");
      }
      if (!trimmedPincode || !trimmedLocality || !trimmedAddress || !trimmedCity || !trimmedState) {
        req.flash("error", "All fields are required");
        return res.redirect("/add-address");
      }
     
  
      let numRegex = /^\d+$/
      const pincodeRegex = /^\d{6}$/;  
      if (!pincodeRegex.test(trimmedPincode)) {
        req.flash("error", "Enter a valid pincode");
        return res.redirect("/add-address");
      }
  
      const allFieldsAreSpaces = Object.values(req.body).every(
        (value) => value.trim() === ""
      );
      if (allFieldsAreSpaces) {
        req.flash("error", "All fields cannot be empty or contain only spaces");
        return res.redirect("/add-address");
      }
      if(numRegex.test(trimmedLocality||trimmedAddress||trimmedCity||trimmedCity)){
        req.flash("error", "Enter a valid address");
        return res.redirect("/add-address");
      }
    
      const newAddress = new Address({
        userId,
        pincode,
        locality,
        address,
        city,
        state,
        addresstype,
      });
  
      const userAddress = await newAddress.save();
  
      req.session.useraddress = userAddress;
      req.flash("success", "Address added successfully");
      res.redirect("/address");
    } catch (error) {
      console.log(error.message);
      req.flash("error", "Internal server error");
      res.redirect("/address");
    }
  };
  
  
  

const renderEditAddress = async (req, res) => {
    try {
        console.log("jhsdgfkhsgdfhasdghj");
        const userId = req.session.userId;
        console.log(`userId is ${userId}`);
        if (!userId) {
            return res.redirect("/login");
        }

        const addressId = req.query.id;
        console.log(addressId);
        const address = await Address.findById(addressId);
        console.log(address);

        if (!address || address.userId !== userId) {
            return res.status(404).send("Address not found");
        }

        res.render("editaddress", { userData: [address] });
    } catch (error) {
        console.error("Error rendering edit address:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const updateAddress = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            req.flash("error", "You must be logged in to perform this action");
            return res.redirect("/login");
        }

        const addressId = req.body.addressId;
        const { pincode, locality, address, city, state, addresstype } = req.body;

        const pincodeRegex = /^\d+$/;
        if (!pincodeRegex.test(pincode)) {
            req.flash("error", "Pincode must contain only numbers");
            return res.redirect("/edit-address");
        }
        const existingAddress = await Address.findOne({ _id: addressId, userId });

        if (!existingAddress) {
            req.flash("error", "Address not found or does not belong to the user");
            return res.status(404).send("Address not found or does not belong to the user");
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { pincode, locality, address, city, state, addresstype },
            { new: true }
        );

        if (updatedAddress) {
            req.flash("success", "Address updated successfully");
            return res.redirect("/address");
        } else {
            req.flash("error", "Failed to update address");
            return res.status(500).send("Failed to update address");
        }
    } catch (error) {
        console.log(error.message);
        req.flash("error", "Internal server error");
        return res.redirect("/edit-address");
    }
};

const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const address = await Address.findOne({ _id: addressId, userId });

        if (!address) {
            console.log("Address not found or does not belong to the user");
            return res.status(404).json({ error: "Address not found or does not belong to the user" });
        }

        await Address.findByIdAndDelete(addressId);

        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


const renderMyOrder = async (req, res) => {
    try {
      if (req.session.userId) {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const orderData = await Order.find({ userId })
          .sort({createdAt:-1})
          .populate('orderedItem.productId')
          .populate('deliveryAddress');
        
        res.render('myorders', { orderData, userData: user });
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  

  const renderOrderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId, orderItemId } = req.query;

        const userData = await User.findById(userId);

        const orderData = await Order.findOne({
            userId: userId,
            'orderedItem.productId': productId,
            'orderedItem._id': orderItemId
        })
        .populate('orderedItem.productId')
        .populate('userId')
        .populate('deliveryAddress');

        if (!orderData) {
            return res.render("orderdetails", { message: "Order details not found." });
        }

        const specificProduct = orderData.orderedItem.find(item => item._id.toString() === orderItemId);

        res.render("orderdetails", { orderData, specificProduct, userData });
    } catch (error) {
        console.log(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};




const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderItemId, cancelReason } = req.body;

        if (!userId) {
            console.log("Unauthorized: No user ID found in session");
            return res.status(401).json({ error: "Unauthorized" });
        }

  

        const order = await Order.findOne({ 'orderedItem._id': orderItemId, userId }).populate("orderedItem.productId");

        if (!order) {
            console.log("Order not found or does not belong to the user");
            return res.status(404).json({ error: "Order not found or does not belong to the user" });
        }

        const orderedItem = order.orderedItem.find(item => item._id.toString() === orderItemId);

        if (!orderedItem) {
            console.log("Ordered item not found");
            return res.status(404).json({ error: "Ordered item not found" });
        }

        if (orderedItem.status === "Cancelled") {
            console.log("Product is already cancelled");
            return res.status(400).json({ error: "Product is already cancelled" });
        }

        
        const baseRefundAmount = orderedItem.discountedPrice ? orderedItem.discountedPrice * orderedItem.quantity: orderedItem.totalProductAmount* orderedItem.quantity;
        const refundAmount = order.deliveryCharge ? baseRefundAmount + order.deliveryCharge : baseRefundAmount;


        orderedItem.status = "Cancelled";
        orderedItem.reason = cancelReason;
        await order.save();

        if (order.paymentMethod !== "cashOnDelivery") {
            const userWallet = await Wallet.findOne({ userId });
            if (!userWallet) {
                console.log("Wallet not found for user");
                return res.status(404).json({ error: "Wallet not found" });
            }

            userWallet.balance += refundAmount;
            userWallet.transactions.push({
                amount: refundAmount,
                transactionMethod: "Refund",
                date: new Date(),
            });
            await userWallet.save();
        }

        const product = await Products.findById(orderedItem.productId._id);
        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ error: "Product not found" });
        }

        product.quantity += orderedItem.quantity;
        await product.save();

        res.status(200).json({ success: "Order cancelled successfully", refundAmount: order.paymentMethod !== "cashOnDelivery" ? refundAmount : 0 });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};




const returnOrderRequest = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderItemId, productId, returnReason } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const order = await Order.findOne({ 'orderedItem._id': orderItemId, userId }).populate("orderedItem.productId");

        if (!order) {
            return res.status(404).json({ error: "Order not found or does not belong to the user" });
        }


        const orderedItem = order.orderedItem.find(item => item._id.toString() === orderItemId && item.productId._id.toString() === productId);

        if (!orderedItem) {
            return res.status(404).json({ error: "Ordered item not found" });
        }

        if (orderedItem.status === "Returned") {
            return res.status(400).json({ error: "Product is already Returned" });
        }

       
        orderedItem.status = "returnrequested";
        orderedItem.reason = returnReason;

  
        await order.save();

        res.status(200).json({ success: "Return request submitted successfully" });

    } catch (error) {
        console.error("Error returning order:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};







const renderRefferal = async(req,res)=>{
    try{
        const userId = req.session.userId
        const userData = await User.findById(userId);
        res.render('refferal',{userData})
    }catch(error){
        console.log(error.message);
    }
}




const renderCoupon = async (req, res) => {
    try {
        const userId = req.session.userId;

        const userData = await User.findById(userId);

        if (!userData) {
            req.flash("error", "User not found.");
            return res.redirect("/login");
        }

        const userCoupons = userData.availableCoupons;

        if (!userCoupons || userCoupons.length === 0) {
            return res.render('coupons', { couponData: [], userData });
        }


        const allCoupons = await Coupons.find({ _id: { $in: userCoupons.map(coupon => coupon.couponId) } });
        

        const currentDate = new Date();
        const couponData = allCoupons.map(coupon => {
            const isExpired = new Date(coupon.validity) < currentDate;
            const isUsed = userData.usedCoupons.includes(coupon._id.toString());
            return {
                ...coupon.toObject(),
                isExpired,
                isUsed
            };
        });

        res.render('coupons', { couponData, userData });
    } catch (error) {
        console.log(error.message);
        req.flash("error", "Internal server error");
        res.redirect("/dashboard");
    }
}



const initiatePayment = async (req, res) => {
    try {
      const { orderId } = req.body;
  

      const orderDetails = await Order.findById(orderId);
  
      if (!orderDetails) {
        return res.status(404).json({ message: "Order not found" });
      }
  
 
      if (orderDetails.paymentStatus) {
        return res.status(400).json({ message: "This order has already been paid" });
      }
  
      const orderAmount = orderDetails.orderAmount;
  
 
      if (orderAmount < 1) {
        return res.status(400).json({ message: "Order amount must be at least ₹1" });
      }
  

      const options = {
        amount: Math.round(orderAmount * 100), 
        currency: "INR",
        receipt: `order_${orderId}`,
      };
  
      razorpayInstance .orders.create(options, async (err, order) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to create Razorpay order" });
        }
  
        
        orderDetails.razorpayOrderId = order.id;
        await orderDetails.save();
  
        res.json({
          success: true,
          razorpayKey: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          orderId: order.id,
        });
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
const verifyPayment = async (req, res) => {
    try {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;


        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", razorpay_secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {

            const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus: true }, { new: true });
            if (!updatedOrder) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }
  
        if (updatedOrder) {

          updatedOrder.paymentStatus = true;
          await updatedOrder.save();
  
          res.json({ success: true, message: "Payment verified and status updated" });
        } else {
          res.status(404).json({ success: false, message: "Order not found" });
        }
      } else {
        res.status(400).json({ success: false, message: "Invalid payment verification" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };


  const generateInvoice = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const order = await Order.findById(orderId)
            .populate('orderedItem.productId')
            .populate('deliveryAddress');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const specificProduct = order.orderedItem.find(item => item.productId._id.toString() === productId);

        if (!specificProduct) {
            return res.status(404).send('Product not found in the order');
        }

        const doc = new PDFDocument({ margin: 50 });
        let filename = `Invoice-${order._id}-${productId}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        const generateHr = (y) => {
            doc.strokeColor("#aaaaaa")
                .lineWidth(1)
                .moveTo(50, y)
                .lineTo(550, y)
                .stroke();
        };

        const formatCurrency = (amount) => {
            return "Rs. " + (amount / 100).toFixed(2);
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        let pageNumber = 1;
        doc.on('pageAdded', () => {
            pageNumber++;
            doc.text(`Page ${pageNumber}`, 50, 750, { align: 'center' });
        });

        doc.fillColor("#444444")
            .fontSize(28)
            .text("BLACK FASHION", 50, 50, { align: 'center' })
            .fontSize(14)
            .text("Invoice", 50, 80, { align: 'center' })
            .moveDown();

        doc.fontSize(20)
            .text("Invoice", 50, 160);

        generateHr(185);

        const customerInformationTop = 200;
        doc.fontSize(10)
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(formatDate(order.createdAt), 150, customerInformationTop + 15)
            .font("Helvetica-Bold")
            .text("Shipping Address:", 300, customerInformationTop)
            .font("Helvetica")
            .text(order.deliveryAddress.address, 300, customerInformationTop + 15)
            .text(`${order.deliveryAddress.locality}, ${order.deliveryAddress.city}`, 300, customerInformationTop + 30)
            .text(`${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`, 300, customerInformationTop + 45);

        generateHr(customerInformationTop + 70);

        const invoiceTableTop = 330;

        doc.font("Helvetica-Bold");
        generateTableRow(
            doc,
            invoiceTableTop,
            "Item",
            "Quantity",
            "Unit Price",
            "Total"
        );
        generateHr(invoiceTableTop + 20);
        doc.font("Helvetica");

        const position = invoiceTableTop + 30;
        generateTableRow(
            doc,
            position,
            specificProduct.productId.name,
            specificProduct.quantity,
            formatCurrency(specificProduct.priceAtPurchase * 100),
            formatCurrency(specificProduct.priceAtPurchase *specificProduct.quantity* 100)
        );

        generateHr(position + 20);

        const subtotalPosition = position + 30;    
        generateTableRow(
            doc,
            subtotalPosition,
            "",
            "",
            "Subtotal",
            formatCurrency(specificProduct.priceAtPurchase *specificProduct.quantity* 100)
        );

        const discountPosition = subtotalPosition + 20;
        const discount = (specificProduct.priceAtPurchase - specificProduct.discountedPrice)*specificProduct.quantity * 100;
        generateTableRow(
            doc,
            discountPosition,
            "",
            "",
            "Discount",
            formatCurrency(discount)
        );

        const totalPosition = discountPosition + 25;
        doc.font("Helvetica-Bold");
        generateTableRow(                                            
            doc,
            totalPosition,
            "",
            "",
            "Total",
            formatCurrency(specificProduct.discountedPrice *specificProduct.quantity * 100)
        );
        doc.font("Helvetica");

        doc.fontSize(10)
            .text(
                "Thank you for your business. For any queries, please contact support@yourcompany.com",
                50,
                700,
                { align: "center", width: 500 }
            );

        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

function generateTableRow(doc, y, item, quantity, unitCost, total) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(quantity, 280, y, { width: 90, align: "right" })
        .text(unitCost, 370, y, { width: 90, align: "right" })
        .text(total, 0, y, { align: "right" });
}

const addReview = async(req,res)=>{
  try{
      const { productId, userId, reviewText, starRating } = req.body;

     
      const product = await Products.findById(productId);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
    
      const newReview = {
        userId,
        reviewText,
        starRating
      };
  
    
      product.reviews.push(newReview);
      await product.save();
  
      res.status(200).send('Review submitted successfully!');

  }catch(error){
      console.log(error.message)
  }
}

  
  

module.exports = {
    renderProfile,
    renderEditProfile,
    updateProfile,
    renderaddress,
    renderAddNewAddress,
    insertNewAddress,
    renderEditAddress,
    updateAddress,
    deleteAddress,

    cancelOrder,
    returnOrderRequest,
    renderOrderDetails,
    renderMyOrder,
    renderRefferal,
    renderCoupon,
    initiatePayment,
    verifyPayment,
    generateInvoice,
    addReview
};