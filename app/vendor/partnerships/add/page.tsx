"use client";

import { useState } from "react";

export default function AddPartnershipPage() {
  const [vendor, setVendor] = useState("");
  const [partner, setPartner] = useState("");
  const [status, setStatus] = useState("Pending");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Partnership added!");
    window.location.href = "/vendor/partnerships";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold">Add New Partnership</h1>
      <div>
        <label className="block font-medium">Vendor</label>
        <input
          type="text"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Vendor Name"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Partner</label>
        <input
          type="text"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Partner Name"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
        </select>
      </div>
      <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Partnership
      </button>
    </form>
  );
}
