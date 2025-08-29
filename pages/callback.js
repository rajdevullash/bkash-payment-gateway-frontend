import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Callback() {
  const router = useRouter();
  const { status, paymentID, signature, apiVersion } = router.query;
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status && paymentID) {
      // 🔥 Call your backend callback API
      const callCallbackAPI = async () => {
        try {
          const res = await fetch(
            `https://bkash-project-backend.vercel.app/api/v1/payment/callback?paymentID=${paymentID}&status=${status}&signature=${signature}&apiVersion=${apiVersion}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await res.json();
          console.log("✅ Callback API Response:", data);
        } catch (error) {
          console.error("❌ Error calling callback API:", error);
        } finally {
          setLoading(false);

          // Start countdown after API call finishes
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push("/"); // redirect to homepage
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        }
      };

      callCallbackAPI();
    }
  }, [status, paymentID, signature, apiVersion, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p>Processing your payment...</p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-green-100 p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          আপনার আবেদন সফলভাবে জমা হলো!
        </h1>
        <p className="text-green-800">
          ধন্যবাদ, আমরা আপনার আবেদন প্রক্রিয়াজাত করছি।
        </p>
        <p className="mt-4 text-sm text-gray-600">Payment ID: {paymentID}</p>
        <p className="mt-2 text-gray-600 text-sm">
          {countdown} সেকেন্ড পর হোমপেজে পাঠানো হবে...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-red-100 p-6">
      <h1 className="text-3xl font-bold text-red-700 mb-4">
        পেমেন্ট ব্যর্থ হয়েছে!
      </h1>
      <p className="text-red-800">দয়া করে আবার চেষ্টা করুন।</p>
      <p className="mt-2 text-gray-600 text-sm">
        {countdown} সেকেন্ড পর হোমপেজে পাঠানো হবে...
      </p>
    </main>
  );
}
