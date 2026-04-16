import mongoose from "mongoose";
import transactionModel from "../models/transactions.model.js";
import ledgerModel from "../models/ledgeer.model.js";
import accountModel from "../models/account.model.js";
import userModel from "../models/user.models.js";
import { sendTransactionEmail } from "../services/services.js";

// at the top of the file, outside functions
const processingAccounts = new Set();

export async function createTransaction(req, res) {
  try {
    const { fromAccount, toAccount, amount, idemPotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idemPotencyKey) {
      return res.status(400).json({
        message: "FromAccount, toAccount, amount and idemPotencyKey are required"
      });
    }

    // ✅ check if account is already processing a transaction
    if (processingAccounts.has(fromAccount)) {
      return res.status(409).json({
        message: "A transaction is already being processed for this account. Please wait.",
        status: "failed"
      });
    }

    const [fromUserAccount, toUserAccount] = await Promise.all([
      accountModel.findOne({ _id: fromAccount }),
      accountModel.findOne({ _id: toAccount })
    ]);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({ message: "Invalid fromAccount or toAccount" });
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({ idemPotencyKey });

    if (isTransactionAlreadyExists) {
      if (isTransactionAlreadyExists.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: isTransactionAlreadyExists
        });
      }
      if (isTransactionAlreadyExists.status === "PENDING") {
        return res.status(200).json({ message: "Transaction is still pending" });
      }
      if (isTransactionAlreadyExists.status === "FAILED") {
        return res.status(500).json({ message: "Transaction processing failed, please retry" });
      }
      if (isTransactionAlreadyExists.status === "REVERSED") {
        return res.status(500).json({ message: "Transaction was reversed, please retry" });
      }
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
      });
    }

    // ✅ lock the account
    processingAccounts.add(fromAccount);

    const session = await mongoose.startSession();
    let transaction;

    try {
      await session.withTransaction(async () => {
        transaction = (await transactionModel.create([{
          fromAccount,
          toAccount,
          amount,
          idemPotencyKey,
          status: "PENDING"
        }], { session }))[0];

        const debitLedgerEntry = await ledgerModel.create([{
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT"
        }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT"
        }], { session });

        await transactionModel.findOneAndUpdate(
          { _id: transaction._id },
          { status: "COMPLETED" },
          { session, new: true }
        );
      });

    } catch (err) {
      console.error("Transaction session error:", err.message);
      return res.status(500).json({
        message: "Transaction failed, please retry after sometime"
      });
    } finally {
      session.endSession();
      processingAccounts.delete(fromAccount); // ✅ always unlock after done
    }

    transaction = await transactionModel.findById(transaction._id);

    sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
      .catch(err => console.error("Transaction email failed:", err.message));

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction
    });

  } catch (err) {
    console.error("createTransaction error:", err.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

export async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { toAccount, amount, idemPotencyKey } = req.body;

    if (!toAccount || !amount || !idemPotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idemPotencyKey are required",
        status: "failed"
      });
    }

    const [toUserAccount, systemUser] = await Promise.all([
      accountModel.findOne({ _id: toAccount }),
      userModel.findOne({ systemUser: true })
    ]);

    if (!toUserAccount) {
      return res.status(404).json({
        message: "Destination account not found",
        status: "failed"
      });
    }

    if (!systemUser) {
      return res.status(404).json({
        message: "System user not found",
        status: "failed"
      });
    }

    const [fromUserAccount, existingTransaction] = await Promise.all([
      accountModel.findOne({
        user: systemUser._id,
        currency: toUserAccount.currency,
        status: "ACTIVE"
      }),
      transactionModel.findOne({ idemPotencyKey })
    ]);

    if (!fromUserAccount) {
      return res.status(404).json({
        message: "System account for this currency not found",
        status: "failed"
      });
    }

    if (existingTransaction) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction
      });
    }

    let transaction;

    await session.withTransaction(async () => {
      transaction = (await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idemPotencyKey,
        status: "PENDING"
      }], { session }))[0];

      

      const debit = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
      }], { session });

    

      const credit = await ledgerModel.create([{
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
      }], { session });

      

      await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session, new: true }
      );

     
    });

    

    transaction = await transactionModel.findById(transaction._id);

    sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount._id)
      .catch(err => console.error("Transaction email failed:", err.message));

    return res.status(201).json({
      transaction,
      message: "Initial funds transaction completed successfully",
      status: "success"
    });

  } catch (err) {
    console.error("Initial funds transaction error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  } finally {
    session.endSession();
  }
}