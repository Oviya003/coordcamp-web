import { create } from 'zustand';
import { supabase } from '../config/supabase';

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  token: null, // kept for backward compatibility briefly
  isInitialized: false,
  
  setAuth: (user, token) => {
    set({ user, token });
  },

  initializeAuth: async () => {
    try {
      const sessionString = localStorage.getItem('sb-zmchgoheciwkitiamihv-auth-token');
      let session = null;
      if (sessionString) {
        session = JSON.parse(sessionString);
      }

      if (session && session.expires_at > Math.floor(Date.now() / 1000)) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmchgoheciwkitiamihv.supabase.co';
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptY2hnb2hlY2l3a2l0aWFtaWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDU5MzUsImV4cCI6MjA5NTUyMTkzNX0.Rt7gfIVturJnppXrgNbova7mGLxAqmadwlsYWYDuYfg';

        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${session.user.id}&select=*`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const profile = profileData.length > 0 ? profileData[0] : {};
          set((state) => ({ 
            session, 
            token: session.access_token, 
            user: { ...session.user, ...profile, role: profile.role || state.user?.role || 'student' },
            isInitialized: true
          }));
          return; // Skip fallback
        }
      }
    } catch (e) {
      console.error("Local session parsing failed", e);
    }
    
    // Fallback or no session
    set({ isInitialized: true });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Use maybeSingle() so it doesn't throw an error if the profile is missing
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        set((state) => {
          const safeProfile = profile || {};
          return { 
            session, 
            token: session.access_token, 
            user: { ...session.user, ...safeProfile, role: profile?.role || state.user?.role || 'student' },
            isInitialized: true
          };
        });
      } else {
        set({ session: null, token: null, user: null, isInitialized: true });
      }
    });
  },
  
  logout: async () => {
    // Forcefully clear everything immediately so users don't get trapped if SDK hangs
    localStorage.clear();
    sessionStorage.clear();
    set({ user: null, session: null, token: null });
    
    // Attempt graceful server logout in background without waiting
    supabase.auth.signOut().catch(() => {});
  }
}));

export default useAuthStore;