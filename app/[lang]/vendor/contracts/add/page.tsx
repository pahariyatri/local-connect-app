"use client";

import { useState } from "react";

export default function AddContractPage() {
  const [partner, setPartner] = useState("");
  const [terms, setTerms] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Contract added!");
    window.location.href = "/vendor/contracts";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 bg-white shadow rounded max-w-lg mx-auto"
    >
      <h1 className="text-2xl font-bold">Add New Contract</h1>
      <div>
        <label className="block text-sm font-medium mb-1">Partner Name</label>
        <input
          type="text"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Partner Name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Terms</label>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Contract Terms"
          required
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Commission Rate (%)
        </label>
        <input
          type="number"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Commission Rate"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>
      <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Contract
      </button>
    </form>
  );
}
