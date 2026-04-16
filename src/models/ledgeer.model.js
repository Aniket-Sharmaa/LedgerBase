import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger entry must be associated with an account"],
        index: true,
        immutable: true
    }, 
    amount: {
        type: Number,
    required: [true, "Ledger entry must have an amount"],
        min: [0.01, "Ledger entry amount must be at least 0.01"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger entry must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['DEBIT', 'CREDIT'],
            message: "Ledger entry type must be either DEBIT or CREDIT"
        },
        required: [true, "Ledger entry must have a type"],
        immutable: true
        }
})

function preventLegdgerModification() {
    throw new Error("Ledger entries cannot be modified after creation");
}
ledgerSchema.pre('findOneAndUpdate', preventLegdgerModification);
ledgerSchema.pre('updateOne', preventLegdgerModification);
ledgerSchema.pre('updateMany', preventLegdgerModification);
ledgerSchema.pre('update', preventLegdgerModification);
ledgerSchema.pre('deleteOne', preventLegdgerModification);
ledgerSchema.pre('deleteMany', preventLegdgerModification);
ledgerSchema.pre('_remove', preventLegdgerModification);
ledgerSchema.pre('findOneAndReplace', preventLegdgerModification);
const ledgerModel = mongoose.model('ledger', ledgerSchema);
export default ledgerModel;