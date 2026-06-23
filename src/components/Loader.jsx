import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = true, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100"></div>
            <Loader2 className="absolute inset-0 w-16 h-16 text-primary-600 animate-spin-slow" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-semibold text-surface-800">EquipmentsDekho</span>
            <span className="text-sm text-surface-500">{text}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin-slow" />
        <span className="text-sm text-surface-500">{text}</span>
      </div>
    </div>
  );
};

export default Loader;
