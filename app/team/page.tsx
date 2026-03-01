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
      role: 'Founder/CEO',
      status: 'active',
      tools: ['All']
    },
    {
      name: 'Helix',
      role: 'Chief of Staff',
      status: 'active',
      tools: ['All']
    },
    {
      name: 'Xena',
      role: 'Researcher',
      status: 'active',
      tools: ['exa-web-search-free', 'summarize', 'chirp', 'data-analyst']
    },
    {
      name: 'Zara',
      role: 'Product Manager',
      status: 'active',
      tools: ['Product Gatekeeper', 'Product Pipeline']
    },
    {
      name: 'Luna',
      role: 'Marketing Strategist',
      status: 'active',
      tools: ['chirp', 'content creation', 'analytics']
    },
    {
      name: 'Kira',
      role: 'Operations Coordinator',
      status: 'active',
      tools: ['Financial Dashboard', 'Google Sheets']
    },
    {
      name: 'Zoe',
      role: 'Financial Analyst',
      status: 'active',
      tools: ['Financial Dashboard', 'Google Sheets', 'data-analyst']
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