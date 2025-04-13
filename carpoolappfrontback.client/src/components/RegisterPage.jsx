import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
    });
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResendOtp, setCanResendOtp] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let timer;
        if (isOtpSent && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        setCanResendOtp(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOtpSent, countdown]);

    const handleSendOtp = async () => {
        setError('');
        setCanResendOtp(false);

        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/send-otp', {
                universityEmail: formData.email
            });

            if (response.data.success) {
                setIsOtpSent(true);
                setCountdown(60);
                setCanResendOtp(false);
            } else {
                setError(response.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error("Error details:", err.response);
            setError(err.response?.data?.message || 'Failed to send OTP.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            setError('Please enter the OTP.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/verify-otp', {
                universityEmail: formData.email,
                otp: formData.otp
            });

            if (response.data.success) {
                setIsOtpVerified(true);
                setError('');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        }
    };

    const handleRegister = async () => {
        if (!isOtpVerified) {
            setError('Please verify your OTP first.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/register', {
                fullName: formData.fullName,
                universityEmail: formData.email,
                phoneNumber: formData.phone,
                password: formData.password
            });

            if (response.data.success) {
                alert('Registration successful! Please login now.');
                navigate('/login'); // ✅ Redirect to Login page after successful register
            } else {
                setError(response.data.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleResendOtp = () => {
        setFormData(prev => ({ ...prev, otp: '' }));
        handleSendOtp();
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Register to UniRide</h2>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            {!isOtpSent ? (
                <div>
                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="University Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                    />
                    <input
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                    />
                    <button onClick={handleSendOtp} disabled={!formData.email || !formData.fullName || !formData.phone || !formData.password}>
                        Send OTP
                    </button>
                </div>
            ) : !isOtpVerified ? (
                <div>
                    <h4>Enter OTP sent to {formData.email}</h4>
                    <input
                        name="otp"
                        placeholder="6-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        maxLength={6}
                        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                    />
                    <button onClick={handleVerifyOtp} disabled={!formData.otp}>
                        Verify OTP
                    </button>
                    {canResendOtp ? (
                        <button onClick={handleResendOtp} style={{ marginLeft: '10px' }}>
                            Resend OTP
                        </button>
                    ) : (
                        <div style={{ marginTop: '10px' }}>Resend OTP in {countdown} seconds</div>
                    )}
                </div>
            ) : (
                <div>
                    <h4>OTP Verified Successfully!</h4>
                    <p>Click below to complete registration:</p>
                    <button onClick={handleRegister}>
                        Complete Registration
                    </button>
                </div>
            )}
        </div>
    );
}
