import React, { useState } from 'react';
import { 
  Users, TrendingUp, AlertTriangle, Award, Calendar, Brain, Target, MessageSquare, 
  BarChart3, Clock, CheckCircle2, Zap, Filter, Search, Download, Settings,
  ChevronRight, Activity, BookOpen, Star, TrendingDown
} from 'lucide-react';
import { TrainerDashboard as TrainerDashboardType, Rep, AIInsight } from '../../types';

interface TrainerDashboardProps {
  dashboard: TrainerDashboardType;
  onTraineeSelect: (trainee: Rep) => void;
}

export default function TrainerDashboard({ dashboard, onTraineeSelect }: TrainerDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, color: 'blue' },
    { id: 'trainees', label: 'Trainees', icon: Users, color: 'purple' },
    { id: 'insights', label: 'AI Insights', icon: Brain, color: 'indigo' },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar, color: 'orange' },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Trainer Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage your training programs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Trainees</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.totalTrainees}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Trainees</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.activeTrainees}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor((dashboard.activeTrainees / dashboard.totalTrainees) * 100)}`}
                    style={{ width: `${(dashboard.activeTrainees / dashboard.totalTrainees) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.completionRate}%</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(dashboard.completionRate)}`}
                    style={{ width: `${dashboard.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Engagement</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.averageEngagement}%</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Daily average
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex space-x-1 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedTab === tab.id;
                const activeStyles = {
                  'blue': 'border-blue-500 text-blue-600 bg-blue-50/50',
                  'purple': 'border-purple-500 text-purple-600 bg-purple-50/50',
                  'indigo': 'border-indigo-500 text-indigo-600 bg-indigo-50/50',
                  'orange': 'border-orange-500 text-orange-600 bg-orange-50/50'
                };
                const gradientStyles = {
                  'blue': 'bg-gradient-to-r from-blue-500 to-blue-600',
                  'purple': 'bg-gradient-to-r from-purple-500 to-purple-600',
                  'indigo': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                  'orange': 'bg-gradient-to-r from-orange-500 to-orange-600'
                };
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all relative ${
                      isActive
                        ? activeStyles[tab.color as keyof typeof activeStyles]
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${gradientStyles[tab.color as keyof typeof gradientStyles]}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Top Performers</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{dashboard.topPerformers.length}</p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Needs Attention</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">{dashboard.strugglingTrainees.length}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Upcoming Deadlines</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{dashboard.upcomingDeadlines.length}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performers */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Star className="h-5 w-5 text-amber-500 mr-2" />
                        Top Performers
                      </h3>
                      <span className="text-xs text-gray-500">This week</span>
                    </div>
                    <div className="space-y-3">
                      {dashboard.topPerformers.map((trainee, index) => (
                        <div
                          key={trainee.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all group"
                          onClick={() => onTraineeSelect(trainee)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{trainee.name}</p>
                              <p className="text-sm text-gray-600">{trainee.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Struggling Trainees */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        Needs Attention
                      </h3>
                      <span className="text-xs text-amber-600 font-medium">Action Required</span>
                    </div>
                    <div className="space-y-3">
                      {dashboard.strugglingTrainees.map((trainee) => (
                        <div
                          key={trainee.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all group"
                          onClick={() => onTraineeSelect(trainee)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                              <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{trainee.name}</p>
                              <p className="text-sm text-gray-600">{trainee.department}</p>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors">
                            Assist
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'trainees' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search trainees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Departments</option>
                      <option value="customer-success">Customer Success</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Trainees Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...dashboard.topPerformers, ...dashboard.strugglingTrainees].map((trainee) => {
                    const isTopPerformer = dashboard.topPerformers.some(t => t.id === trainee.id);
                    const progress = Math.floor(Math.random() * 40) + 60; // Mock progress
                    const engagement = Math.floor(Math.random() * 30) + 70; // Mock engagement
                    
                    return (
                      <div
                        key={trainee.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => onTraineeSelect(trainee)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                              isTopPerformer 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                              {trainee.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{trainee.name}</p>
                              <p className="text-sm text-gray-500">{trainee.department}</p>
                            </div>
                          </div>
                          {isTopPerformer && (
                            <Award className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(progress)} transition-all`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Engagement</span>
                              <span className="font-semibold text-gray-900">{engagement}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(engagement)} transition-all`}
                                style={{ width: `${engagement}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>2h ago</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Brain className="h-5 w-5 text-indigo-500 mr-2" />
                    AI-Powered Insights
                  </h3>
                  <span className="text-xs text-gray-500">Updated 5 minutes ago</span>
                </div>
                
                {dashboard.aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.priority === 'high' ? 'bg-red-100' :
                          insight.priority === 'medium' ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`}>
                          <Brain className={`h-5 w-5 ${
                            insight.priority === 'high' ? 'text-red-600' :
                            insight.priority === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{insight.title}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                        insight.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {insight.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{insight.description}</p>
                    {insight.suggestedActions.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-indigo-500" />
                          Suggested Actions
                        </p>
                        <div className="space-y-2">
                          {insight.suggestedActions.map((action, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'deadlines' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                    Upcoming Deadlines
                  </h3>
                  <span className="text-xs text-gray-500">{dashboard.upcomingDeadlines.length} items</span>
                </div>
                
                <div className="space-y-3">
                  {dashboard.upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-5 border-2 rounded-xl transition-all hover:shadow-md ${
                        deadline.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                        deadline.riskLevel === 'medium' ? 'bg-amber-50 border-amber-200' :
                        'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          deadline.riskLevel === 'high' ? 'bg-red-100' :
                          deadline.riskLevel === 'medium' ? 'bg-amber-100' :
                          'bg-green-100'
                        }`}>
                          <Calendar className={`h-6 w-6 ${
                            deadline.riskLevel === 'high' ? 'text-red-600' :
                            deadline.riskLevel === 'medium' ? 'text-amber-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{deadline.traineeName}</p>
                          <p className="text-sm text-gray-600 mt-1">{deadline.task}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 mb-1">{deadline.dueDate}</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getRiskColor(deadline.riskLevel)}`}>
                          {deadline.riskLevel.toUpperCase()} RISK
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
    </div>
  );
}