// src/models/transactions.models.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a source account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a destination account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
            message: "Status must be either PENDING, COMPLETED, or FAILED"
        },
        default: 'PENDING'
    },
    amount: {
        'type': Number,
        required: [true, "Transaction amount is required"],
        min: [0.01, "Transaction amount must be at least 0.01"]
     },
     idemPotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for transaction"],
        unique: [true, "Idempotency key must be unique to prevent duplicate transactions"],
        index: true
     }
    
}, {
    timestamps: true
})
const transactionModel = mongoose.model('transaction', transactionSchema);
export default transactionModel;