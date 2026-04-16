import accountModel from "../models/account.model.js";

export async function createAccount(req, res) {
  try {
    const existingAccount = await accountModel.findOne({
      user: req.user._id,
      status: "ACTIVE"
    });

    if (existingAccount) {
      return res.status(422).json({
        message: "An active account already exists for this user",
        status: "failed"
      });
    }

    const account = await accountModel.create({
      user: req.user._id,
    });

    return res.status(201).json({
      account,
      message: "Account created successfully",
      status: "success"
    });

  } catch (err) {
    console.error("Create account error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}
export async function getUserAccountController(req, res) {
  try {
    const accounts = await accountModel.find({ user: req.user._id });

    if (!accounts.length) {
      return res.status(404).json({
        message: "No accounts found",
        status: "failed"
      });
    }

    // ✅ fetch balance for all accounts in parallel
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => ({
        _id: account._id,
        user: account.user,
        status: account.status,
        currency: account.currency,
        balance: await account.getBalance(),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }))
    );

    return res.status(200).json({
      accounts: accountsWithBalance,
      status: "success"
    });

  } catch (err) {
    console.error("Get accounts error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}
export async function getAccountBalanceController(req, res) {
  try {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "failed"
      });
    }

    const balance = await account.getBalance();
    
    console.log("Account ID:", account._id);
    console.log("Balance result:", balance);  // ← add this

    return res.status(200).json({
      accountId: account._id,
      currency: account.currency,
      balance: balance ?? 0,   // ← null/undefined fallback to 0
      status: "success"
    });

  } catch (err) {
    console.error("Get balance error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}