import { getBkashToken } from "@/lib/bkash";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { pendingUserId, amount } = req.body;
    console.log(" Incoming payment create request:", { pendingUserId, amount });

    // Get token
    const idToken = await getBkashToken();
    console.log(" Received bKash Token:", idToken ? "Token OK" : "Token Missing");

    //  Prepare request body
    const bodyData = {
      mode: "0011",
      payerReference: pendingUserId,
      callbackURL: `${process.env.BACKEND_URL}/api/payment/callback`,
      amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: pendingUserId,
    };
    console.log("📤 Sending to bKash create API:", bodyData);

    //  Call bKash API
    const response = await fetch(`${process.env.BKASH_BASE_URL}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${idToken}`,
        "x-app-key": process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify(bodyData),
    });

    console.log("📡 bKash API status:", response.status);

    const data = await response.json();
    console.log(" bKash API response:", data);

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(" Payment create error:", err);
    res.status(500).json({ success: false, message: "Payment create failed", error: err.message });
  }
}
