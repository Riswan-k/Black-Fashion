const Category = require("../models/categoryModel");
const Products = require("../models/productModel");


const renderProducts = async (req, res) => {
    try {
        const productData = await Products.find();
        res.render("products", { productData });
    } catch (error) {
        console.log(error.message);
    }
};

const renderAddProducts = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_listed: true });

        res.render("addproduct", { categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const insertProducts = async (req, res) => {
    try {
   
        const { name, description, price, quantity, size, category } = req.body;
    
        const existingProduct = await Products.findOne({ name: name.trim().toLowerCase() });
        if (existingProduct) {
          req.flash('error', 'Product already exists');
          return res.redirect('/admin/addproduct');
        }

        if(parseFloat(quantity) < 0){
            req.flash('error', 'Quantity not an Negative');
            return res.redirect('/admin/addproduct');
        }

        if(parseFloat(price) < 0){
            req.flash('error', 'price not Negative Number');
             return res.redirect('/admin/addproduct');
        }
    
        const uploadedImageName = req.files.mainImage ? req.files.mainImage[0].filename : '';
        const uploadedScreenshots = req.files.screenshots ? req.files.screenshots.map(file => file.filename) : [];
    
        const newProduct = new Products({
          name,
          description,
          price,
          mainImage: uploadedImageName,
          screenshots: uploadedScreenshots,
          quantity,
          size,
          category
        });
    
        const productData = await newProduct.save();
        req.flash('success', 'Product added successfully');
        res.redirect('/admin/products');
      } catch (error) {
        console.log(error.message);
        req.flash('error', 'An error occurred while adding the product');
        res.redirect('/admin/addproduct');
      }
};





const listProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const productData = await Products.findByIdAndUpdate(productId, { $set: { is_listed: true } }, { new: true });
        if (productData) {
            return res.status(200).send({ success: "Product listed successfully", redirect: "/admin/product" });
        } else {
            return res.status(404).send({ error: "Product not found" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ error: "Internal server error" });
    }
};

const unlistProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const productData = await Products.findByIdAndUpdate(
            productId,
            { $set: { is_listed: false } },
            { new: true }
        );
        if (productData) {
            return res.status(200).send({ success: "Product unlisted successfully", redirect: "/admin/product" });
        } else {
            return res.status(404).send({ error: "Product not found" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ error: "Internal server error" });
    }
};


const renderEditProduct = async (req, res) => {
    try {
      const productId = req.query.id;
      const productData = await Products.findById(productId);
  
      if (productData) {
        const categoryData = await Category.find(); 
        res.render('editproduct', { product:productData, categoryData,productData }); 
      } else {
        req.flash('error', 'Product not found');
        res.redirect('/admin/products');
      }
    } catch (error) {
      console.log(error.message);
      req.flash('error', 'An error occurred while fetching the product');
      res.redirect('/admin/products');
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
  

        const { name, category, description, quantity, price, size } = req.body;

 
        const existingProduct = await Products.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        if(price < 0){
            return res.status(404).json("Price Cannot be a Negative Number")
        }

        if(quantity < 0){
            return res.status(404).json('Quantity Cannot be a Negative Number');
        }
        
        existingProduct.name = name;
        existingProduct.category = category;
        existingProduct.description = description;
        existingProduct.quantity = quantity;
        existingProduct.price = price;
        existingProduct.size = size;


        if (req.files && req.files['mainImage']) {
            const mainImage = req.files['mainImage'][0];
            existingProduct.mainImage = mainImage.filename;
        }

        if (req.files && req.files['screenshots']) {
            const screenshots = req.files['screenshots'].map(file => file.filename);
            existingProduct.screenshots = screenshots;
        }

        await existingProduct.save();

        return res.status(200).json({ message: "Product updated successfully", redirect: "/admin/products" });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "An error occurred while updating the product" });
    }
};
// soft delete
// const deleteProduct = async (req, res) => {
//     const { productId } = req.body;
  
//     try {
//       await Products.findByIdAndUpdate(productId, { is_deleted: true }); // Soft delete
//       res.status(200).send({ success: true });
//     } catch (error) {
//       console.error("Error deleting product:", error.message);
//       res.status(500).send({ success: false, error: "Failed to delete product" });
//     }
//   };

//hard delete 
const deleteProduct = async (req, res) => {
    const { productId } = req.body;
  
    try {
      await Products.findByIdAndDelete(productId); // Hard delete
      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error.message);
      res.status(500).send({ success: false, error: "Failed to delete product" });
    }
  };
  

  module.exports = {
    renderProducts,
    renderAddProducts,
    insertProducts,
    listProduct,
    unlistProduct,
    renderEditProduct,
    updateProduct,
    deleteProduct
  }