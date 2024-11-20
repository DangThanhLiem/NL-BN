import foodModel from "../models/foodModel.js";
import fs from 'fs';

// Add Food item
const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    });
    try {
        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Get all food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { });

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Update food item
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
        };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, data: updatedFood, message: 'Food updated successfully' });
    } catch (error) {
        res.status(500).json({
            success: false, message: 'Error updating food', error
        });
    }
};

export { addFood, listFood, removeFood, updateFood };
