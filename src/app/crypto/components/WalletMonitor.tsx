'use client';
 
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ManageWalletModal from './ManageWalletModal';
import ConfirmModal from '@/components/ConfirmModal';

interface Wallet {
  id: string;
  address: string;
  note: string;
  created_at: string;
}

export default function WalletMonitor() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);

  const { username } = useAuth();

  // 获取钱包列表
  const fetchWallets = useCallback(async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取钱包列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void fetchWallets();
  }, [fetchWallets]);

  // 处理新增/编辑钱包
  const handleSubmit = async (data: { id?: string; address: string; note: string }) => {
    if (!username) return;

    try {
      if (data.id) {
        // 编辑
        const { error } = await supabase
          .from('wallets')
          .update({
            address: data.address,
            note: data.note,
          })
          .eq('id', data.id)
          .eq('user_id', username);

        if (error) throw error;
      } else {
        // 新增
        const { error } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: username,
              address: data.address,
              note: data.note,
            },
          ]);

        if (error) throw error;
      }

      void fetchWallets();
      setIsModalOpen(false);
      setEditingWallet(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  // 处理删除钱包
  const handleDelete = async (wallet: Wallet) => {
    setWalletToDelete(wallet);
  };

  const confirmDelete = async () => {
    if (!walletToDelete || !username) return;

    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletToDelete.id)
        .eq('user_id', username);

      if (error) throw error;
      void fetchWallets();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setWalletToDelete(null);
    }
  };

  // 处理编辑按钮点击
  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  // 处理新增按钮点击
  const handleAdd = () => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">钱包监控</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          添加钱包
        </button>
      </div>

      {/* 钱包列表 */}
      {wallets.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          暂无钱包数据，请点击右上角添加
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium mb-1">{wallet.note}</div>
                  <div className="text-gray-500 text-sm break-all">
                    {wallet.address}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="text-gray-600 hover:text-emerald-500 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(wallet)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 管理钱包弹窗 */}
      <ManageWalletModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWallet(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingWallet || undefined}
        title={editingWallet ? '编辑钱包' : '添加钱包'}
      />

      {/* 删除确认弹窗 */}
      {walletToDelete && (
        <ConfirmModal
          title="删除钱包"
          message={`确定要删除钱包 "${walletToDelete.note}" 吗？此操作不可恢复。`}
          onConfirm={confirmDelete}
          onCancel={() => setWalletToDelete(null)}
        />
      )}
    </div>
  );
} 