"use client";

import React, { useState, useEffect } from 'react';
import Card from './util/Card';
import CategoryTable from './CategoryTable';
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

  return (
    <>
      {/* Modal controller to handle preference and macro setting */}
      {user && <ModalController user={user} />}
      
      <div className="container mx-auto p-4 h-[100vh]">
        <div className="mb-4">
          <Card>
            <h2 className="text-xl font-bold">Welcome</h2>
            {/* Pass user to Welcome component if you need personalization */}
            <Welcome user={user} />
          </Card>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full">
          <div className="w-full md:w-[60%]">
            <Card>
              <h2 className="text-xl font-bold mb-6">Trending User Made Meals</h2>
              <MealTable />
            </Card>
          </div>
          <div className="w-full md:w-[40%]">
            <Card>
              <h2 className="text-xl font-bold mb-6">Trending Categories</h2>
              <CategoryTable />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trending;