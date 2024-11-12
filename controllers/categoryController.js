const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

const renderCategory = async (req, res) => {
    try {
        const categoryData = await Category.find();
        return res.render("category", { categoryData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const renderAddCategory = async (req, res) => {
    try {
        return res.render("addcategory");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const insertCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const inputCat = name.trim().toLowerCase().replace(/\s+/g, "");

        if (!inputCat) {
            req.flash("error", "Category name cannot be empty. Please enter a valid name.");
            return res.redirect("/admin/addcategory");
        }

        const existingCategory = await Category.findOne({ name: inputCat });

        if (existingCategory) {
            req.flash("error", "Category already exists.");
            return res.redirect("/admin/addcategory");
        }

        const uploadedImageName = req.file ? req.file.filename : '';
        const category = new Category({ name: inputCat, categoryImage: uploadedImageName });
        await category.save();

        req.flash("success", "Category added successfully!");
        return res.redirect("/admin/category");
    } catch (error) {
        console.error(error.message);
        req.flash("error", "An error occurred while adding the category.");
        return res.redirect("/admin/addcategory");
    }
};

const renderEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findById(id);
        if (categoryData) {
            return res.render("editcategory", { category: categoryData });
        } else {
            req.flash("error", "Category not found");
            return res.redirect("/admin/category");
        }
    } catch (error) {
        console.log(error.message);
        req.flash("error", "An error occurred while fetching the category");
        return res.redirect("/admin/category");
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const inputCat = name.trim().toLowerCase().replace(/\s+/g, "");

        if (!inputCat) {
            return res.status(400).json({ error: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ name: inputCat });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, { name: inputCat }, { new: true });

        if (updatedCategory) {
            req.flash("success", "Category updated successfully!");
            return res.status(200).json({ message: "Category updated successfully", redirect: "/admin/category" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "An error occurred while updating the category" });
    }
};

const listCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const categoryData = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { is_listed: true } },
            { new: true }
        );

        if (categoryData) {
            return res.status(200).json({ category: categoryData, success: "Category listed successfully" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error("Error listing category:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const unlistCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const categoryData = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { is_listed: false } },
            { new: true }
        );

        if (categoryData) {
            return res.status(200).json({ category: categoryData, success: "Category unlisted successfully" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error("Error unlisting category:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (deletedCategory) {
            return res.status(200).json({ success: "Category deleted successfully" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error("Error deleting category:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}; 

const deleteCategoryAndProducts = async (req, res) => {
    try {
        const { categoryId } = req.body;

        // Delete all products associated with the category
        await Products.deleteMany({ category: categoryId });

        // Delete the category itself
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (deletedCategory) {
            return res.status(200).json({ success: "Category and its products deleted successfully" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        console.error("Error deleting category and products:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};




module.exports = {
    renderCategory,
    renderAddCategory,
    insertCategory,
    renderEditCategory,
    updateCategory,
    listCategory,
    unlistCategory,
    deleteCategory,
    deleteCategoryAndProducts
}