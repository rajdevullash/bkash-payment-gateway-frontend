import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Callback() {
  const router = useRouter();
  const { status, paymentID } = router.query;
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status) {
      setLoading(false);

      // Start countdown
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
  }, [status, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
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
