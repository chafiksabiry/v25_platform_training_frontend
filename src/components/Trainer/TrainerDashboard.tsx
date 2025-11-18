import React, { useState } from 'react';
import { Users, TrendingUp, AlertTriangle, Award, Calendar, Brain, Target, MessageSquare } from 'lucide-react';
import { TrainerDashboard as TrainerDashboardType, Rep, AIInsight } from '../../types';

interface TrainerDashboardProps {
  dashboard: TrainerDashboardType;
  onTraineeSelect: (trainee: Rep) => void;
}

export default function TrainerDashboard({ dashboard, onTraineeSelect }: TrainerDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'trainees', label: 'Trainees', icon: Users },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>Broadcast Message</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trainees</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.totalTrainees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Trainees</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.activeTrainees}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.completionRate}%</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.averageEngagement}%</p>
            </div>
            <Target className="h-8 w-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {dashboard.topPerformers.map((trainee, index) => (
                    <div
                      key={trainee.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => onTraineeSelect(trainee)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{trainee.name}</p>
                          <p className="text-sm text-gray-600">{trainee.department}</p>
                        </div>
                      </div>
                      <Award className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Struggling Trainees */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Needs Attention</h3>
                <div className="space-y-3">
                  {dashboard.strugglingTrainees.map((trainee) => (
                    <div
                      key={trainee.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => onTraineeSelect(trainee)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{trainee.name}</p>
                          <p className="text-sm text-gray-600">{trainee.department}</p>
                        </div>
                      </div>
                      <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                        Assist
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'trainees' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Trainees</h3>
                <div className="flex items-center space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Departments</option>
                    <option>Customer Success</option>
                    <option>Sales</option>
                    <option>Support</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Struggling</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...dashboard.topPerformers, ...dashboard.strugglingTrainees].map((trainee) => (
                  <div
                    key={trainee.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => onTraineeSelect(trainee)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {trainee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{trainee.name}</p>
                        <p className="text-sm text-gray-600">{trainee.department}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement:</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Active:</span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className="space-y-4">
              {dashboard.aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                  {insight.suggestedActions.length > 0 && (
                    <div className="space-y-1">
                      {insight.suggestedActions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Target className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'deadlines' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {dashboard.upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(deadline.riskLevel).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`} />
                      <div>
                        <p className="font-medium text-gray-900">{deadline.traineeName}</p>
                        <p className="text-sm text-gray-600">{deadline.task}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{deadline.dueDate}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(deadline.riskLevel)}`}>
                        {deadline.riskLevel} risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}