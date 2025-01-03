'use client';

import { useState } from 'react';
import MDPreview from '@uiw/react-markdown-preview';
import { KnowledgeContent } from '@/types/knowledge';

interface ContentCardProps {
  content: KnowledgeContent;
  onEdit: (content: KnowledgeContent) => void;
  onDelete: (id: string) => void;
  searchText?: string;
}

export default function ContentCard({ 
  content, 
  onEdit, 
  onDelete,
  searchText = ''
}: ContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 高亮搜索文本
  const highlightText = (text: string) => {
    if (!searchText.trim()) return text;

    const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === searchText.toLowerCase() ? (
            <span key={i} className="bg-yellow-200">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-medium text-gray-800">
          {highlightText(content.title)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(content)}
            className="text-gray-500 hover:text-emerald-600"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(content.id)}
            className="text-gray-500 hover:text-red-600"
          >
            删除
          </button>
        </div>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-none' : 'max-h-40'
        }`}
      >
        <div data-color-mode="light">
          <MDPreview source={content.content} />
        </div>
      </div>

      {content.content.length > 200 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      )}
    </div>
  );
} 