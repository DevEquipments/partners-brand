import { Clock, ArrowLeft } from "lucide-react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

export const UnderDevelopment = ({
  title = "Feature Under Development",
  description = "The backend API endpoint for this operation is currently being prepared. Real data and sync will become available once the backend service is deployed.",
  showBack = true,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`p-6 rounded-xl border border-dashed border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/20 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
        <Clock className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
        {description}
      </p>
      {showBack && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnderDevelopment;
