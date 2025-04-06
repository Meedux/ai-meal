"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HealthConditionsModal = ({ user, onComplete, initialData = null }) => {
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [diabetesType, setDiabetesType] = useState("");
  const [bpLevel, setBpLevel] = useState("");
  const [otherCondition, setOtherCondition] = useState("");

  useEffect(() => {
    if (initialData) {
      const conditions = initialData.existingConditions || [];
      setSelectedConditions(conditions);
      
      // Set initial diabetes type if it exists
      const diabetesCondition = conditions.find(c => c.includes('Diabetes'));
      if (diabetesCondition) {
        if (diabetesCondition.includes('Type 1')) {
          setDiabetesType('type1');
        } else if (diabetesCondition.includes('Type 2')) {
          setDiabetesType('type2');
        } else {
          setDiabetesType('general');
        }
      } else if (initialData.hasDiabetes) {
        setSelectedConditions(prev => [...prev, 'Diabetes']);
        setDiabetesType('general');
      }
      
      // Set initial blood pressure level if it exists
      const bpCondition = conditions.find(c => c.includes('Blood Pressure') || c.includes('Hypertension'));
      if (bpCondition) {
        if (bpCondition.includes('Stage 1')) {
          setBpLevel('stage1');
        } else if (bpCondition.includes('Stage 2')) {
          setBpLevel('stage2');
        } else {
          setBpLevel('general');
        }
      } else if (initialData.hasBloodPressure) {
        setSelectedConditions(prev => [...prev, 'High Blood Pressure']);
        setBpLevel('general');
      }
    }
  }, [initialData]);

  const handleConditionToggle = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
      
      // Reset specific condition settings when toggled off
      if (condition === 'Diabetes') {
        setDiabetesType("");
      } else if (condition === 'High Blood Pressure') {
        setBpLevel("");
      }
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleAddOtherCondition = () => {
    if (otherCondition.trim() !== "") {
      setSelectedConditions([...selectedConditions, otherCondition.trim()]);
      setOtherCondition("");
    }
  };

  const handleComplete = () => {
    const formattedConditions = selectedConditions.map(condition => {
      if (condition === 'Diabetes' && diabetesType) {
        if (diabetesType === 'type1') return 'Diabetes Type 1';
        if (diabetesType === 'type2') return 'Diabetes Type 2';
        return 'Diabetes';
      } else if (condition === 'High Blood Pressure' && bpLevel) {
        if (bpLevel === 'stage1') return 'High Blood Pressure Stage 1';
        if (bpLevel === 'stage2') return 'High Blood Pressure Stage 2';
        return 'High Blood Pressure';
      }
      return condition;
    });
    
    onComplete(formattedConditions);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-neutral-800 rounded-xl shadow-xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Health Information</h2>
        <p className="text-neutral-400 mb-6">
          Customize your meal recommendations based on your health needs
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-white mb-3">Do you have any of these health conditions?</p>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="diabetes"
                  checked={selectedConditions.includes('Diabetes')}
                  onChange={() => handleConditionToggle('Diabetes')}
                  className="checkbox checkbox-primary mr-3"
                />
                <label htmlFor="diabetes" className="text-white cursor-pointer">Diabetes</label>
              </div>
              
              {selectedConditions.includes('Diabetes') && (
                <div className="ml-7 mt-2 bg-neutral-700/40 p-3 rounded-lg">
                  <p className="text-sm text-neutral-300 mb-2">What type of diabetes do you have?</p>
                  <div className="flex flex-wrap gap-2">
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${diabetesType === 'type1' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="diabetesType" 
                        value="type1" 
                        checked={diabetesType === 'type1'}
                        onChange={() => setDiabetesType('type1')}
                        className="hidden" 
                      />
                      Type 1
                    </label>
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${diabetesType === 'type2' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="diabetesType" 
                        value="type2" 
                        checked={diabetesType === 'type2'}
                        onChange={() => setDiabetesType('type2')}
                        className="hidden" 
                      />
                      Type 2
                    </label>
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${diabetesType === 'general' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="diabetesType" 
                        value="general" 
                        checked={diabetesType === 'general'}
                        onChange={() => setDiabetesType('general')}
                        className="hidden" 
                      />
                      Not sure
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bloodPressure"
                  checked={selectedConditions.includes('High Blood Pressure')}
                  onChange={() => handleConditionToggle('High Blood Pressure')}
                  className="checkbox checkbox-primary mr-3"
                />
                <label htmlFor="bloodPressure" className="text-white cursor-pointer">High Blood Pressure (Hypertension)</label>
              </div>

              {selectedConditions.includes('High Blood Pressure') && (
                <div className="ml-7 mt-2 bg-neutral-700/40 p-3 rounded-lg">
                  <p className="text-sm text-neutral-300 mb-2">What is your blood pressure level?</p>
                  <div className="flex flex-wrap gap-2">
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${bpLevel === 'stage1' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="bpLevel" 
                        value="stage1" 
                        checked={bpLevel === 'stage1'}
                        onChange={() => setBpLevel('stage1')}
                        className="hidden" 
                      />
                      Stage 1 (130-139/80-89)
                    </label>
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${bpLevel === 'stage2' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="bpLevel" 
                        value="stage2" 
                        checked={bpLevel === 'stage2'}
                        onChange={() => setBpLevel('stage2')}
                        className="hidden" 
                      />
                      Stage 2 (140+/90+)
                    </label>
                    <label className={`px-3 py-2 rounded-md cursor-pointer ${bpLevel === 'general' ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                      <input 
                        type="radio" 
                        name="bpLevel" 
                        value="general" 
                        checked={bpLevel === 'general'}
                        onChange={() => setBpLevel('general')}
                        className="hidden" 
                      />
                      Not sure
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cholesterol"
                  checked={selectedConditions.includes('High Cholesterol')}
                  onChange={() => handleConditionToggle('High Cholesterol')}
                  className="checkbox checkbox-primary mr-3"
                />
                <label htmlFor="cholesterol" className="text-white cursor-pointer">High Cholesterol</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="celiac"
                  checked={selectedConditions.includes('Celiac Disease')}
                  onChange={() => handleConditionToggle('Celiac Disease')}
                  className="checkbox checkbox-primary mr-3"
                />
                <label htmlFor="celiac" className="text-white cursor-pointer">Celiac Disease</label>
              </div>
            </div>
          </div>

          <div>
            <p className="text-white mb-3">Add other health conditions</p>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter health condition"
                value={otherCondition}
                onChange={(e) => setOtherCondition(e.target.value)}
                className="input input-bordered w-full bg-neutral-700 text-white"
              />
              <button
                onClick={handleAddOtherCondition}
                className="btn btn-primary ml-2"
                disabled={otherCondition.trim() === ""}
              >
                Add
              </button>
            </div>
          </div>
          
          {selectedConditions.length > 0 && (
            <div>
              <p className="text-white mb-2">Selected conditions:</p>
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((condition, index) => (
                  <div key={index} className="bg-neutral-700 text-white px-3 py-1 rounded-full flex items-center">
                    {condition}
                    <button
                      onClick={() => setSelectedConditions(selectedConditions.filter((_, i) => i !== index))}
                      className="ml-2 text-neutral-400 hover:text-white"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-neutral-700/40 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-neutral-300">
                <p>Your health information helps us provide better meal recommendations tailored to your specific needs.</p>
                <p className="mt-1">Always consult with healthcare professionals about your dietary requirements.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleComplete}
            className="btn btn-primary"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HealthConditionsModal;