"use client";

import { useState, useEffect } from 'react';

interface SocialData {
  lastUpdated: string;
  topSignals: Array<{
    signal: string;
    impact: string;
    source: string;
    date: string;
  }>;
  marketTrends: string[];
  consumerInsights: string[];
  contentIdeas: string[];
  actionItems: string[];
}

export default function SocialMonitor() {
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/social.json')
      .then(res => res.json())
      .then(data => {
        setSocialData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading social data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading social monitor...</div>;
  }

  if (!socialData) {
    return <div className="p-8">No social data available.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Social Monitor</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: {new Date(socialData.lastUpdated).toLocaleString()}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-3">🔥 Top Signals</h2>
          {socialData.topSignals.map((signal, idx) => (
            <div key={idx} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <p className="font-medium text-sm">{signal.signal}</p>
              <p className="text-xs text-gray-600 mt-1">{signal.impact}</p>
              <p className="text-xs text-gray-400 mt-1">Source: {signal.source} | {signal.date}</p>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-3">📊 Market Trends</h2>
          <ul className="list-disc list-inside space-y-2">
            {socialData.marketTrends.map((trend, idx) => (
              <li key={idx} className="text-sm text-gray-700">{trend}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-3">💬 Consumer Insights</h2>
          <ul className="list-disc list-inside space-y-2">
            {socialData.consumerInsights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-700">{insight}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-3">🎥 Content Ideas</h2>
          <ul className="list-disc list-inside space-y-2">
            {socialData.contentIdeas.map((idea, idx) => (
              <li key={idx} className="text-sm text-gray-700">{idea}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-3">⚡ Action Items</h2>
        <ul className="list-disc list-inside space-y-2">
          {socialData.actionItems.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
