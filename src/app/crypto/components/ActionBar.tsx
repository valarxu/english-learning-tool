'use client';

interface ActionBarProps {
  title: string;
  lastUpdateTime: string;
  isLoading: boolean;
  onOpenModal: () => void;
  onRefresh: () => void;
}

export default function ActionBar({ title, lastUpdateTime, isLoading, onOpenModal, onRefresh }: ActionBarProps) {
  return (
    <div className="h-9 flex items-center gap-3 px-4 rounded-lg bg-white/90 shadow-lg">
      <h2 className="text-gray-800 font-medium">{title}</h2>
      {lastUpdateTime && (
        <span className="text-sm text-gray-500">
          更新于: {lastUpdateTime}
        </span>
      )}
      <button
        onClick={onOpenModal}
        className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
      >
        管理货币
      </button>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? '加载中...' : '刷新数据'}
      </button>
    </div>
  );
} 