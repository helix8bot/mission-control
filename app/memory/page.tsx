"use client";

import { useState, useEffect } from 'react';

interface MemoryData {
  brands: Array<{
    name: string;
    category: string;
    products?: string[];
    targetMarket: string;
    channels: string[];
  }>;
  team: Array<{
    name: string;
    role: string;
  }>;
  goals: {
    primary: string;
    financial: string;
    operational: string;
  };
  keyInsights: string[];
  pricing: {
    targetMargin: string;
    strategy: string;
  };
}

export default function Memory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/memory.json')
      .then(res => res.json())
      .then(data => {
        setMemoryData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading memory:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading memory...</div>;
  }

  if (!memoryData) {
    return <div className="p-8">No memory data available.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Memory</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">Brands</h2>
          {memoryData.brands.map((brand, idx) => (
            <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
              <h3 className="font-medium">{brand.name}</h3>
              <p className="text-sm text-gray-500">{brand.category}</p>
              {brand.products && (
                <p className="text-xs text-gray-400 mt-1">Products: {brand.products.join(', ')}</p>
              )}
              <p className="text-xs text-gray-400">Channels: {brand.channels.join(', ')}</p>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">Team</h2>
          {memoryData.team.map((member, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-md p-4 mb-6">
        <h2 className="text-lg font-bold mb-2">Goals</h2>
        <div className="space-y-2">
          <p className="text-sm"><strong>Primary:</strong> {memoryData.goals.primary}</p>
          <p className="text-sm"><strong>Financial:</strong> {memoryData.goals.financial}</p>
          <p className="text-sm"><strong>Operational:</strong> {memoryData.goals.operational}</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">Key Insights</h2>
        <ul className="list-disc list-inside space-y-1">
          {memoryData.keyInsights.map((insight, idx) => (
            <li key={idx} className="text-sm text-gray-700">{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
