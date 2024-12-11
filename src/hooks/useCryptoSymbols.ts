import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCryptoSymbols() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useAuth();
  const initialFetchDone = useRef(false);

  const fetchSymbols = useCallback(async () => {
    if (!username) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('crypto_symbols')
        .select('symbol')
        .eq('user_id', username)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setSymbols(data?.map(item => item.symbol) || []);
    } catch (error) {
      console.error('Error fetching symbols:', error);
      setSymbols([]);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const addSymbol = async (symbol: string) => {
    if (!username) {
      throw new Error('未登录');
    }

    if (!symbol) {
      throw new Error('请输入货币符号');
    }
    
    try {
      // 检查是否已存在
      const { data: existing, error: checkError } = await supabase
        .from('crypto_symbols')
        .select('symbol')
        .eq('user_id', username)
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existing) {
        throw new Error('该货币已添加');
      }

      // 添加新货币
      const { error: insertError } = await supabase
        .from('crypto_symbols')
        .insert({
          user_id: username,
          symbol: symbol.toUpperCase()
        });

      if (insertError) throw insertError;

      await fetchSymbols();
    } catch (error: any) {
      console.error('Error adding symbol:', error);
      throw new Error(error.message || '添加失败');
    }
  };

  const removeSymbol = async (symbol: string) => {
    if (!username) {
      throw new Error('未登录');
    }
    
    try {
      const { error } = await supabase
        .from('crypto_symbols')
        .delete()
        .eq('user_id', username)
        .eq('symbol', symbol);

      if (error) throw error;

      await fetchSymbols();
    } catch (error: any) {
      console.error('Error removing symbol:', error);
      throw new Error(error.message || '删除失败');
    }
  };

  // 只在组件首次挂载且有 username 时获取一次数据
  useEffect(() => {
    if (username && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchSymbols();
    }
  }, [username]);

  return {
    symbols,
    isLoading,
    fetchSymbols,
    addSymbol,
    removeSymbol
  };
} 