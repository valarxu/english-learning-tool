'use client';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
              transition-colors duration-300"
          >
            确定删除
          </button>
        </div>
      </div>
    </div>
  );
} 