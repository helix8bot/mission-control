"use client";

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [financialData, setFinancialData] = useState<{
    cashPosition: string;
    runway: string;
  }>({
    cashPosition: 'Loading...',
    runway: 'Loading...',
  });

  const [taskCount, setTaskCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [keyInsights, setKeyInsights] = useState<string[]>([]);
  const [topSignals, setTopSignals] = useState<any[]>([]);
  const [teamMemberCount, setTeamMemberCount] = useState(0);
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch financial data
        const financialResponse = await fetch('/api/sheets');
        if (financialResponse.ok) {
          const data = await financialResponse.json();
          setFinancialData({
            cashPosition: data.cashPosition,
            runway: data.runway,
          });
        }

        // Fetch tasks
        const tasksResponse = await fetch('/data/tasks.json');
        const tasksData = await tasksResponse.json();
        setTaskCount(tasksData.length);

        // Fetch products
        const productsResponse = await fetch('/data/products.json');
        const productsData = await productsResponse.json();
        setProductCount(productsData.length);

        // Fetch calendar
        const calendarResponse = await fetch('/data/calendar.json');
        const calendarData = await calendarResponse.json();
        setUpcomingEvents(calendarData.slice(0, 3));

        // Fetch memory
        const memoryResponse = await fetch('/data/memory.json');
        const memoryData = await memoryResponse.json();
        setKeyInsights(memoryData.keyInsights.slice(0, 3));
        setTeamMemberCount(memoryData.team.length);

        // Fetch social
        const socialResponse = await fetch('/data/social.json');
        const socialData = await socialResponse.json();
        setTopSignals(socialData.topSignals.slice(0, 2));

        // Fetch usage data
        const usageResponse = await fetch('/data/usage.json');
        const usageDataJson = await usageResponse.json();
        setUsageData(usageDataJson);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 grid grid-cols-3 gap-4">
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">💰 Financial Dashboard</h2>
        <p className="text-gray-700">Cash Position: {financialData.cashPosition}</p>
        <p className="text-gray-700">Runway: {financialData.runway}</p>
        <a href="/financial" className="text-blue-500 hover:underline mt-2 block">
          View Full Dashboard →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">✅ Tasks Board</h2>
        <p className="text-gray-700 text-2xl font-bold">{taskCount}</p>
        <p className="text-gray-500 text-sm">Active Tasks</p>
        <a href="/tasks" className="text-blue-500 hover:underline mt-2 block">
          View Tasks Board →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">📦 Product Pipeline</h2>
        <p className="text-gray-700 text-2xl font-bold">{productCount}</p>
        <p className="text-gray-500 text-sm">Products in Pipeline</p>
        <a href="/products" className="text-blue-500 hover:underline mt-2 block">
          View Product Pipeline →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">📅 Upcoming Events</h2>
        {upcomingEvents.map((event, index) => (
          <div key={index} className="mb-2">
            <p className="text-gray-700 font-medium text-sm">{event.name}</p>
            <p className="text-gray-500 text-xs">{event.description}</p>
          </div>
        ))}
        <a href="/calendar" className="text-blue-500 hover:underline mt-2 block">
          View Calendar →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">🧠 Key Insights</h2>
        <ul className="list-disc list-inside space-y-1">
          {keyInsights.map((insight, index) => (
            <li key={index} className="text-gray-700 text-sm">{insight}</li>
          ))}
        </ul>
        <a href="/memory" className="text-blue-500 hover:underline mt-2 block">
          View Memory →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">🔥 Top Signals</h2>
        {topSignals.map((signal, index) => (
          <div key={index} className="mb-3">
            <p className="text-gray-700 text-sm font-medium">{signal.signal}</p>
            <p className="text-gray-500 text-xs">{signal.source}</p>
          </div>
        ))}
        <a href="/social" className="text-blue-500 hover:underline mt-2 block">
          View Social Monitor →
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">👥 Team</h2>
        <p className="text-gray-700 text-2xl font-bold">{teamMemberCount}</p>
        <p className="text-gray-500 text-sm">Team Members</p>
        <a href="/memory" className="text-blue-500 hover:underline mt-2 block">
          View Team →
        </a>
      </div>

      {usageData && (
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">💸 Token Usage</h2>
          <div className="mb-2">
            <p className="text-gray-600 text-xs">Today</p>
            <p className="text-gray-700 font-bold text-lg">
              ${Object.values(usageData.dailyUsage)[0]?.estimatedCost?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-500 text-xs">
              {(Object.values(usageData.dailyUsage)[0]?.totalTokens / 1000).toFixed(0)}K tokens
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-xs">This Month</p>
            <p className="text-gray-700 font-bold text-lg">
              ${Object.values(usageData.monthlyUsage)[0]?.estimatedCost?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-500 text-xs">
              {(Object.values(usageData.monthlyUsage)[0]?.totalTokens / 1000).toFixed(0)}K tokens
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
