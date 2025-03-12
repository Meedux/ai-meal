"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence } from 'framer-motion';
import PreferenceModal from './PreferenceModal';
import MacroModal from './MacroModal';

const ModalController = ({ user }) => {
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [loading, setLoading] = useState(true);

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