"use client";

import { useState, useEffect } from 'react';

interface TeamMember {
  name: string;
  role: string;
  status: 'active' | 'standby';
  tools: string[];
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      name: 'Perry',
      role: 'Founder & Operator',
      status: 'active',
      tools: ['All']
    },
    {
      name: 'Helix',
      role: 'Chief Operating Officer (COO)',
      status: 'active',
      tools: ['All']
    },
    {
      name: 'Rex',
      role: 'Chief Revenue Officer (CRO)',
      status: 'active',
      tools: ['Revenue Operations', 'Analytics']
    },
    {
      name: 'Drake',
      role: 'VP of DTC Sales',
      status: 'active',
      tools: ['DTC Funnels', 'Email Campaigns']
    },
    {
      name: 'Blair',
      role: 'VP of B2B Sales',
      status: 'active',
      tools: ['B2B Pipeline', 'Outreach']
    },
    {
      name: 'Luna',
      role: 'Marketing Strategist',
      status: 'active',
      tools: ['Content Strategy', 'Campaigns', 'Funnels']
    },
    {
      name: 'Nova',
      role: 'Media Buyer / Paid Ads Specialist',
      status: 'active',
      tools: ['Paid Ads', 'Testing', 'Analytics']
    },
    {
      name: 'Sage',
      role: 'Content Specialist',
      status: 'active',
      tools: ['Copywriting', 'Digital Products']
    },
    {
      name: 'Xena',
      role: 'Research Analyst',
      status: 'active',
      tools: ['Market Research', 'Competitor Analysis']
    },
    {
      name: 'Zara',
      role: 'Product Evaluator',
      status: 'active',
      tools: ['Product Strategy', 'Compliance']
    },
    {
      name: 'Kira',
      role: 'Data & Operations',
      status: 'active',
      tools: ['Data Collection', 'Operations']
    },
    {
      name: 'Echo',
      role: 'Customer Success / Retention Specialist',
      status: 'active',
      tools: ['VIP Programs', 'Review Systems', 'Retention']
    },
    {
      name: 'Zoe',
      role: 'Financial Analyst',
      status: 'active',
      tools: ['Financial Modeling', 'Revenue Projections']
    }
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team</h1>
      <div className="grid grid-cols-4 gap-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white shadow-md rounded-md p-4">
            <h3 className="text-lg font-medium">{member.name}</h3>
            <p className="text-gray-500">{member.role}</p>
            <p className="text-gray-500">Status: {member.status}</p>
            <p className="text-gray-500">Tools: {member.tools.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}