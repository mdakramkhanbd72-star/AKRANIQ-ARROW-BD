import React, { useState, useEffect } from 'react';
import {
  Cloud,
  X,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  KeyRound,
} from 'lucide-react';
import { UserAccount } from '../types/game';
import { soundManager } from '../services/soundManager';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (account: UserAccount) => void;
}

type AuthScreenState = 'OPTIONS' | 'GOOGLE' | 'FACEBOOK' | 'EMAIL' | 'PHONE';

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [screen, setScreen] = useState<AuthScreenState>('OPTIONS');

  // Google form states
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Facebook form states
  const [fbName, setFbName] = useState('');
  const [fbId, setFbId] = useState('');

  // Email form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailName, setEmailName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Phone OTP states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (otpSent && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          {screen !== 'OPTIONS' ? (
            <button
              onClick={() => {
                soundManager.playClick();
                setScreen('OPTIONS');
              }}
              className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <h3 className="text-xs font-black tracking-widest text-[#4A7C59] dark:text-[#829079] uppercase">
            Account Login
          </h3>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {screen === 'OPTIONS' && (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#4A7C59]/10 dark:bg-[#4A7C59]/20 flex items-center justify-center text-[#4A7C59] dark:text-[#829079] mb-3">
                <Cloud className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                Save Game Progress
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mb-6">
                Link your account to keep your unlocked levels, high scores, and stars safely synced to the cloud.
              </p>

              <div className="w-full space-y-2.5">
                {/* Google Button */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setScreen('GOOGLE');
                  }}
                  className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-semibold text-sm transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#4285F4] font-black text-sm shadow-xs">
                    G
                  </span>
                  Continue with Google
                </button>

                {/* Facebook Button */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setScreen('FACEBOOK');
                  }}
                  className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm transition-all shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1877F2] font-black text-sm">
                    f
                  </span>
                  Continue with Facebook
                </button>

                <div className="flex items-center my-3 gap-3">
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                  <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                    or
                  </span>
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                </div>

                {/* Email Button */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setScreen('EMAIL');
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300 font-medium text-sm transition-all"
                >
                  <Mail className="w-4 h-4 text-[#4A7C59]" />
                  Continue with Email
                </button>

                {/* Mobile OTP Button */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setScreen('PHONE');
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300 font-medium text-sm transition-all"
                >
                  <Phone className="w-4 h-4 text-[#4A7C59]" />
                  Continue with Mobile OTP
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In View */}
          {screen === 'GOOGLE' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-black text-xl mb-3 shadow-md">
                G
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                Google Sign In
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Select an existing account or enter your profile details
              </p>

              {/* Quick Pick Card */}
              <div
                onClick={() => {
                  soundManager.playArrowExit();
                  onSuccessLogin({
                    id: `google_${Math.random().toString(36).substring(2, 9)}`,
                    displayName: 'Google Player',
                    identifier: 'player@gmail.com',
                    provider: 'GOOGLE',
                    joinedTimestamp: Date.now(),
                    lastSyncedLevel: 1,
                    lastSyncedScore: 0,
                  });
                }}
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 hover:border-[#4A7C59] cursor-pointer flex items-center gap-3 transition-all mb-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#4A7C59] flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    Google Player
                  </div>
                  <div className="text-xs text-stone-400">player@gmail.com</div>
                </div>
                <CheckCircle className="w-5 h-5 text-[#4A7C59]" />
              </div>

              <div className="w-full text-xs text-stone-400 mb-3 text-left">
                or customize name & email:
              </div>

              <div className="w-full space-y-2.5">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                />
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                />
                <button
                  onClick={() => {
                    const email = googleEmail.trim() || 'user@gmail.com';
                    const name =
                      googleName.trim() ||
                      email.split('@')[0].replace(/^./, (str) => str.toUpperCase());
                    soundManager.playArrowExit();
                    onSuccessLogin({
                      id: `google_${Math.random().toString(36).substring(2, 9)}`,
                      displayName: name,
                      identifier: email,
                      provider: 'GOOGLE',
                      joinedTimestamp: Date.now(),
                      lastSyncedLevel: 1,
                      lastSyncedScore: 0,
                    });
                  }}
                  className="w-full h-12 mt-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
                >
                  Confirm & Continue with Google
                </button>
              </div>
            </div>
          )}

          {/* Facebook Sign In View */}
          {screen === 'FACEBOOK' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-black text-2xl mb-3 shadow-md">
                f
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                Facebook Sign In
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Sign in using your Facebook account profile
              </p>

              {/* Quick Pick Card */}
              <div
                onClick={() => {
                  soundManager.playArrowExit();
                  onSuccessLogin({
                    id: `fb_${Math.random().toString(36).substring(2, 9)}`,
                    displayName: 'Facebook Gamer',
                    identifier: 'facebook.user@fb.com',
                    provider: 'FACEBOOK',
                    joinedTimestamp: Date.now(),
                    lastSyncedLevel: 1,
                    lastSyncedScore: 0,
                  });
                }}
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 hover:border-[#1877F2] cursor-pointer flex items-center gap-3 transition-all mb-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-sm">
                  f
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    Facebook Gamer
                  </div>
                  <div className="text-xs text-stone-400">facebook.user@fb.com</div>
                </div>
                <CheckCircle className="w-5 h-5 text-[#1877F2]" />
              </div>

              <div className="w-full space-y-2.5">
                <input
                  type="text"
                  placeholder="Profile Name (Optional)"
                  value={fbName}
                  onChange={(e) => setFbName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
                <input
                  type="text"
                  placeholder="Facebook Email or Username"
                  value={fbId}
                  onChange={(e) => setFbId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
                <button
                  onClick={() => {
                    const identifier = fbId.trim() || 'facebook.player@fb.com';
                    const name = fbName.trim() || 'Facebook Player';
                    soundManager.playArrowExit();
                    onSuccessLogin({
                      id: `fb_${Math.random().toString(36).substring(2, 9)}`,
                      displayName: name,
                      identifier: identifier,
                      provider: 'FACEBOOK',
                      joinedTimestamp: Date.now(),
                      lastSyncedLevel: 1,
                      lastSyncedScore: 0,
                    });
                  }}
                  className="w-full h-12 mt-2 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-md transition-all"
                >
                  Confirm & Continue with Facebook
                </button>
              </div>
            </div>
          )}

          {/* Email View */}
          {screen === 'EMAIL' && (
            <div className="flex flex-col">
              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 mb-4">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setEmailError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isSignUp
                      ? 'bg-[#4A7C59] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setEmailError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSignUp
                      ? 'bg-[#4A7C59] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-3">
                {isSignUp && (
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      setEmailError(null);
                    }}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setEmailError(null);
                    }}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {emailError && (
                  <div className="text-xs text-red-500 font-medium px-1">
                    {emailError}
                  </div>
                )}

                <button
                  onClick={() => {
                    const email = emailAddress.trim();
                    if (!email || !email.includes('@') || !email.includes('.')) {
                      setEmailError('Please enter a valid email address.');
                      return;
                    }
                    if (password.length < 6) {
                      setEmailError('Password must be at least 6 characters.');
                      return;
                    }
                    const displayName =
                      isSignUp && emailName.trim()
                        ? emailName.trim()
                        : email.split('@')[0].replace(/^./, (str) => str.toUpperCase());

                    soundManager.playArrowExit();
                    onSuccessLogin({
                      id: `email_${Math.random().toString(36).substring(2, 9)}`,
                      displayName,
                      identifier: email,
                      provider: 'EMAIL',
                      joinedTimestamp: Date.now(),
                      lastSyncedLevel: 1,
                      lastSyncedScore: 0,
                    });
                  }}
                  className="w-full h-12 mt-3 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
                >
                  {isSignUp ? 'Create Account & Save' : 'Sign In & Sync'}
                </button>
              </div>
            </div>
          )}

          {/* Mobile Phone OTP View */}
          {screen === 'PHONE' && (
            <div className="flex flex-col">
              {!otpSent ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                      Mobile Login / Sign Up
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      We will send a one-time 6-digit verification code to your phone number.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError(null);
                        }}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                      />
                    </div>

                    {phoneError && (
                      <div className="text-xs text-red-500 font-medium px-1">
                        {phoneError}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const digits = phone.replace(/\D/g, '');
                        if (digits.length < 7) {
                          setPhoneError('Please enter a valid phone number.');
                          return;
                        }
                        setOtpSent(true);
                      }}
                      className="w-full h-12 mt-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
                    >
                      Send Verification Code
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                      Enter 6-Digit OTP
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Verification code sent to {phone}
                    </p>
                  </div>

                  {/* Auto-fill Hint banner */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#4A7C59]/10 text-xs text-[#4A7C59] dark:text-[#829079] mb-3">
                    <span className="font-semibold">Demo Code: 123456</span>
                    <button
                      onClick={() => {
                        setOtp('123456');
                        setPhoneError(null);
                      }}
                      className="font-bold underline cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value);
                          setPhoneError(null);
                        }}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#4A7C59]"
                      />
                    </div>

                    {phoneError && (
                      <div className="text-xs text-red-500 font-medium px-1">
                        {phoneError}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs px-1 text-stone-500">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="hover:underline"
                      >
                        Change Number
                      </button>
                      {countdown > 0 ? (
                        <span>Resend in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCountdown(60)}
                          className="font-bold text-[#4A7C59] hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (otp.length < 4) {
                          setPhoneError('Please enter the 6-digit verification code.');
                          return;
                        }
                        soundManager.playArrowExit();
                        onSuccessLogin({
                          id: `phone_${Math.random().toString(36).substring(2, 9)}`,
                          displayName: `User ${phone.slice(-4) || '9988'}`,
                          identifier: phone,
                          provider: 'PHONE',
                          joinedTimestamp: Date.now(),
                          lastSyncedLevel: 1,
                          lastSyncedScore: 0,
                        });
                      }}
                      className="w-full h-12 mt-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
                    >
                      Verify & Save Progress
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
