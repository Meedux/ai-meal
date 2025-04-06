"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence } from 'framer-motion';
import PreferenceModal from './PreferenceModal';
import MacroModal from './MacroModal';
import HealthConditionsModal from './HealthConditionsModal'; // You'll need to create this component

const ModalController = ({ user }) => {
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userHealthData, setUserHealthData] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkUserSetup = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        // If user has no setup completed flag, show preference modal
        if (!userData.setupCompleted) {
          setShowPreferenceModal(true);
          setLoading(false);
          return;
        }

        // Check if health conditions have been set up
        if (!userData.healthSetupCompleted) {
          // Check if we can detect potential health concerns from preferences
          const preferences = userData.preferences || {};
          const additionalPrefs = preferences.additional || [];
          
          const hasDiabetes = additionalPrefs.some(pref => 
            pref.toLowerCase().includes('diabetes')
          );
          
          const hasBloodPressure = additionalPrefs.some(pref => 
            pref.toLowerCase().includes('blood pressure') || 
            pref.toLowerCase().includes('hypertension')
          );
          
          // If we detect health conditions or no health check has been done, show health modal
          if (hasDiabetes || hasBloodPressure || !userData.healthCheckDone) {
            setUserHealthData({
              hasDiabetes,
              hasBloodPressure,
              existingConditions: userData.health_conditions || []
            });
            setShowHealthModal(true);
            setLoading(false);
            return;
          }
        }

        // Check if we need to show macro modal
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const lastMacroDate = userData.lastMacroDate;

        // Show macro modal if it's a new day or no macro data exists
        if (!lastMacroDate || lastMacroDate !== today) {
          setShowMacroModal(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking user setup:", error);
        setLoading(false);
      }
    };

    checkUserSetup();
  }, [user]);

  const handlePreferenceComplete = () => {
    setShowPreferenceModal(false);
    setShowHealthModal(true);
  };

  const handleHealthComplete = async (healthConditions) => {
    if (user) {
      try {
        // Save health conditions to user profile
        await updateDoc(doc(db, "users", user.uid), {
          health_conditions: healthConditions,
          healthSetupCompleted: true,
          healthCheckDone: true,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Error saving health conditions:", error);
      }
    }
    
    setShowHealthModal(false);
    setShowMacroModal(true);
  };

  const handleMacroComplete = () => {
    setShowMacroModal(false);
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      {showPreferenceModal && (
        <PreferenceModal 
          user={user} 
          onComplete={handlePreferenceComplete} 
        />
      )}
      
      {showHealthModal && (
        <HealthConditionsModal
          user={user}
          onComplete={handleHealthComplete}
          initialData={userHealthData}
        />
      )}
      
      {showMacroModal && (
        <MacroModal 
          user={user} 
          onComplete={handleMacroComplete} 
        />
      )}
    </AnimatePresence>
  );
};

export default ModalController;