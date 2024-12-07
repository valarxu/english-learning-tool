'use client';

import { useEffect, useState, useCallback } from "react";
import { useCards } from "../../hooks/useCards";
import { Card } from "../../types/card";
import { Word } from "../../types/word";  // 从正确的位置导入 Word 类型
import type { CardWithWordCount } from "../../hooks/useCards";
import Link from 'next/link';
import { useSpeech } from '../../hooks/useSpeech';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export default function VocabularyPage() {
  const { cards = [], addCard, addWordToCard, getWordsForCard, deleteCard, deleteWord } = useCards();
  const { username } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardWithWordCount | null>(null);
  const [cardWords, setCardWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState<Omit<Word, 'id' | 'cardId'>>({
    word: '',
    meaning: '',
    userId: username || '',
  });
  const [newCard, setNewCard] = useState<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    category: '',
    userId: username || '',
  });
  const [visibleMeanings, setVisibleMeanings] = useState<Set<string>>(new Set());
  const [cardToDelete, setCardToDelete] = useState<CardWithWordCount | null>(null);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const { speak } = useSpeech();

  const resetNewCard = useCallback(() => {
    setNewCard({
      title: '',
      description: '',
      category: '',
      userId: username || '',
    });
  }, [username]);

  const resetNewWord = useCallback(() => {
    setNewWord({
      word: '',
      meaning: '',
      userId: username || '',
    });
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCard(newCard);
    resetNewCard();
    setIsModalOpen(false);
  };

  const handleCardClick = async (card: CardWithWordCount) => {
    if (card.id) {
      setSelectedCard(card);
      const words = await getWordsForCard(card.id);
      setCardWords(words);
      setIsWordModalOpen(true);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCard?.id) {
      await addWordToCard(selectedCard.id, newWord);
      const updatedWords = await getWordsForCard(selectedCard.id);
      setCardWords(updatedWords);
      resetNewWord();
    }
  };

  const toggleMeaning = (wordId: string) => {
    setVisibleMeanings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const handleDeleteCard = async (card: CardWithWordCount, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToDelete(card);
  };

  const confirmDelete = async () => {
    if (cardToDelete?.id) {
      await deleteCard(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const handleDeleteWord = async (word: Word, e: React.MouseEvent) => {
    e.stopPropagation();
    setWordToDelete(word);
  };

  const confirmDeleteWord = async () => {
    if (wordToDelete?.id && selectedCard?.id) {
      await deleteWord(wordToDelete.id);
      const updatedWords = await getWordsForCard(selectedCard.id);
      setCardWords(updatedWords);
      setWordToDelete(null);
    }
  };

  const handleWordClick = (word: Word, wordId: string) => {
    toggleMeaning(wordId);
    if (!visibleMeanings.has(wordId)) {
      speak(word.word);
    }
  };

  useEffect(() => {
    resetNewCard();
    resetNewWord();
  }, [username, resetNewCard, resetNewWord]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-300/80 via-green-400/70 to-teal-500/80 p-5 relative">
        {/* 返回首页按钮 */}
        <Link 
          href="/"
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 hover:bg-white transition-all duration-300 backdrop-blur-md font-medium"
        >
          ← 返回首页
        </Link>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4 mt-12">
          {(cards as CardWithWordCount[]).map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card)}
              className="bg-white/90 rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white border border-gray-200 cursor-pointer relative group hover:shadow-xl h-40 flex flex-col"
            >
              {/* 删除按钮 */}
              <button
                onClick={(e) => handleDeleteCard(card, e)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <svg 
                  className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>

              {/* 标题 */}
              <h3 className="text-lg font-medium text-gray-800 mb-2">{card.title}</h3>
              
              {/* 描述 */}
              <p className="text-gray-600 text-sm flex-grow line-clamp-3">{card.description}</p>
              
              {/* 单词数量 */}
              <div className="mt-auto pt-3">
                <span className="text-sm bg-emerald-100 text-emerald-600 rounded-full px-3 py-1 inline-block font-medium">
                  {card.wordCount} 个单词
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 添加按钮 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center text-emerald-600 text-2xl border border-emerald-100 hover:scale-110 transition-all duration-300"
        >
          +
        </button>

        {/* Modal 样式更新为白色风格 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">标题</label>
                  <input
                    type="text"
                    value={newCard.title}
                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    placeholder="输入标题"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">描述</label>
                  <textarea
                    value={newCard.description}
                    onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 h-32"
                    placeholder="输入描述"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 单词管理 Modal */}
        {isWordModalOpen && selectedCard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl border border-gray-100 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-medium text-gray-800 mb-1">{selectedCard.title} - 单词列表</h2>
                  <p className="text-gray-500">共 {cardWords.length} 个单词</p>
                </div>
                <button
                  onClick={() => setIsWordModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transition-all duration-300"
                >
                  ✕
                </button>
              </div>

              {/* 添加新单词表单 */}
              <form onSubmit={handleAddWord} className="mb-8">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 font-medium">单词</label>
                    <input
                      type="text"
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      placeholder="输入单词"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 font-medium">释义</label>
                    <input
                      type="text"
                      value={newWord.meaning}
                      onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      placeholder="输入释义"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300 h-[42px]"
                  >
                    添加
                  </button>
                </div>
              </form>

              {/* 单词列表 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cardWords.map((word, index) => (
                  <div
                    key={word.id || index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWordClick(word, word.id || `${index}`);
                    }}
                    className="bg-white rounded-xl p-4 border border-gray-200 relative group hover:bg-gray-50 transition-all duration-300 shadow-sm h-32 flex flex-col justify-center cursor-pointer"
                  >
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWord(word, e);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>

                    <div className="text-center relative">
                      {/* 单词 */}
                      <div className={`transition-all duration-300 absolute inset-0 flex items-center justify-center ${
                        visibleMeanings.has(word.id || `${index}`) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                      }`}>
                        <h3 className="text-xl font-medium text-gray-800">{word.word}</h3>
                      </div>

                      {/* 释义 */}
                      <div className={`transition-all duration-300 absolute inset-0 flex items-center justify-center ${
                        visibleMeanings.has(word.id || `${index}`) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}>
                        <p className="text-gray-600">{word.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 如果没有单词，显示提示 */}
              {cardWords.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  还没有添加任何单词，开始添加吧！
                </div>
              )}
            </div>
          </div>
        )}

        {/* 确认删除 Modal */}
        {cardToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
              <h3 className="text-xl font-medium text-gray-800 mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除场景 &quot;{cardToDelete.title}&quot; 吗？该操作将同时删除场景下的所有单词，且不可恢复。
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setCardToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除单词确认 Modal */}
        {wordToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
              <h3 className="text-xl font-medium text-gray-800 mb-4">确认删除单词</h3>
              <p className="text-gray-600 mb-6">
                确定要删除单词 &quot;{wordToDelete.word}&quot; 吗？此操作不可恢复。
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setWordToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                >
                  取消
                </button>
                <button
                  onClick={confirmDeleteWord}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}