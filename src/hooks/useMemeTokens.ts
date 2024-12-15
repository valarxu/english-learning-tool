import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { MemeToken } from '@/types/crypto';

export function useMemeTokens() {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const { username } = useAuth();
  const initialFetchDone = useRef(false);

  const fetchTokens = useCallback(async () => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('meme_tokens')
        .select('*')
        .eq('user_id', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching meme tokens:', error);
      if (error instanceof Error) {
        throw new Error(`获取 Meme 币列表失败: ${error.message}`);
      } else {
        throw new Error('获取 Meme 币列表失败');
      }
    }
  }, [username]);

  const addToken = async (token: Omit<MemeToken, 'id' | 'user_id' | 'created_at'>) => {
    if (!username) {
      throw new Error('未登录');
    }

    try {
      const { error } = await supabase
        .from('meme_tokens')
        .insert([{
          ...token,
          user_id: username
        }]);

      if (error) throw error;
      await fetchTokens();
    } catch (error) {
      console.error('Error adding token:', error);
      throw error;
    }
  };

  const removeToken = async (contractAddress: string) => {
    if (!username) {
      throw new Error('未登录');
    }
    
    try {
      const { error } = await supabase
        .from('meme_tokens')
        .delete()
        .eq('user_id', username)
        .eq('contract_address', contractAddress);

      if (error) throw error;
      await fetchTokens();
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (username && !initialFetchDone.current) {
      initialFetchDone.current = true;
      void fetchTokens();
    }
  }, [username, fetchTokens]);

  return {
    tokens,
    fetchTokens,
    addToken,
    removeToken
  };
} 