'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTodos } from '../../hooks/useTodos';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Todo } from '../../types/todo';

// 将函数移到组件外部
const getDaysRemaining = (dueDate: string): { days: number; isOverdue: boolean } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    days: Math.abs(diffDays),
    isOverdue: diffDays < 0
  };
};

export default function TodosPage() {
  const { todos, isLoading, addTodo, deleteTodo, completeTodo } = useTodos();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [newTodo, setNewTodo] = useState({
    content: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTodo({
        content: newTodo.content,
        due_date: new Date(newTodo.dueDate).toISOString(),
        is_completed: false,
        user_id: ''  // 会在 hook 中设置
      });
      setNewTodo({
        content: '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTodos = todos.filter(todo => 
    activeTab === 'completed' ? todo.is_completed : !todo.is_completed
  );

  // 按年月对已完成事项进行归档
  const archivedTodos = useMemo(() => {
    const completed = todos.filter(todo => todo.is_completed);
    const archives: Record<string, typeof todos> = {};
    
    completed.forEach(todo => {
      const date = new Date(todo.updated_at || '');
      const archiveKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      if (!archives[archiveKey]) {
        archives[archiveKey] = [];
      }
      archives[archiveKey].push(todo);
    });

    // 按时间倒序排序
    const sortedArchives = Object.entries(archives)
      .sort((a, b) => b[0].localeCompare(a[0]));

    // 自动展开最新月份
    if (sortedArchives.length > 0 && !expandedMonth) {
      setExpandedMonth(sortedArchives[0][0]);
    }

    return sortedArchives;
  }, [todos, expandedMonth]);

  return (
    <ProtectedRoute>
      <div className="page-gradient-bg">
        <Link 
          href="/"
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 
            transition-all duration-300 backdrop-blur-md font-medium
            hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 
            active:scale-95 active:translate-y-0
            flex items-center gap-1 group"
        >
          <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>返回首页</span>
        </Link>

        <div className="max-w-4xl mx-auto pt-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">待办事项</h1>

          {/* 添加新待办事项表单 */}
          <form onSubmit={handleSubmit} className="mb-8 bg-white/90 rounded-xl p-4 shadow-lg">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTodo.content}
                onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="输入待办事项..."
                required
              />
              <input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
              >
                添加
              </button>
            </div>
          </form>

          {/* 标签切换 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'pending'
                  ? 'bg-white text-emerald-600'
                  : 'bg-white/50 text-gray-600'
              } transition-all duration-300`}
            >
              未完成
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'completed'
                  ? 'bg-white text-emerald-600'
                  : 'bg-white/50 text-gray-600'
              } transition-all duration-300`}
            >
              已完成
            </button>
          </div>

          {/* 待办事项列表 */}
          <div className="space-y-4">
            {isLoading ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : activeTab === 'pending' ? (
              // 未完成事项列表
              filteredTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-gray-500 mb-2">暂无待办事项</p>
                  <p className="text-gray-400 text-sm">添加一个新的待办事项开始规划吧</p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onComplete={completeTodo}
                    onDelete={deleteTodo}
                    formatDate={formatDate}
                  />
                ))
              )
            ) : (
              // 已完成事项归档视图
              archivedTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-gray-500 mb-2">暂无已完成事项</p>
                  <p className="text-gray-400 text-sm">完成一些待办事项就会在这里显示</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 显示选中月份的待办事项 */}
                  {archivedTodos
                    .filter(([month]) => month === expandedMonth)
                    .map(([month, todos]) => (
                      <div key={month} className="space-y-4">
                        <div className="flex items-stretch gap-4">
                          {/* 月份标题卡片 */}
                          <div className="flex-1 bg-white/95 rounded-xl shadow-lg border border-gray-100 flex items-center px-4">
                            <div className="flex items-center gap-3">
                              <div className="text-xl font-medium text-gray-800">
                                {month}
                              </div>
                              <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-medium">
                                {todos.length} 项任务
                              </div>
                            </div>
                          </div>

                          {/* 归档月份选择器 */}
                          <div className="bg-white/95 rounded-xl shadow-lg border border-gray-100 flex items-center">
                            <div className="relative px-4">
                              <select
                                value={expandedMonth || ''}
                                onChange={(e) => setExpandedMonth(e.target.value)}
                                className="h-[52px] text-gray-800 bg-transparent focus:outline-none cursor-pointer appearance-none pr-8"
                              >
                                {archivedTodos.map(([month]) => (
                                  <option key={month} value={month} className="text-gray-800 bg-white">
                                    {month}
                                  </option>
                                ))}
                              </select>
                              {/* 自定义下拉箭头 */}
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* 分隔线 */}
                            <div className="w-px h-8 bg-gray-200"></div>

                            {/* 快速跳转按钮 */}
                            <div className="flex h-[52px]">
                              <button
                                onClick={() => {
                                  const currentIndex = archivedTodos.findIndex(([month]) => month === expandedMonth);
                                  if (currentIndex > 0) {
                                    setExpandedMonth(archivedTodos[currentIndex - 1][0]);
                                  }
                                }}
                                disabled={!expandedMonth || archivedTodos.findIndex(([month]) => month === expandedMonth) === 0}
                                className="w-[52px] flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              >
                                ←
                              </button>
                              <button
                                onClick={() => {
                                  const currentIndex = archivedTodos.findIndex(([month]) => month === expandedMonth);
                                  if (currentIndex < archivedTodos.length - 1) {
                                    setExpandedMonth(archivedTodos[currentIndex + 1][0]);
                                  }
                                }}
                                disabled={!expandedMonth || archivedTodos.findIndex(([month]) => month === expandedMonth) === archivedTodos.length - 1}
                                className="w-[52px] flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 任务列表 */}
                        <div className="space-y-4">
                          {todos.map((todo) => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              onComplete={completeTodo}
                              onDelete={deleteTodo}
                              formatDate={formatDate}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// 抽取 TodoItem 组件
interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  formatDate: (date: string) => string;
}

function TodoItem({ todo, onComplete, onDelete, formatDate }: TodoItemProps) {
  const { days, isOverdue } = getDaysRemaining(todo.due_date);
  
  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-lg flex items-center justify-between group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex-1">
        <p className={`text-gray-800 ${todo.is_completed ? 'line-through' : ''}`}>
          {todo.content}
        </p>
        <div className="flex gap-4 mt-2 text-sm items-center">
          <p className="text-gray-500">
            截止日期: {formatDate(todo.due_date)}
          </p>
          {!todo.is_completed && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isOverdue 
                ? 'bg-red-100 text-red-600' 
                : days <= 3 
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-emerald-100 text-emerald-600'
            }`}>
              {isOverdue 
                ? `已逾期 ${days} 天` 
                : days === 0 
                  ? '今天截止'
                  : `还剩 ${days} 天`}
            </span>
          )}
          {todo.is_completed && (
            <p className="text-emerald-600">
              完成时间: {formatDate(todo.updated_at || '')}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {!todo.is_completed && (
          <button
            onClick={() => todo.id && onComplete(todo.id)}
            className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center transition-all duration-300"
          >
            ✓
          </button>
        )}
        <button
          onClick={() => todo.id && onDelete(todo.id)}
          className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-all duration-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}