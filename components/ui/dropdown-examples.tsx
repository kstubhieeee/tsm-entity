"use client";

import React, { useState } from "react";
import { Dropdown, SelectDropdown } from "./dropdown";

// Example usage of the dropdown components
export const DropdownExamples = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  // Example data for FAQ dropdown
  const faqItems = [
    {
      label: "How does CuraLink protect patient medical data?",
      value: "data-protection",
      content: (
        <p className="text-[#151616]/80 leading-relaxed">
          We use enterprise-grade encryption and HIPAA-compliant security measures to protect all medical data.
        </p>
      ),
    },
    {
      label: "Is CuraLink suitable for all medical specialties?",
      value: "medical-specialties", 
      content: (
        <p className="text-[#151616]/80 leading-relaxed">
          CuraLink is designed to assist healthcare professionals across various specialties.
        </p>
      ),
    },
  ];

  // Example data for form dropdowns
  const bloodGroupOptions = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#FFFFF4] min-h-screen">
      <h1 className="text-3xl font-bold text-[#151616] mb-8">Dropdown Examples</h1>
      
      {/* FAQ Style Dropdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#151616]">FAQ Style Dropdown</h2>
        <div className="max-w-2xl">
          <Dropdown items={faqItems} variant="faq" />
        </div>
      </div>

      {/* Form Select Dropdowns */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[#151616]">Form Select Dropdowns</h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-[#151616] mb-2">
              Blood Group
            </label>
            <SelectDropdown
              options={bloodGroupOptions}
              placeholder="Select blood group"
              value={selectedBloodGroup}
              onChange={setSelectedBloodGroup}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151616] mb-2">
              Gender
            </label>
            <SelectDropdown
              options={genderOptions}
              placeholder="Select gender"
              value={selectedGender}
              onChange={setSelectedGender}
            />
          </div>
        </div>

        {/* Display selected values */}
        <div className="p-4 bg-white rounded-xl border-2 border-[#151616] shadow-[2px_2px_0px_0px_#D6F32F] max-w-2xl">
          <h3 className="font-semibold text-[#151616] mb-2">Selected Values:</h3>
          <p className="text-[#151616]/70">Blood Group: {selectedBloodGroup || "None selected"}</p>
          <p className="text-[#151616]/70">Gender: {selectedGender || "None selected"}</p>
        </div>
      </div>

      {/* Regular Dropdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#151616]">Regular Dropdown</h2>
        <div className="max-w-md">
          <Dropdown
            items={[
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
              { label: "Option 3", value: "option3" },
            ]}
            placeholder="Choose an option"
            onSelect={(item) => console.log("Selected:", item)}
          />
        </div>
      </div>
    </div>
  );
};

export default DropdownExamples;