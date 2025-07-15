import { useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {registerUser} from '../store/authSlice';
import {useState} from 'react';

function SignUpPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e){
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    function handleSubmit(e){
        e.preventDefault();
        setLoading(true);
        setError("");
        // Input validation
        if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }
        if (/<|>|script/i.test(formData.userName) || /<|>|script/i.test(formData.email)) {
            setError("Invalid characters in username or email.");
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        try{
            dispatch(registerUser(formData));
            setLoading(false);
            setFormData({ userName: '', email: '', password: '', confirmPassword: '' });
            navigate('/login');
        }catch(error){
            setError(error.message);
            setLoading(false);
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-surface-dark to-surface-light relative overflow-hidden">
            <div
                className="w-full max-w-[540px] py-10 px-10 md:py-8 md:px-8 sm:py-6 sm:px-4 bg-[rgba(22,23,27,0.8)] backdrop-blur-2xl border border-glass-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-center transition-all animate-slideInUp"
                style={{ boxShadow: '0 0 50px rgba(0,220,130,0.1)' }}
            > 
                <div className="shimmer-line" />
                <div className="text-center w-full relative z-[1]">
                    <h1 className="text-[2.5rem] md:text-[2rem] sm:text-[1.5rem] mb-4 font-black bg-accent-gradient bg-clip-text text-transparent tracking-tight animate-fadeInUp" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sign Up</h1>
                    <p className="subtitle text-[1.1rem] md:text-[1rem] sm:text-[0.95rem] text-text-secondary mb-10 md:mb-8 sm:mb-6 font-medium animate-fadeInUp">Create your account and start exploring NFTs!</p>
                    <form id="signup-form" onSubmit={handleSubmit}>
                        <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp">
                            <label htmlFor="name" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Full Name</label>
                            <input type="text" id="name" name="userName" placeholder="Enter your username" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.userName} />
                        </div>
                        <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="email" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.email} />
                        </div>
                        <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="password" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Password</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.password} />
                        </div>
                        <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <label htmlFor="confirm-password" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Confirm Password</label>
                            <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirm your password" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.confirmPassword} />
                        </div>
                        {error && <div className="text-red-400 mb-2">{error}</div>}
                        <button type="submit" id="signup-button" className="w-full py-5 md:py-4 sm:py-4 bg-accent-gradient hover:bg-accent-gradient-hover border-none rounded-lg text-[1.1rem] text-text-primary cursor-pointer font-bold transition-all shadow-lg relative overflow-hidden uppercase tracking-wide animate-fadeInUp hover:shadow-xl hover:shadow-glow hover:-translate-y-1 active:-translate-y-0.5" style={{ animationDelay: '0.4s' }} disabled={loading}> {loading ? 'Signing up...' : 'Sign Up'} </button>
                    </form>
                    <p className="extra-text mt-10 sm:mt-8 text-base sm:text-sm text-text-secondary font-medium animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        Already have an account?{' '}
                        <a onClick={() => navigate('/login')} className="text-primary font-bold no-underline transition-all relative hover:text-primary-light after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-accent-gradient after:transition-all cursor-pointer">
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;