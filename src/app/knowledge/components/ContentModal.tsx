'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface ContentModalProps {
  title?: string;
  content?: string;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
  preventClickClose?: boolean;
}

export default function ContentModal({ 
  title = '', 
  content = '', 
  onClose, 
  onSubmit,
  preventClickClose = false
}: ContentModalProps) {
  const [newTitle, setNewTitle] = useState(title);
  const [newContent, setNewContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(newTitle.trim(), newContent.trim());
      onClose();
    } catch (error) {
      console.error('Error submitting content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = () => {
    if (!preventClickClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="输入标题"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />

        <div data-color-mode="light">
          <MDEditor
            value={newContent}
            onChange={value => setNewContent(value || '')}
            height={400}
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
              transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
} 