import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    purchase_datetime: { type: Date, default: Date.now, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        price: Number,
        quantity: Number
    }]
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);