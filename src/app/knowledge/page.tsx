'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useKnowledge } from '@/hooks/useKnowledge';
import { KnowledgeContent } from '@/types/knowledge';
import ContentModal from './components/ContentModal';
import ContentCard from './components/ContentCard';
import ConfirmModal from '@/components/ConfirmModal';

export default function KnowledgePage() {
  const {
    tags,
    contents,
    activeTagId,
    setActiveTagId,
    addTag,
    addContent,
    updateContent,
    deleteContent,
    deleteTag
  } = useKnowledge();

  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<KnowledgeContent | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const filteredContents = contents.filter(content => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      content.title.toLowerCase().includes(searchLower) ||
      content.content.toLowerCase().includes(searchLower)
    );
  });

  const EmptyState = ({ message, icon }: { message: string; icon: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <p>{message}</p>
    </div>
  );

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await addTag(newTagName.trim());
      setNewTagName('');
      setShowAddTag(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleAddContent = async (title: string, content: string) => {
    if (!activeTagId) return;
    await addContent(title, content, activeTagId);
    setShowContentModal(false);
  };

  const handleUpdateContent = async (title: string, content: string) => {
    if (!editingContent) return;
    await updateContent(editingContent.id, { title, content });
    setEditingContent(null);
  };

  const handleDeleteTag = async (tagId: string) => {
    setDeletingTagId(tagId);
  };

  const confirmDeleteTag = async () => {
    if (!deletingTagId) return;
    
    try {
      await deleteTag(deletingTagId);
      // 如果删除的是当前激活的标签，切换到第一个标签
      if (deletingTagId === activeTagId && tags.length > 1) {
        const nextTag = tags.find(tag => tag.id !== deletingTagId);
        if (nextTag) {
          setActiveTagId(nextTag.id);
        }
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setDeletingTagId(null);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    setDeletingContentId(contentId);
  };

  const confirmDeleteContent = async () => {
    if (!deletingContentId) return;
    
    try {
      await deleteContent(deletingContentId);
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setDeletingContentId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-200/70 via-green-300/60 to-teal-400/70 p-5">
        <Link 
          href="/"
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 
            transition-all duration-300 backdrop-blur-md font-medium
            hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 
            active:scale-95 active:translate-y-0
            flex items-center gap-1 group"
        >
          <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>返回首页</span>
        </Link>

        <div className="max-w-6xl mx-auto pt-16">
          {/* 标签区域 */}
          <div className="mb-8 flex items-center justify-between">
            <div className="inline-flex bg-white/90 rounded-lg p-1 gap-2 shadow-lg">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <div key={tag.id} className="relative group">
                    <button
                      onClick={() => setActiveTagId(tag.id)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                        activeTagId === tag.id
                          ? 'bg-emerald-500 text-white'
                          : 'hover:bg-emerald-50 text-gray-600'
                      }`}
                    >
                      <span>{tag.name}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        flex items-center justify-center text-sm
                        hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  还没有标签，点击右侧添加
                </div>
              )}
            </div>

            {showAddTag ? (
              <div className="flex items-center gap-2 bg-white/90 rounded-lg p-1 shadow-lg">
                <input
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="输入标签名"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  确定
                </button>
                <button
                  onClick={() => {
                    setShowAddTag(false);
                    setNewTagName('');
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddTag(true)}
                className="h-10 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                  transition-all duration-300 shadow-lg hover:shadow-xl
                  hover:scale-105 hover:-translate-y-0.5 
                  active:scale-95 active:translate-y-0"
              >
                添加标签
              </button>
            )}
          </div>

          {/* 内容区域 */}
          {activeTagId ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setShowContentModal(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600
                    transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5
                    active:scale-95 active:translate-y-0"
                >
                  新增内容
                </button>

                <div className="relative">
                  <input
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="搜索内容..."
                    className="w-64 px-4 py-2 pr-10 bg-white/90 rounded-lg border border-gray-200
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {filteredContents.length > 0 ? (
                  filteredContents.map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onEdit={content => {
                        setEditingContent(content);
                      }}
                      onDelete={handleDeleteContent}
                      searchText={searchText}
                    />
                  ))
                ) : (
                  <EmptyState 
                    message={
                      searchText
                        ? "没有找到匹配的内容"
                        : "还没有内容，点击上方按钮添加"
                    }
                    icon={searchText ? "🔍" : "📝"}
                  />
                )}
              </div>
            </>
          ) : (
            <EmptyState 
              message="请先选择或创建一个标签"
              icon="🏷️"
            />
          )}

          {/* 弹窗 */}
          {(showContentModal || editingContent) && (
            <ContentModal
              title={editingContent?.title}
              content={editingContent?.content}
              onClose={() => {
                setShowContentModal(false);
                setEditingContent(null);
              }}
              onSubmit={editingContent ? handleUpdateContent : handleAddContent}
              preventClickClose
            />
          )}

          {/* 删除标签确认弹窗 */}
          {deletingTagId && (
            <ConfirmModal
              title="删除标签"
              message="确定要删除这个标签吗？删除后标签下的所有内容都会被删除。"
              onConfirm={confirmDeleteTag}
              onCancel={() => setDeletingTagId(null)}
            />
          )}

          {/* 删除内容确认弹窗 */}
          {deletingContentId && (
            <ConfirmModal
              title="删除内容"
              message="确定要删除这条内容吗？"
              onConfirm={confirmDeleteContent}
              onCancel={() => setDeletingContentId(null)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 