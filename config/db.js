import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://liemb2014580:100202371211176z@cluster0.gd8pa.mongodb.net/food-delicious').then(() => console.log("DB Connected"));
}