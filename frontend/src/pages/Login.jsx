import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {loginUser} from '../store/authSlice';
import {useState} from 'react';

function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e){
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    function handleSubmit(e){
        e.preventDefault();
        if (loading) return; // Prevent double submit
        setLoading(true);
        setError("");
        // Input validation
        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }
        if (/<|>|script/i.test(formData.email)) {
            setError("Invalid characters in email.");
            setLoading(false);
            return;
        }
        dispatch(loginUser(formData))
          .unwrap()
          .then(() => {
            setLoading(false);
            setFormData({ email: '', password: '' });
            navigate('/');
          })
          .catch(error => {
            setError(error.message);
            setLoading(false);
          });
    }

    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-surface-dark to-surface-light relative overflow-hidden">
        <div
          className="w-full max-w-[450px] p-12 md:p-10 sm:p-6 bg-[rgba(22,23,27,0.8)] backdrop-blur-2xl border border-glass-border rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-center transition-all animate-slideInUp"
          style={{ boxShadow: '0 0 50px rgba(0,220,130,0.1)' }}
        > 
          <div className="shimmer-line" />
          <div className="login-form text-center w-full relative z-[1]">
            <h1 className="text-[2.5rem] md:text-[2rem] sm:text-[1.5rem] mb-4 font-black bg-accent-gradient bg-clip-text text-transparent tracking-tight animate-fadeInUp" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h1>
            <p className="subtitle text-[1.1rem] md:text-[1rem] sm:text-[0.95rem] text-text-secondary mb-10 md:mb-8 sm:mb-6 font-medium animate-fadeInUp">Please log in to your account</p>
            <form id="login-form" onSubmit={handleSubmit}>
              <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp">
                <label htmlFor="email" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Email</label>
                <input type="email" id="login_email" name="email" placeholder="Enter your email" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.email} />
              </div>
              <div className="form-group text-left mb-8 sm:mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="password" className="block text-base mb-3 text-text-primary font-semibold tracking-wide">Password</label>
                <input type="password" id="login_password" name="password" placeholder="Enter your password" required className="w-full p-4 md:p-3 sm:p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium transition-all backdrop-blur focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleChange} value={formData.password} />  
              </div>
                <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
                {error && <div className="text-red-400 mb-2">{error}</div>}
            </form>
            <p className="extra-text mt-10 sm:mt-8 text-base sm:text-sm text-text-secondary font-medium animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              Don't have an account?{' '}
              <a onClick={()=> navigate('/signup')} className="text-primary font-bold no-underline transition-all relative hover:text-primary-light after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-accent-gradient after:transition-all">
                Sign up
              </a>
            </p>
          </div>
        </div>
        </div>
    );
}

export default LoginPage;