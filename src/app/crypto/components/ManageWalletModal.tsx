import { useState, useEffect } from 'react';

interface WalletData {
  id?: string;
  address: string;
  note: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WalletData) => void;
  initialData?: WalletData;
  title: string;
}

export default function ManageWalletModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}: Props) {
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setAddress(initialData.address);
      setNote(initialData.note);
    } else {
      setAddress('');
      setNote('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      address: address.trim(),
      note: note.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw]">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              钱包地址
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="请输入钱包地址"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注信息
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="请输入备注信息"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 