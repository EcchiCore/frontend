'use client';

import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Eye, Clock, AlertCircle, CheckCircle, Circle, User, Tag, Calendar, Plus } from 'lucide-react';

// Define the structure of a single item in initialData
interface DiscussionItem {
  id: string;
  properties: {
    Title?: { title: Array<{ plain_text: string }> };
    Description?: { rich_text: Array<{ plain_text: string }> };
    Status?: { select?: { name: string } };
    Category?: { select?: { name: string } };
    Priority?: { select?: { name: 'Critical' | 'High' | 'Medium' | 'Low' } }; // Restrict to valid priorities
    Author?: { rich_text: Array<{ plain_text: string }> };
    Assignee?: { rich_text: Array<{ plain_text: string }> };
    Tags?: { multi_select: Array<{ name: string }> };
    Replies?: { number: number };
    Views?: { number: number };
    Created?: { created_time: string };
    Updated?: { last_edited_time: string };
  };
  created_time?: string;
  last_edited_time?: string;
}

interface CommunityBoardProps {
  initialData: DiscussionItem[];
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ initialData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  // Extract unique values for filters
  const statuses = useMemo(() => {
    const unique = [...new Set(initialData.map(item => item.properties.Status?.select?.name).filter(Boolean))];
    return ['All', ...unique];
  }, [initialData]);

  const categories = useMemo(() => {
    const unique = [...new Set(initialData.map(item => item.properties.Category?.select?.name).filter(Boolean))];
    return ['All', ...unique];
  }, [initialData]);

  const priorities = useMemo(() => {
    const unique = [...new Set(initialData.map(item => item.properties.Priority?.select?.name).filter(Boolean))];
    return ['All', ...unique];
  }, [initialData]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = initialData.filter(item => {
      const title = item.properties.Title?.title[0]?.plain_text || '';
      const description = item.properties.Description?.rich_text[0]?.plain_text || '';
      const status = item.properties.Status?.select?.name || '';
      const category = item.properties.Category?.select?.name || '';
      const priority = item.properties.Priority?.select?.name || '';

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || status === selectedStatus;
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const matchesPriority = selectedPriority === 'All' || priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.properties.Created?.created_time || b.created_time || '').getTime() -
            new Date(a.properties.Created?.created_time || a.created_time || '').getTime();
        case 'updated':
          return new Date(b.properties.Updated?.last_edited_time || b.last_edited_time || '').getTime() -
            new Date(a.properties.Updated?.last_edited_time || a.last_edited_time || '').getTime();
        case 'replies':
          return (b.properties.Replies?.number || 0) - (a.properties.Replies?.number || 0);
        case 'views':
          return (b.properties.Views?.number || 0) - (a.properties.Views?.number || 0);
        case 'priority':
          const priorityOrder: Record<'Critical' | 'High' | 'Medium' | 'Low', number> = {
            Critical: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };
          const aPriority = priorityOrder[a.properties.Priority?.select?.name as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.properties.Priority?.select?.name as keyof typeof priorityOrder] || 0;
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialData, searchTerm, selectedStatus, selectedCategory, selectedPriority, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Circle className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Solved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bug': return 'bg-red-50 text-red-700 border-red-200';
      case 'Feature Request': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Question': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Discussion': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-600">Community Discussion</h1>
                <p className="mt-2 text-gray-600">Ask questions, share knowledge, and connect with the community</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                New Discussion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>Status: {status}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
              >
                {categories.map(category => (
                  <option key={category} value={category}>Category: {category}</option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>Priority: {priority}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Newest</option>
                <option value="replies">Most Replies</option>
                <option value="views">Most Views</option>
                <option value="priority">Priority</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 border-r border-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50 border-r border-gray-300'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-2 text-sm ${viewMode === 'compact' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Discussions</p>
                <p className="text-2xl font-bold text-gray-900">{initialData.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-green-600">
                  {initialData.filter(item => item.properties.Status?.select?.name === 'Open').length}
                </p>
              </div>
              <Circle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {initialData.filter(item => item.properties.Status?.select?.name === 'In Progress').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solved</p>
                <p className="text-2xl font-bold text-green-600">
                  {initialData.filter(item => item.properties.Status?.select?.name === 'Solved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredAndSortedData.length} of {initialData.length} discussions
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          <div className="text-sm text-gray-500">
            Updated {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* Discussion List */}
        <div className={`space-y-${viewMode === 'compact' ? '2' : '4'}`}>
          {filteredAndSortedData.map((item) => {
            const title = item.properties.Title?.title[0]?.plain_text || 'Untitled';
            const description = item.properties.Description?.rich_text[0]?.plain_text || '';
            const status = item.properties.Status?.select?.name || '';
            const priority = item.properties.Priority?.select?.name || '';
            const category = item.properties.Category?.select?.name || '';
            const author = item.properties.Author?.rich_text[0]?.plain_text || 'Anonymous';
            const assignee = item.properties.Assignee?.rich_text[0]?.plain_text || '';
            const tags = item.properties.Tags?.multi_select || [];
            const replies = item.properties.Replies?.number || 0;
            const views = item.properties.Views?.number || 0;
            const created = item.properties.Created?.created_time || item.created_time || '';
            const updated = item.properties.Updated?.last_edited_time || item.last_edited_time || '';

            if (viewMode === 'compact') {
              return (
                <div key={item.id} className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(status)}
                        <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {priority && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(priority)}`}>
                              {priority}
                            </span>
                          )}
                          {category && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getCategoryColor(category)}`}>
                              {category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="hidden md:inline">{author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="hidden lg:inline">{formatDate(updated)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(status)}
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority)}`}>
                          {priority}
                        </span>
                      )}
                      {category && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {truncateText(description, 200)}
                    </p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer">
                          <Tag className="w-3 h-3" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-gray-700">{author}</span>
                      </div>
                      {assignee && (
                        <div className="flex items-center gap-1">
                          <span>assigned to</span>
                          <span className="font-medium text-blue-600">{assignee}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>created {formatDate(created)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span>{replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>updated {formatDate(updated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <MessageCircle className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredAndSortedData.length > 0 && filteredAndSortedData.length >= 20 && (
          <div className="text-center mt-8">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
              Load More Discussions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityBoard;