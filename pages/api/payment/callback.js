import { getBkashToken } from "@/lib/bkash";

async function bkashExecute(paymentID) {
  const token = await getBkashToken();
  const res = await fetch(`${process.env.BKASH_BASE_URL}/payment/execute/${paymentID}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "x-app-key": process.env.BKASH_APP_KEY,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

async function bkashQuery(paymentID) {
  const token = await getBkashToken();
  const res = await fetch(`${process.env.BKASH_BASE_URL}/payment/query/${paymentID}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "x-app-key": process.env.BKASH_APP_KEY,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export default async function handler(req, res) {
  const { paymentID, status } = req.query;

  try {
    if (status === "success") {
      const executeRes = await bkashExecute(paymentID);
      const queryRes = await bkashQuery(paymentID);

      console.log("Bkash success:", queryRes);


      return res.redirect(`${process.env.FRONTEND_URL}/success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/failed`);
    }
  } catch (err) {
    console.error("Callback error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/failed`);
  }
}
