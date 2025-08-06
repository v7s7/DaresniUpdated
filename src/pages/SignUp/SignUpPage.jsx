const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const saveUserProfile = async (uid, email, userRole) => {
    console.log('Saving user profile...');
    const defaultProfile = {
      email,
      role: userRole,
      name: userRole === 'tutor' ? 'New Tutor' : '',
      expertise: userRole === 'tutor' ? 'Not specified' : '',
      price: userRole === 'tutor' ? 0 : null,
      location: '',
      rating: userRole === 'tutor' ? 0 : null,
      image: '',
    };
    await setDoc(doc(db, 'users', uid), defaultProfile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sign up form submitted');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);
      await saveUserProfile(user.uid, user.email, role);
      navigate(role === 'student' ? '/student' : '/tutor');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in triggered');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google user:', user);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        navigate(role === 'student' ? '/student' : '/tutor');
      } else {
        setPendingGoogleUser(user);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }
    try {
      await saveUserProfile(pendingGoogleUser.uid, pendingGoogleUser.email, selectedRole);
      navigate(selectedRole === 'student' ? '/student' : '/tutor');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      {pendingGoogleUser ? (
        <form className="login-form" onSubmit={handleRoleSubmit}>
          <p>Select your role:</p>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">Select</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
          <button type="submit">Continue</button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <>
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
            <button type="submit">Sign Up</button>
            {error && <p className="error">{error}</p>}
            <button onClick={handleGoogleSignIn} className="google-btn">
              <img
                src="https://id-frontend.prod-east.frontend.public.atl-paas.net/assets/google-logo.5867462c.svg"
                alt="Google"
                className="google-icon"
              />
              Sign up with Google
            </button>
          </form>

          <p>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default SignUpPage;
