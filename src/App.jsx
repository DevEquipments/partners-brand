import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { CRMProvider } from "./context/CRMContext";
import AppErrorBoundary from "./components/common/AppErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <CRMProvider>
            <AppErrorBoundary>
              <AppRoutes />
            </AppErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#0f172a",
                  color: "#f8fafc",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "10px 14px",
                  border: "1px solid #1e293b",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#f8fafc",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#f8fafc",
                  },
                },
              }}
            />
          </CRMProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
