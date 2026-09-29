import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          404
        </h1>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          The view or operational record you are looking for does not exist, has been moved, or you may not have authorization to view it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={ArrowLeft}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/")}
            icon={Home}
            className="w-full sm:w-auto"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
