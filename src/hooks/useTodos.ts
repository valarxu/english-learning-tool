import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Todo } from '../types/todo';
import { useAuth } from '../contexts/AuthContext';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useAuth();

  // 获取待办事项列表
  const fetchTodos = useCallback(async () => {
    if (!username) return;
    
    try {
      // 获取未完成的事项，按创建时间倒序
      const { data: pendingTodos, error: pendingError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', username)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // 获取已完成的事项，按更新时间倒序（完成时间）
      const { data: completedTodos, error: completedError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', username)
        .eq('is_completed', true)
        .order('updated_at', { ascending: false });

      if (completedError) throw completedError;

      // 合并两个列表
      setTodos([...(pendingTodos || []), ...(completedTodos || [])]);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  // 添加待办事项
  const addTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          content: todo.content,
          due_date: todo.due_date,
          is_completed: todo.is_completed,
          user_id: username
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchTodos();
      return data;
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  };

  // 更新待办事项
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          ...(updates.content && { content: updates.content }),
          ...(updates.due_date && { due_date: updates.due_date }),
          ...(typeof updates.is_completed !== 'undefined' && { is_completed: updates.is_completed }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      await fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  };

  // 删除待办事项
  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      await fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  };

  // 标记待办事项为已完成
  const completeTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      await fetchTodos();
    } catch (error) {
      console.error('Error completing todo:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (username) {
      fetchTodos();
    }
  }, [username, fetchTodos]);

  return {
    todos,
    isLoading,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo
  };
} 