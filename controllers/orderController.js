import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//placing user order in frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartItems: {} });
        const subtotal = req.body.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const deliveryCharge = 2 * 100; // 2 dollars in cents
        const totalAmount = subtotal + deliveryCharge;

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // price in cents
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: deliveryCharge,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
const verifyOrder = async (req, res) => {
    const { success, orderId } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            res.json({ success: true, message: "Payment Successfull" })
        } else {
            await orderModel.findByIdAndUpdate(orderId)
            res.json({ success: false, message: "Payment Failed" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}
//user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//api for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}
export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
