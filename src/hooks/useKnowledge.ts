import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { KnowledgeTag, KnowledgeContent } from '@/types/knowledge';
import { useAuth } from '@/contexts/AuthContext';

export function useKnowledge() {
  const [tags, setTags] = useState<KnowledgeTag[]>([]);
  const [contents, setContents] = useState<KnowledgeContent[]>([]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useAuth();

  // 获取标签列表
  const fetchTags = useCallback(async () => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_tags')
        .select('*')
        .eq('user_id', username)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTags(data || []);
      
      // 如果没有激活的标签，设置第一个标签为激活
      if (!activeTagId && data && data.length > 0) {
        setActiveTagId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [username, activeTagId]);

  // 获取内容列表
  const fetchContents = useCallback(async (tagId: string) => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_contents')
        .select('*')
        .eq('user_id', username)
        .eq('tag_id', tagId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  }, [username]);

  // 添加标签
  const addTag = async (name: string) => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_tags')
        .insert([{ name, user_id: username }])
        .select()
        .single();

      if (error) throw error;
      await fetchTags();
      return data;
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  };

  // 添加内容
  const addContent = async (title: string, content: string, tagId: string) => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('knowledge_contents')
        .insert([{
          title,
          content,
          tag_id: tagId,
          user_id: username
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchContents(tagId);
      return data;
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  // 更新内容
  const updateContent = async (id: string, updates: Partial<KnowledgeContent>) => {
    if (!username) return;
    
    try {
      const { error } = await supabase
        .from('knowledge_contents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      if (activeTagId) {
        await fetchContents(activeTagId);
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  // 删除内容
  const deleteContent = async (id: string) => {
    if (!username) return;
    
    try {
      const { error } = await supabase
        .from('knowledge_contents')
        .delete()
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      if (activeTagId) {
        await fetchContents(activeTagId);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  // 删除标签
  const deleteTag = async (id: string) => {
    if (!username) return;
    
    try {
      const { error } = await supabase
        .from('knowledge_tags')
        .delete()
        .eq('id', id)
        .eq('user_id', username);

      if (error) throw error;
      await fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  };

  // 监听标签变化
  useEffect(() => {
    if (activeTagId) {
      void fetchContents(activeTagId);
    }
  }, [activeTagId, fetchContents]);

  // 初始加载
  useEffect(() => {
    if (username) {
      setIsLoading(true);
      void fetchTags().finally(() => setIsLoading(false));
    }
  }, [username, fetchTags]);

  return {
    tags,
    contents,
    activeTagId,
    isLoading,
    setActiveTagId,
    addTag,
    addContent,
    updateContent,
    deleteContent,
    deleteTag
  };
} 