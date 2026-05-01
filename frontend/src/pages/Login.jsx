import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div style={{
                position: 'absolute', width: '400px', height: '400px',
                background: 'rgba(167,139,250,0.15)',
                borderRadius: '50%', top: '-100px', left: '-100px',
                filter: 'blur(80px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', width: '400px', height: '400px',
                background: 'rgba(96,165,250,0.15)',
                borderRadius: '50%', bottom: '-100px', right: '-100px',
                filter: 'blur(80px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', width: '300px', height: '300px',
                background: 'rgba(245,87,108,0.1)',
                borderRadius: '50%', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(80px)', pointerEvents: 'none'
            }} />

            {/* Card */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '3rem',
                width: '100%',
                maxWidth: '420px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
                position: 'relative', zIndex: 1
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', margin: '0 auto 1rem',
                        boxShadow: '0 10px 30px rgba(167,139,250,0.4)'
                    }}>
                        🗂️
                    </div>
                    <h1 style={{
                        margin: 0, fontSize: '1.8rem', fontWeight: '800',
                        background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        TaskFlow
                    </h1>
                    <p style={{
                        margin: '6px 0 0', color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.9rem'
                    }}>
                        Sign in to your workspace ✨
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(255,65,108,0.15)',
                        border: '1px solid rgba(255,65,108,0.3)',
                        borderRadius: '12px', padding: '12px 16px',
                        color: '#ff416c', fontSize: '0.85rem',
                        fontWeight: '600', marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem',
                            fontWeight: '600', color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px', letterSpacing: '0.05em'
                        }}>
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem',
                            fontWeight: '600', color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px', letterSpacing: '0.05em'
                        }}>
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: loading
                                ? 'rgba(167,139,250,0.4)'
                                : 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 10px 30px rgba(167,139,250,0.4)',
                            transition: 'all 0.2s',
                            letterSpacing: '0.02em'
                        }}
                        onMouseEnter={e => {
                            if (!loading) e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? '⏳ Signing in...' : 'Sign In 🚀'}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    textAlign: 'center', marginTop: '2rem',
                    padding: '1rem 0 0',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                        Team Task Manager • Built with ⚡ FastAPI + React
                    </p>
                </div>
            </div>
        </div>
    );
}