'use client';
import GroceryList from '../components/GroceryList.jsx';

export default function GroceryPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4"> Grocery List</h1>
      <GroceryList />
    </div>
  );
}
