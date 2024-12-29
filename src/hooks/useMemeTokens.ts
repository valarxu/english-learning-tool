import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { MemeToken } from '@/types/crypto';

export function useMemeTokens() {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const { username } = useAuth();
  const initialFetchDone = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!username) {
      console.log('No username found');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('meme_tokens')
        .select('*')
        .eq('user_id', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Token fetch error:', error);
        setError(error.message);
        return;
      }

      setTokens(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取代币列表失败';
      console.error('Error in fetchTokens:', errorMessage);
      setError(errorMessage);
    }
  }, [username]);

  const addToken = async (token: Omit<MemeToken, 'id' | 'user_id' | 'created_at'>) => {
    if (!username) {
      throw new Error('未登录');
    }

    try {
      // 检查是否已存在
      const { data: existing } = await supabase
        .from('meme_tokens')
        .select('id')
        .eq('user_id', username)
        .eq('contract_address', token.contract_address)
        .maybeSingle();

      if (existing) {
        throw new Error('该代币已添加');
      }

      const { error: insertError } = await supabase
        .from('meme_tokens')
        .insert([{
          ...token,
          user_id: username
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }

      await fetchTokens();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加代币失败';
      console.error('Error adding token:', errorMessage);
      throw new Error(errorMessage);
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

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message);
      }

      await fetchTokens();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除代币失败';
      console.error('Error removing token:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (username && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchTokens().catch(err => {
        console.error('Initial fetch error:', err);
        setError(err instanceof Error ? err.message : '初始化加载失败');
      });
    }
  }, [username, fetchTokens]);

  return {
    tokens,
    error,
    fetchTokens,
    addToken,
    removeToken
  };
} 