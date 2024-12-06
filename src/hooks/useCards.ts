import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card } from '../types/card';
import { Word } from '../types/word';
import { useAuth } from '../contexts/AuthContext';

// 添加 CardWithWordCount 接口
export interface CardWithWordCount extends Card {
  wordCount: number;
}

export function useCards() {
  const [cards, setCards] = useState<CardWithWordCount[]>([]);
  const { username } = useAuth();

  // 获取卡片列表
  const fetchCards = async () => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          words:words(count)
        `)
        .eq('user_id', username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cards:', error);
        return;
      }

      const cardsWithCount = (data || []).map(card => ({
        ...card,
        wordCount: card.words?.[0]?.count || 0
      }));

      setCards(cardsWithCount);
    } catch (error) {
      console.error('Error in fetchCards:', error);
    }
  };

  // 添加卡片
  const addCard = async (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{
          title: card.title,
          description: card.description,
          category: card.category,
          user_id: username,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding card:', error);
        throw error;
      }
      await fetchCards();
      return data;
    } catch (error) {
      console.error('Error in addCard:', error);
      throw error;
    }
  };

  // 添加单词
  const addWordToCard = async (cardId: string, word: Omit<Word, 'id' | 'cardId'>) => {
    const { data, error } = await supabase
      .from('words')
      .insert([{
        word: word.word,
        meaning: word.meaning,
        card_id: cardId,
        user_id: username
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding word:', error);
      throw error;
    }
    await fetchCards();
    return data;
  };

  // 获取卡片的单词
  const getWordsForCard = async (cardId: string) => {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('card_id', cardId)
      .eq('user_id', username);

    if (error) throw error;
    return data || [];
  };

  // 删除卡片
  const deleteCard = async (cardId: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', username);

    if (error) throw error;
    await fetchCards();
  };

  // 删除单词
  const deleteWord = async (wordId: string) => {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)
      .eq('user_id', username);

    if (error) throw error;
  };

  // 初始加载卡片
  useEffect(() => {
    if (username) {
      fetchCards();
    }
  }, [username]);

  return {
    cards,
    addCard,
    addWordToCard,
    getWordsForCard,
    deleteCard,
    deleteWord,
  };
}