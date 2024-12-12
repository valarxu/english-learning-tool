import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCryptoSymbols(type: 'mainstream' | 'meme' = 'mainstream') {
  const [symbols, setSymbols] = useState<string[]>([]);
  const { username } = useAuth();
  const initialFetchDone = useRef(false);

  const fetchSymbols = useCallback(async () => {
    if (!username) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('crypto_symbols')
        .select('symbol')
        .eq('user_id', username)
        .eq('type', type)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSymbols(data?.map(item => item.symbol) || []);
    } catch (error) {
      console.error('Error fetching symbols:', error);
      // 不要在这里设置空数组，保持之前的状态
      if (error instanceof Error) {
        throw new Error(`获取货币列表失败: ${error.message}`);
      } else {
        throw new Error('获取货币列表失败');
      }
    }
  }, [username, type]);

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
        .eq('type', type)
        .maybeSingle();

      if (checkError) {
        console.error('Check symbol error:', checkError);
        throw checkError;
      }
      
      if (existing) {
        throw new Error('该货币已添加');
      }

      // 获取当前最大的 sort_order
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('crypto_symbols')
        .select('sort_order')
        .eq('user_id', username)
        .eq('type', type)
        .order('sort_order', { ascending: false })
        .limit(1);

      if (maxOrderError) {
        console.error('Get max order error:', maxOrderError);
        throw maxOrderError;
      }

      const nextOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      // 添加新货币
      const { error: insertError } = await supabase
        .from('crypto_symbols')
        .insert({
          user_id: username,
          symbol: symbol.toUpperCase(),
          type: type,
          sort_order: nextOrder
        });

      if (insertError) {
        console.error('Insert symbol error:', insertError);
        throw insertError;
      }

      await fetchSymbols();
    } catch (error: any) {
      console.error('Error adding symbol:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('添加失败');
      }
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
        .eq('symbol', symbol)
        .eq('type', type);

      if (error) {
        console.error('Remove symbol error:', error);
        throw error;
      }

      await fetchSymbols();
    } catch (error: any) {
      console.error('Error removing symbol:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('删除失败');
      }
    }
  };

  useEffect(() => {
    if (username && !initialFetchDone.current) {
      initialFetchDone.current = true;
      void fetchSymbols();
    }
  }, [username, fetchSymbols]);

  return {
    symbols,
    fetchSymbols,
    addSymbol,
    removeSymbol
  };
} 