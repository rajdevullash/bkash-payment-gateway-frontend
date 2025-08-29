/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  FaUser,
  FaHome,
  FaMoneyBillWave,
  FaChild,
  FaGift,
} from "react-icons/fa";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const steps = [
  {
    label: "ব্যক্তিগত তথ্য",
    icon: <FaUser />,
    fields: ["name", "fatherName", "motherName", "nid", "dob", "phone"],
  },
  {
    label: "ঠিকানা",
    icon: <FaHome />,
    fields: ["village", "union", "upazila", "district", "familyMembers"],
  },
  {
    label: "আয় এবং সম্পদ",
    icon: <FaMoneyBillWave />,
    fields: [
      "incomeSource",
      "monthlyIncome",
      "landSize",
      "houseType",
      "toiletType",
    ],
  },
  {
    label: "পরিবারের চলাচল",
    icon: <FaChild />,
    fields: ["totalChildren", "boys", "girls", "waterSource"],
  },
  {
    label: "অনুদান ও চাহিদা",
    icon: <FaGift />,
    fields: ["donationItem"],
  },
];

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    nid: "",
    dob: "",
    phone: "",
    village: "",
    union: "",
    upazila: "",
    district: "",
    familyMembers: "",
    incomeSource: "",
    monthlyIncome: "",
    landSize: "",
    houseType: "",
    toiletType: "",
    donationItem: "",
    waterSource: [],
    totalChildren: "",
    boys: "",
    girls: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      let updatedArray = [...formData[name]];
      if (checked) {
        updatedArray.push(value);
      } else {
        updatedArray = updatedArray.filter((v) => v !== value);
      }
      setFormData({ ...formData, [name]: updatedArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  // Validation
  const validateFields = (fields) => {
    const newErrors = {};
    fields.forEach((field) => {
      if (
        (Array.isArray(formData[field]) && formData[field].length === 0) ||
        (!Array.isArray(formData[field]) && !formData[field])
      ) {
        newErrors[field] = " এই ফিল্ডটি পূরণ করুন";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const currentFields = steps[currentStep].fields;
    if (!validateFields(currentFields)) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation check
    const currentFields = steps[currentStep].fields;
    if (!validateFields(currentFields)) return;

    setLoading(true);

    try {
      //  Register User
      const registerRes = await fetch(
        "https://bkash-project-backend.vercel.app/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            fathername: formData.fatherName,
            mothername: formData.motherName,
            nid: formData.nid,
            dateOfBirth: formData.dob,
            phone: formData.phone,
            village: formData.village,
            union: formData.union,
            upazila: formData.upazila,
            zila: formData.district,
            numberOfFamilyMembers: formData.familyMembers,
            sourceOfIncome: formData.incomeSource,
            monthlyIncome: formData.monthlyIncome,
            landArea: formData.landSize,
            houseType: formData.houseType,
            toiletType: formData.toiletType,
            donationMaterials: formData.donationItem,
            sourceOfDrinkingWater: formData.waterSource.join(", "),
            numberOfChildren: formData.totalChildren,
            numberOfSons: formData.boys,
            numberOfDaughters: formData.girls,
          }),
        }
      );

      const registerData = await registerRes.json();

      if (registerData.errorMessages) {
        const errMsg =
          registerData?.message ||
          registerData?.errorMessages?.[0]?.message ||
          "রেজিস্ট্রেশন ব্যর্থ হয়েছে!";
        alert(errMsg);
        setLoading(false);
        return;
      }

      if (!registerData?.data?._id) {
        alert(" রেজিস্ট্রেশন ব্যর্থ হয়েছে");
        setLoading(false);
        return;
      }

      const pendingUserId = registerData.data._id;

      // 2️ Create Payment
      const paymentRes = await fetch(
        "https://bkash-project-backend.vercel.app/api/v1/payment/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pendingUserId,
            amount: 250, // Application Fee
          }),
        }
      );

      const paymentData = await paymentRes.json();

      // 3️ Redirect to bKash Merchant Page
      if (paymentData?.data?.bkashURL) {
        window.location.href = paymentData.data.bkashURL;
      } else {
        alert(" পেমেন্ট শুরু হয়নি");
        console.error("Payment Error:", paymentData);
      }
    } catch (err) {
      console.error("Error:", err);
      alert(" সার্ভার সমস্যা!");
    } finally {
      setLoading(false);
    }
  };

  // -------- Render Fields --------
  const renderField = (name) => {
    switch (name) {
      case "name":
        return (
          <InputField
            key={name}
            label="নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="আপনার নাম লিখুন"
            error={errors[name]}
          />
        );
      case "fatherName":
        return (
          <InputField
            key={name}
            label="পিতার নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="পিতার নাম লিখুন"
            error={errors[name]}
          />
        );
      case "motherName":
        return (
          <InputField
            key={name}
            label="মাতার নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="মাতার নাম লিখুন"
            error={errors[name]}
          />
        );
      case "nid":
        return (
          <InputField
            key={name}
            label="এনআইডি নাম্বার"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="এনআইডি নাম্বার লিখুন"
            type="text"
            error={errors[name]}
          />
        );
      case "dob":
        return (
          <div key={name} className="flex flex-col">
            <span className="text-gray-700 font-medium pb-2">জন্ম তারিখ *</span>
            <div
              className={`relative border rounded-lg transition duration-300 bg-white hover:shadow-lg
        ${
          errors[name]
            ? "border-red-500"
            : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-400"
        }`}
            >
              <DatePicker
                selected={formData.dob ? new Date(formData.dob) : null}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    dob: date ? date.toISOString().split("T")[0] : "",
                  })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="জন্ম তারিখ নির্বাচন করুন"
                className="w-full h-12 px-4 pr-10 bg-transparent outline-none text-gray-700"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                showMonthDropdown
                dropdownMode="select"
                peekNextMonth
                showMonthYearDropdown
                isClearable
                clearButtonClassName="after:content-['✕'] after:text-red-500 after:text-lg"
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex items-center justify-between px-2 py-2">
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      type="button"
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <div className="flex gap-2">
                      <select
                        value={date.getMonth()}
                        onChange={({ target: { value } }) =>
                          changeMonth(parseInt(value))
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        {[
                          "জানুয়ারী",
                          "ফেব্রুয়ারী",
                          "মার্চ",
                          "এপ্রিল",
                          "মে",
                          "জুন",
                          "জুলাই",
                          "আগস্ট",
                          "সেপ্টেম্বর",
                          "অক্টোবর",
                          "নভেম্বর",
                          "ডিসেম্বর",
                        ].map((option, index) => (
                          <option key={option} value={index}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <select
                        value={date.getFullYear()}
                        onChange={({ target: { value } }) =>
                          changeYear(parseInt(value))
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        {Array.from(
                          { length: 100 },
                          (_, i) => new Date().getFullYear() - 80 + i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      type="button"
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              />
              <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {errors[name] && (
              <span className="text-red-500 text-sm mt-1">{errors[name]}</span>
            )}
          </div>
        );

      case "phone":
        return (
          <InputField
            key={name}
            label="ফোন নাম্বার *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="ফোন নাম্বার লিখুন"
            type="tel"
            error={errors[name]}
          />
        );
      case "village":
        return (
          <InputField
            key={name}
            label="গ্রামের নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="গ্রামের নাম লিখুন"
            error={errors[name]}
          />
        );
      case "union":
        return (
          <InputField
            key={name}
            label="ইউনিয়নের নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="ইউনিয়নের নাম লিখুন"
            error={errors[name]}
          />
        );
      case "upazila":
        return (
          <InputField
            key={name}
            label="উপজেলার নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="উপজেলার নাম লিখুন"
            error={errors[name]}
          />
        );
      case "district":
        return (
          <InputField
            key={name}
            label="জেলার নাম *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="জেলার নাম লিখুন"
            error={errors[name]}
          />
        );
      case "familyMembers":
        return (
          <InputField
            key={name}
            label="পরিবারের সদস্য সংখ্যা *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="পরিবারের সদস্য সংখ্যা লিখুন"
            type="number"
            min={1}
            error={errors[name]}
          />
        );
      case "incomeSource":
        return (
          <SelectField
            key={name}
            label="আয়ের উৎস *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            options={[
              "কৃষি",
              "ব্যবসা",
              "দিনমজুর",
              "মৎস",
              "গৃহিণী",
              "বেসরকারি চাকরি",
              "সরকারি চাকরি",
              "অন্যান্য",
              "বেকার",
            ]}
            error={errors[name]}
          />
        );
      case "monthlyIncome":
        return (
          <SelectField
            key={name}
            label="মাসিক আয় *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            options={[
              "৫০০-১০০০ টাকা",
              "১০০০-১৫০০ টাকা",
              "২০০০-২৫০০ টাকা",
              "২৫০০-৩০০০ টাকা",
              "৩০০০-৩৫০০ টাকা",
              "৩৫০০-৪০০০ টাকা",
              "৪০০০-৪৫০০ টাকা",
              "৪৫০০-৫০০০ টাকা",
              "৫০০০-৬০০০ টাকা",
              "৬০০০-৭০০০ টাকা",
              "৭০০০-৮০০০ টাকা",
              "৮০০০-১০০০০ টাকা",
              "১০০০০-১২০০০ টাকা",
              "১২০০০-১৫০০০ টাকা",
              "১৫০০০-২০০০০ টাকা",
              "২০০০০-২৫০০০ টাকা",
              "২৫০০০-৩০০০০ টাকা",
              "৩০০০০-৪০০০০ টাকা",
              "৪০০০০ টাকার উপরে",
            ]}
            error={errors[name]}
          />
        );
      case "landSize":
        return (
          <InputField
            key={name}
            label="জমির পরিমাণ (%) *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="জমির পরিমাণ লিখুন"
            type="number"
            error={errors[name]}
          />
        );
      case "houseType":
        return (
          <SelectField
            key={name}
            label="বাড়ীর ধরন *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            options={["ইটের", "কাঠের", "মাটির", "অন্যান্য"]}
            error={errors[name]}
          />
        );
      case "toiletType":
        return (
          <SelectField
            key={name}
            label="শৌচাগারের ধরন *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            options={["শৌচাগার নেই", "কাঁচা", "আধুনিক"]}
            error={errors[name]}
          />
        );
      case "donationItem":
        return (
          <SelectField
            key={name}
            label="অনুদান সামগ্রী যা লাগবে *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            options={["টয়লেট", "টিউবওয়েল"]}
            error={errors[name]}
          />
        );
      case "waterSource":
        return (
          <CheckboxGroup
            key={name}
            label="খাবার পানির উৎস *"
            name={name}
            options={["টিউবওয়েল", "কূপ", "নদী", "অন্যান্য"]}
            selected={formData.waterSource}
            onChange={handleChange}
            error={errors[name]}
          />
        );
      case "totalChildren":
        return (
          <InputField
            key={name}
            label="মোট সন্তান সংখ্যা *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="মোট সন্তান সংখ্যা লিখুন"
            type="number"
            min={0}
            error={errors[name]}
          />
        );
      case "boys":
        return (
          <InputField
            key={name}
            label="ছেলে সন্তান *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="ছেলে সন্তানের সংখ্যা"
            type="number"
            min={0}
            error={errors[name]}
          />
        );
      case "girls":
        return (
          <InputField
            key={name}
            label="মেয়ে সন্তান *"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder="মেয়ে সন্তানের সংখ্যা"
            type="number"
            min={0}
            error={errors[name]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 flex flex-col items-center pb-12 px-4 md:px-8">
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mt-8 md:mt-12 rounded-3xl overflow-hidden shadow-xl">
        <img
          src="/ngo_registration_and_civil_society.png"
          alt="Banner"
          fill
          className="object-cover brightness-90"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/30" />
        <div className="absolute left-1/2 bottom-4 md:bottom-8 transform -translate-x-1/2 rounded-full border-4 border-white shadow-lg overflow-hidden w-24 h-24 md:w-32 md:h-32 bg-white">
          <img
            src="/grok_image_x9u3x4t.jpg"
            alt="Logo"
            fill
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </section>

      {/* Form */}
      <div className="w-full max-w-5xl mt-20 backdrop-blur-md bg-white/70 rounded-3xl p-8 shadow-xl border border-white/30 overflow-hidden">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 drop-shadow-lg">
          রেজিস্ট্রেশন ফর্ম
        </h2>

        {/* Progress Bar */}
        <div className="flex justify-between mb-10 max-w-3xl mx-auto px-4">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div
                key={step.label}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  if (idx <= currentStep) setCurrentStep(idx);
                }}
              >
                <div
                  className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-lg"
                        : isActive
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-300 text-gray-600"
                    }
                    transition-all duration-300
                  `}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-2 text-center max-w-[70px] select-none
                    ${
                      isActive ? "font-semibold text-blue-700" : "text-gray-700"
                    }
                    `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto space-y-10"
          noValidate
        >
          <div
            key={currentStep}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 ease-in-out"
          >
            {steps[currentStep].fields.map((fieldName) =>
              renderField(fieldName)
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 max-w-3xl mx-auto px-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium shadow-sm transition"
              >
                পূর্বের
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold shadow-lg hover:scale-105 transform transition"
              >
                পরবর্তী
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg px-8 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold shadow-lg hover:scale-105 transform transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                ) : null}
                আবেদন ফি জমা দিন
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

/* ---------- Small Components ---------- */

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  error,
}) {
  return (
    <label className="flex flex-col">
      <span className="text-gray-700 font-medium pb-2">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        min={min}
        className={`h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 bg-white hover:shadow-lg placeholder-gray-400 placeholder-opacity-100 text-gray-500
          ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
          }
        `}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, error }) {
  return (
    <label className="flex flex-col">
      <span className="text-gray-700 font-medium pb-2">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 bg-white hover:shadow-lg text-gray-500
          ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
          }
        `}
      >
        <option value="">-- নির্বাচন করুন --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </label>
  );
}

function CheckboxGroup({ label, name, options, selected, onChange, error }) {
  return (
    <fieldset className="flex flex-col">
      <legend className="text-gray-700 font-medium pb-2">{label}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={selected.includes(opt)}
              onChange={onChange}
              className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500
                ${error ? "border-red-500" : ""}
              `}
            />
            <span className="text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </fieldset>
  );
}
