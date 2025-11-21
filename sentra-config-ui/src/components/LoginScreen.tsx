import React, { useState, useEffect } from 'react';
import { IoArrowForwardCircleOutline } from 'react-icons/io5';
import { useDevice } from '../hooks/useDevice';

interface LoginScreenProps {
    onLogin: (token: string) => Promise<boolean>;
    wallpaper?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, wallpaper }) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [time, setTime] = useState(new Date());
    const { isMobile } = useDevice();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!token.trim()) return;

        setLoading(true);
        setError(false);

        try {
            const success = await onLogin(token);
            if (!success) {
                handleError();
            }
        } catch (err) {
            handleError();
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setToken('');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: wallpaper ? `url(${wallpaper})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 99999,
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Backdrop Blur Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 0
            }} />

            {/* Top Section: Clock */}
            <div style={{
                zIndex: 1,
                marginTop: isMobile ? '15vh' : '10vh',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                animation: 'fadeInDown 1s ease-out'
            }}>
                <div style={{
                    fontSize: isMobile ? '4rem' : '6rem',
                    fontWeight: 200,
                    letterSpacing: '-2px'
                }}>
                    {formatTime(time)}
                </div>
                <div style={{
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    fontWeight: 400,
                    opacity: 0.9
                }}>
                    {formatDate(time)}
                </div>
            </div>

            {/* Center Section: Login Form */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? 16 : 24,
                marginBottom: isMobile ? '30vh' : '20vh',
                animation: 'fadeInUp 1s ease-out 0.2s backwards'
            }}>
                {/* Avatar */}
                <div style={{
                    width: isMobile ? 80 : 120,
                    height: isMobile ? 80 : 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <img
                        src="/sentra.png"
                        alt="User"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: '50%',
                            border: '4px solid transparent',
                            borderTopColor: '#007aff',
                            animation: 'spin 1s linear infinite'
                        }} />
                    )}
                </div>

                <div style={{
                    fontSize: isMobile ? 20 : 28,
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    管理员
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none',
                        width: '100%'
                    }}
                >
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => {
                            setToken(e.target.value);
                            setError(false);
                        }}
                        placeholder="请输入密码"
                        autoFocus
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 30,
                            padding: '12px 24px',
                            paddingRight: 48, // Make room for the button
                            color: 'white',
                            fontSize: 16,
                            width: isMobile ? 200 : 240,
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                        }}
                        className="login-input"
                    />

                    <button
                        type="submit"
                        disabled={!token || loading}
                        style={{
                            position: 'absolute',
                            right: isMobile ? 'calc(50% - 96px)' : 'calc(50% - 116px)', // Center relative to input
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            cursor: token ? 'pointer' : 'default',
                            opacity: token ? 1 : 0,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            padding: 0
                        }}
                    >
                        <IoArrowForwardCircleOutline size={24} color="white" />
                    </button>
                </form>

                {error && (
                    <div style={{
                        fontSize: 13,
                        color: '#ff6b6b',
                        marginTop: -10,
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        密码错误，请重试
                    </div>
                )}
            </div>

            {/* Bottom Status Bar */}
            {!isMobile && (
                <div style={{
                    zIndex: 1,
                    marginBottom: 20,
                    display: 'flex',
                    gap: 30,
                    opacity: 0.8,
                    fontSize: 14,
                    fontWeight: 500
                }}>
                    <div style={{ cursor: 'pointer' }}>睡眠</div>
                    <div style={{ cursor: 'pointer' }}>重启</div>
                    <div style={{ cursor: 'pointer' }}>关机</div>
                </div>
            )}

            <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .login-input:focus {
          background: rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
        </div>
    );
};
