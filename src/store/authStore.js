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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
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
      set({ isInitialized: true });
    }

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