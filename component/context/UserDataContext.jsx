"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [currentMacros, setCurrentMacros] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setPreferences(data.preferences);
            
            // Get today's macros if they exist
            const today = new Date().toISOString().split('T')[0];
            const macroDoc = await getDoc(doc(db, "users", user.uid, "macros", today));
            
            if (macroDoc.exists()) {
              setCurrentMacros(macroDoc.data());
            } else {
              // Try to get the most recent macros
              const macrosQuery = query(
                collection(db, "users", user.uid, "macros"), 
                orderBy("date", "desc"),
                limit(1)
              );
              
              const macrosSnapshot = await getDocs(macrosQuery);
              if (!macrosSnapshot.empty) {
                setCurrentMacros(macrosSnapshot.docs[0].data());
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setPreferences(null);
        setCurrentMacros(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    userData,
    preferences,
    currentMacros,
    loading,
    refresh: async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setPreferences(data.preferences);
          
          // Refresh macros data
          const today = new Date().toISOString().split('T')[0];
          const macroDoc = await getDoc(doc(db, "users", auth.currentUser.uid, "macros", today));
          
          if (macroDoc.exists()) {
            setCurrentMacros(macroDoc.data());
          }
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};