import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth(app);
    
        const result = await signInWithPopup(auth, provider);
    
        // ✅ Get Firebase ID token
        const tokenId = await result.user.getIdToken();
    
        // ✅ Send tokenId to your backend
        const res = await fetch('http://localhost:8080/api/v1/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.user.email,    // Send email
            name: result.user.displayName,  // Send name
            photo: result.user.photoURL,  // Send photo URL
          }),
        });
    
        const data = await res.json();
        console.log('Backend response:', data);
    
        if (res.ok) {
          console.log('Login successful');
          // Handle successful login
          navigate('/');
        } else {
          console.error('Backend Google login failed:', data.message);
        }
      } catch (error) {
        console.log('Could not login with Google', error);
      }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-95"
    >
      Continue with Google
    </button>
  );
}
