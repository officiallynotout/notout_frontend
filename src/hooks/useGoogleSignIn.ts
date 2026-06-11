import { useState } from 'react';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { firebaseLoginApi } from '@/api';
import { useAuth } from './useAuth';

// After enabling Google Sign-In in Firebase Console → Authentication → Sign-in providers,
// paste the Web client ID from the "Web SDK configuration" section here.
const WEB_CLIENT_ID = '1092866809609-3hngefkr3odqtgo6lsuic8i8fvnfgr5t.apps.googleusercontent.com';

const FIREBASE_API_KEY = 'AIzaSyCRNX4T7liPLuzrZ4ZGTFBDvPlR1faLryg';

GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });

export const useGoogleSignIn = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;

      const { idToken } = response.data;

      // Exchange Google ID token for a Firebase ID token via identitytoolkit REST API
      const fbRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestUri: 'http://localhost',
            postBody: `id_token=${idToken}&providerId=google.com`,
            returnSecureToken: true,
          }),
        }
      );

      const fbData = await fbRes.json();
      if (!fbRes.ok) throw new Error(fbData.error?.message ?? 'Firebase auth failed');

      const res = await firebaseLoginApi({
        firebaseToken: fbData.idToken,
        name: fbData.displayName ?? undefined,
      });
      login(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};
