'use client';

interface ManageSymbolsModalProps {
  title: string;
  symbols: string[];
  newSymbol: string;
  onClose: () => void;
  onAdd: () => void;
  onRemove: (symbol: string) => void;
  onSymbolChange: (value: string) => void;
}

export default function ManageSymbolsModal({
  title,
  symbols,
  newSymbol,
  onClose,
  onAdd,
  onRemove,
  onSymbolChange
}: ManageSymbolsModalProps) {
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl"
        onClick={handleModalClick}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">{title}</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            placeholder="输入货币符号（如 BTC）"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
          >
            添加
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {symbols.map((symbol, index) => (
            <div 
              key={symbol}
              className="flex items-center p-2 bg-gray-50 rounded-lg"
            >
              <span className="w-8 text-gray-400 select-none">
                {index + 1}.
              </span>
              <span className="flex-1">{symbol}</span>
              <button
                onClick={() => onRemove(symbol)}
                className="text-red-500 hover:text-red-600 ml-2"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 