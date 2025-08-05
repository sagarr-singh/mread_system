import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import AppSidebar from "./components/layout/Sidebar";
import ProtectedRoute from "./routes/ProtectedRoutes";
import RedirectToHome from "./routes/RedirectToHome";
import { useAuth } from "./context/AuthContext";
import Spinner from "./spinner";

const Bill = lazy(() => import("./pages/BillPage"));
const OCRMeterReading = lazy(() => import("./pages/MeterReading"));
const Upload = lazy(() => import("./pages/UploadPage"));
const NotUpload = lazy(() => import("./pages/NotUploadPage"));
const Summary = lazy(() => import("./pages/BillSummary"));
const MeterReadingPage = lazy(() => import("./components/MeterReadingPage"));
const BillDetailSummaryTable = lazy(() => import("./components/BillDetailSummaryTable"));
const ImagesIpa = lazy(() => import("./components/ImagesIpa"));
const Login = lazy(() => import("./login/Login"));
const Logout = lazy(() => import("./Logout/Logout"));
const SendCycle = lazy(() => import("./cycles/SendCycle"));
const SendSinghCycle = lazy(() => import("./cycles/SendSinghCycle"));
const OCRStatus = lazy(() => import("./ocrstatus/OcrStatus"));

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter basename="/Panel/V2/">
      <div className="w-screen h-screen flex flex-row text-black overflow-hidden bg-gray-100">
        {isLoggedIn && <AppSidebar />}

        <div className="flex flex-col flex-1 overflow-hidden">
          {isLoggedIn && <Logout />}

          <main className="flex-1 overflow-y-auto">
            <Toaster position="top-center" reverseOrder={false} />

            <Suspense fallback={<div className="mt-20"><Spinner /></div>}>
              <Routes>
                <Route path="/" element={<RedirectToHome />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/bill" element={<ProtectedRoute><Bill /></ProtectedRoute>} />
                <Route path="/ocrmeterreading" element={<ProtectedRoute><MeterReadingPage /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/notupload" element={<ProtectedRoute><NotUpload /></ProtectedRoute>} />
                <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
                <Route path="/MeterReading" element={<ProtectedRoute><MeterReadingPage /></ProtectedRoute>} />
                <Route path="/BillDetailSummary" element={<ProtectedRoute><BillDetailSummaryTable /></ProtectedRoute>} />
                <Route path="/ipa" element={<ProtectedRoute><ImagesIpa /></ProtectedRoute>} />
                <Route path="/sendcycle" element={<ProtectedRoute><SendCycle /></ProtectedRoute>} />
                <Route path="/sendsingle" element={<ProtectedRoute><SendSinghCycle /></ProtectedRoute>} />
                <Route path="/ocrstatus" element={<ProtectedRoute><OCRStatus /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
