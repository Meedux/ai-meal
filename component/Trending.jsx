import React from 'react';
import Card from './util/Card';
import CategoryTable from './CategoryTable';
import Welcome from './Welcome';
import MealTable from './MealTable';

const Trending = () => {
  return (
    <div className="container mx-auto p-4 h-[100vh]">
      <div className="mb-4">
        <Card>
          <h2 className="text-xl font-bold">Welcome</h2>
          {/* TODO: Content will be the Daily Meal Scheduled by the User */}
          <Welcome />
        </Card>
      </div>
      <div className="flex space-x-4 w-full">
        <div className="w-[60%]">
          <Card>
            <h2 className="text-xl font-bold mb-6">Trending User Made Meals</h2>
            {/* TODO: Implement a Dummy table here with Dummy Data */}
            <MealTable />
          </Card>
        </div>
        <div className="w-[40%]">
          <Card>
            <h2 className="text-xl font-bold mb-6">Trending Categories</h2>
            {/* TODO: Implement a Dumy List with Dummy Data */}
            <CategoryTable />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trending;