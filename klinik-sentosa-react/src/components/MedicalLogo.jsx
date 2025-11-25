import React from 'react'
import { Zap, Shield } from 'lucide-react'

export default function MedicalLogo({ size = 'md', variant = 'dark', className = '' }) {
    const sizes = {
        sm: 'h-10',
        md: 'h-14',
        lg: 'h-18',
        xl: 'h-24'
    }

    const textSize = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl'
    }

    const isDark = variant === 'dark'

    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            <div className={`relative ${sizes[size]} aspect-square`}>
                {/* Outer Glow */}
                <div className="absolute inset-[-18%] bg-gradient-to-br from-cyan-400/20 via-teal-400/15 to-emerald-400/15 rounded-full blur-xl opacity-60"></div>

                {/* Main Logo Container */}
                <div className="relative w-full h-full group transition-all duration-400 ease-out hover:scale-105">
                    {/* Shield SVG */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="50%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0f2fe" />
                            </linearGradient>
                            <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                            <filter id="elegantShadow">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
                            </filter>
                            <clipPath id="shieldClip">
                                <path d="M 50,10 C 50,10 20,15 10,25 C 10,35 5,60 10,75 C 15,90 50,110 50,110 C 50,110 85,90 90,75 C 95,60 90,35 90,25 C 80,15 50,10 50,10 Z" />
                            </clipPath>
                        </defs>

                        <path
                            d="M 50,10 C 50,10 20,15 10,25 C 10,35 5,60 10,75 C 15,90 50,110 50,110 C 50,110 85,90 90,75 C 95,60 90,35 90,25 C 80,15 50,10 50,10 Z"
                            fill="url(#shieldGradient)"
                            filter="url(#elegantShadow)"
                            className="group-hover:brightness-105 transition-all duration-400"
                        />
                        <path
                            d="M 50,15 C 50,15 23,19 15,27 C 15,36 11,58 15,71 C 19,84 50,102 50,102 C 50,102 81,84 85,71 C 89,58 85,36 85,27 C 77,19 50,15 50,15 Z"
                            fill="none"
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth="1"
                        />

                        <g clipPath="url(#shieldClip)" className="group-hover:opacity-100 opacity-0 transition-opacity duration-700">
                            <rect x="-10" y="0" width="25" height="120" fill="url(#holoGradient)" className="animate-holo-sweep" />
                        </g>
                    </svg>

                    {/* Heart */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3/5 h-3/5 group-hover:scale-108 transition-transform duration-400" viewBox="0 0 100 100">
                            <path
                                d="M 50,75 C 50,75 20,55 20,40 C 20,30 25,25 32,25 C 40,25 45,30 50,38 C 55,30 60,25 68,25 C 75,25 80,30 80,40 C 80,55 50,75 50,75 Z"
                                fill="url(#heartGradient)"
                                className="drop-shadow-lg animate-heartbeat"
                            />
                            <path
                                d="M 15,50 L 30,50 L 35,42 L 40,58 L 45,50 L 50,35 L 55,65 L 60,50 L 65,46 L 70,54 L 75,50 L 85,50"
                                stroke="#0ea5e9"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.8"
                                className="group-hover:opacity-100 transition-opacity duration-400 animate-ecg-pulse"
                            />
                            <circle cx="50" cy="50" r="2.5" fill="#06b6d4" opacity="0.8" className="animate-glow-ping" />
                            <circle cx="50" cy="50" r="5" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" className="animate-ripple" />
                        </svg>
                    </div>

                    {/* Sparkles */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle-1"></div>
                        <div className="absolute top-[35%] right-[28%] w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle-2"></div>
                        <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle-3"></div>
                        <div className="absolute bottom-[25%] right-[25%] w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle-4"></div>
                    </div>

                    {/* Breathing Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-teal-400/10 rounded-full opacity-0 group-hover:opacity-100 animate-breathing blur-xl"></div>

                    {/* Rotating Ring */}
                    <svg className="absolute inset-[-2%] w-[104%] h-[104%] opacity-15 group-hover:opacity-25 transition-opacity duration-400" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="49" fill="none" stroke="url(#shieldGradient)" strokeWidth="0.4" strokeDasharray="4,8" className="animate-slow-spin" />
                    </svg>
                </div>

                <div className="absolute bottom-[-2%] left-1/2 transform -translate-x-1/2 w-3/4 h-1.5 bg-cyan-900/15 rounded-full blur-sm"></div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
                <h1 className={`leading-none tracking-tight ${textSize[size]}`}>
                    <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                        Klinik
                    </span>{' '}
                    <span className={`${isDark ? 'text-gray-800' : 'text-white'} font-semibold`}>
                        Sentosa
                    </span>
                </h1>
                {size !== 'sm' && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                            <Zap className={`${size === 'lg' || size === 'xl' ? 'w-3 h-3' : 'w-2.5 h-2.5'} ${isDark ? 'text-cyan-500' : 'text-cyan-300'}`} />
                            <Shield className={`${size === 'lg' || size === 'xl' ? 'w-3 h-3' : 'w-2.5 h-2.5'} ${isDark ? 'text-teal-500' : 'text-teal-300'}`} />
                        </div>
                        <span className={`text-[11px] font-semibold tracking-wide uppercase ${isDark ? 'text-gray-600' : 'text-white/90'}`}>
                            Premium Care
                        </span>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slow-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    10% { transform: scale(1.05); }
                    20% { transform: scale(1); }
                    30% { transform: scale(1.05); }
                    40%, 100% { transform: scale(1); }
                }
                @keyframes ecg-pulse {
                    0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 2px rgba(14, 165, 233, 0.5)); }
                    50% { opacity: 1; filter: drop-shadow(0 0 4px rgba(14, 165, 233, 0.8)); }
                }
                @keyframes glow-ping {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes holo-sweep {
                    0% { transform: translateX(-40px); }
                    100% { transform: translateX(140px); }
                }
                @keyframes sparkle-1 {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes sparkle-2 {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes sparkle-3 {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes sparkle-4 {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes breathing {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .animate-slow-spin { animation: slow-spin 50s linear infinite; }
                .animate-heartbeat { animation: heartbeat 2s ease-in-out infinite; }
                .animate-ecg-pulse { animation: ecg-pulse 2s ease-in-out infinite; }
                .animate-glow-ping { animation: glow-ping 2s ease-in-out infinite; }
                .animate-ripple { animation: ripple 2s ease-out infinite; }
                .animate-holo-sweep { animation: holo-sweep 1.5s ease-out infinite; animation-delay: 2s; }
                .animate-sparkle-1 { animation: sparkle-1 2s ease-in-out infinite; }
                .animate-sparkle-2 { animation: sparkle-2 2s ease-in-out infinite; animation-delay: 0.5s; }
                .animate-sparkle-3 { animation: sparkle-3 2s ease-in-out infinite; animation-delay: 1s; }
                .animate-sparkle-4 { animation: sparkle-4 2s ease-in-out infinite; animation-delay: 1.5s; }
                .animate-breathing { animation: breathing 3s ease-in-out infinite; }
                .hover\\:scale-108:hover { transform: scale(1.08); }
            `}</style>
        </div>
    )
}
