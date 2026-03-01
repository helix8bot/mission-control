"use client";

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee: string;
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/tasks.json')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tasks:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tasks Board</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">To Do</h2>
          {tasks.filter(task => task.status === 'To Do').map(task => (
            <div key={task.id} className="bg-gray-100 p-2 rounded-md mb-2">
              <h3 className="text-md font-medium">{task.title}</h3>
              <p className="text-gray-500 text-sm">Assigned to: {task.assignee}</p>
            </div>
          ))}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">In Progress</h2>
          {tasks.filter(task => task.status === 'In Progress').map(task => (
            <div key={task.id} className="bg-gray-100 p-2 rounded-md mb-2">
              <h3 className="text-md font-medium">{task.title}</h3>
              <p className="text-gray-500 text-sm">Assigned to: {task.assignee}</p>
            </div>
          ))}
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">Done</h2>
          {tasks.filter(task => task.status === 'Done').map(task => (
            <div key={task.id} className="bg-gray-100 p-2 rounded-md mb-2">
              <h3 className="text-md font-medium">{task.title}</h3>
              <p className="text-gray-500 text-sm">Assigned to: {task.assignee}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
