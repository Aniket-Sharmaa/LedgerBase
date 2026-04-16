import mongoose from "mongoose";
import ledgerModel from "./ledgeer.model.js";
const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status: {
    type: String,
    enum: {
        values: ['ACTIVE', 'FROZEN', 'CLOSED'],
        message: "Status must be either ACTIVE, FROZEN, or CLOSED"
    },
    default: 'ACTIVE'
},
    currency: {
        type: String,
        required: [true, "Currency is required for an account"],
        default: 'INR'
    },  
}, {
    timestamps: true
})
accountSchema.methods.getBalance = async function(){
 const balanceData = await ledgerModel.aggregate([
    {$match: {account: new mongoose.Types.ObjectId(this._id) }},
    {$group: {
        _id: null,
        totalDebit:{
            $sum:{
                $cond: [
                    {$eq: ['$type', 'DEBIT']},
                    '$amount',
                    0
                ]
            }    
        },
         totalCredit:{
                $sum:{
                    $cond: [
                        {$eq: ['$type', 'CREDIT']},
                        '$amount',
                        0
                    ]
                }
            }
    }},
    {
        $project: {
            _id: 0,
            balance: {$subtract: ['$totalCredit', '$totalDebit']}
        }
    }
 ])
 if(balanceData.length === 0 ){
    return 0
 }
 return balanceData[0].balance
}
// compount index to find the user account by user and status
accountSchema.index({user: 1, status: 1})
const accountModel = mongoose.model('account', accountSchema);
export default accountModel;