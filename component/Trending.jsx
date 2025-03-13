"use client";

import React, { useState, useEffect } from 'react';
import Card from './util/Card';
import Welcome from './Welcome';
import MealTable from './MealTable';
import ModalController from './modal/ModalController';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Trending = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Modal controller to handle preference and macro setting */}
      {user && <ModalController user={user} />}
      
      <div className="container mx-auto p-4 min-h-screen">
        <div className="grid grid-cols-1 gap-6">
          {/* Welcome section */}
          <div className="col-span-1">
            <Card>
              <Welcome user={user} />
            </Card>
          </div>
          
          {/* Trending Meals section - now takes full width */}
          <div className="col-span-1">
            <Card>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Trending Meals</h2>
                <p className="text-neutral-400 mt-1">Explore popular recipes created by our community</p>
              </div>
              <MealTable />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trending;