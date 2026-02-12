import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  loginRequest,
  resendOtpRequest,
  verifyOtpRequest,
} from "../store/slices/authSlice";
import { ArrowRight, RefreshCcw, ShieldCheck } from "lucide-react";
import type { AppDispatch } from "../store/store";
import { useAppSelector } from "../store/hooks";
import LoginRedirectHandler from "./LoginRedirectHandler";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [pjNumber, setPjNumber] = useState("");
  const [otp, setOtp] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, otpSent, message, user, isCheckingAuth } =
    useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) toast.error(error, { id: "auth-error" });
  }, [error]);

  useEffect(() => {
    if (message) toast.success(message, { id: "auth-message" });
  }, [message]);

  if (user && !isCheckingAuth) return <LoginRedirectHandler />;

  const handlePjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjNumber) return;
    dispatch(loginRequest(pjNumber));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    dispatch(verifyOtpRequest(otp));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex items-center justify-center relative">
      {/* Accent Bars */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#355E3B]" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#EFBF04]" />

      <div className="w-full max-w-md px-6">
        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#355E3B] tracking-tight">
            OFFICE OF THE REGISTRAR HIGH COURT
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
            task management system
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src="/logo.png"
                alt="Judiciary Logo"
                className="h-20 w-auto object-contain"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://res.cloudinary.com/do0yflasl/image/upload/v1770035125/JOB_LOGO_qep9lj.jpg")
                }
              />
            </div>

            <h2 className="text-lg font-bold text-gray-800">
              {otpSent ? "Verify Security Code" : "Staff Authentication"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {otpSent
                ? `Enter the OTP sent for ${pjNumber}`
                : "Please enter your PJ number to continue"}
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handlePjSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#355E3B] ml-1">
                  PJ Number
                </label>

                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <ShieldCheck size={18} />
                  </div>

                  <input
                    type="text"
                    value={pjNumber}
                    onChange={(e) =>
                      setPjNumber(e.target.value.toUpperCase())
                    }
                    className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-[#EFBF04] rounded-xl pl-12 pr-4 py-3 text-gray-800 font-bold outline-none"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#355E3B] hover:bg-[#2a4b2f] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Request Access"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#355E3B] text-center block">
                  Enter 6-Digit Code
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full mt-3 bg-gray-50 focus:bg-white border-2 border-transparent focus:border-[#EFBF04] rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.4em] text-[#355E3B] outline-none"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EFBF04] hover:bg-[#d4a904] text-[#355E3B] font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all"
                >
                  {loading ? "Verifying..." : "Confirm & Login"}
                </button>

                <button
                  type="button"
                  onClick={() => dispatch(resendOtpRequest(pjNumber))}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#355E3B]"
                >
                  <RefreshCcw size={12} />
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EFBF04] animate-pulse" />
            PRINCIPAL REGISTRY • ORHC
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
