"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import MealDetails from '@/component/MealDetails';

const MealPage = () => {
  const { id } = useParams();

  return (
    <>
      <MealDetails id={id} />
    </>
  );
};

export default MealPage;