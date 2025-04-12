import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import '../styles/LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('driver');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // Simulate success and store dummy user data
        localStorage.setItem('userId', 'dummy123');
        localStorage.setItem('role', role);
        localStorage.setItem('token', 'dummy-token');

        if (role === 'driver') {
            navigate('/driver-dashboard');
        } else {
            navigate('/passenger-dashboard');
        }
    };

    const handleSignUp = () => {
        navigate('/register');
    };

    return (
        <div className="login-screen">
            <div className="login-screen-body">
                <div className="login-header">
                    <div className="login-app-logo"></div>
                    <h2>UniRide</h2>
                    <p className="text-gray">Your university carpooling solution</p>
                </div>

                <div className="login-form-group">
                    <div className="login-form-label">University Email</div>
                    <input
                        type="email"
                        className="login-input-field"
                        placeholder="studentid@st.habib.edu.pk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="login-form-group">
                    <div className="login-form-label">Password</div>
                    <input
                        type="password"
                        className="login-input-field"
                        placeholder="●●●●●●●●"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="login-form-group">
                    <div className="login-form-label">Login as</div>
                    <div className="login-role-container">
                        <button
                            className={`login-role-button ${role === 'driver' ? 'active' : ''}`}
                            onClick={() => setRole('driver')}
                        >
                            Driver
                        </button>
                        <button
                            className={`login-role-button ${role === 'passenger' ? 'active' : ''}`}
                            onClick={() => setRole('passenger')}
                        >
                            Passenger
                        </button>
                    </div>
                </div>

                <div className="login-action-buttons">
                    <button className="login-button" onClick={handleLogin}>
                        Login
                    </button>
                    <button className="signup-button" onClick={handleSignUp}>
                        Sign Up
                    </button>
                </div>

                <div className="login-forgot-password">
                    <a href="#">Forgot Password?</a>
                </div>
            </div>
        </div>
    );
}
