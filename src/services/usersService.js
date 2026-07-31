import { supabase } from '../config/supabase';

export const usersService = {
  async getProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async getCredits(userId) {
    const { data, error } = await supabase.from('credits').select('*').eq('student_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async awardCredits(studentId, amount, reason, awardedBy) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmchgoheciwkitiamihv.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptY2hnb2hlY2l3a2l0aWFtaWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDU5MzUsImV4cCI6MjA5NTUyMTkzNX0.Rt7gfIVturJnppXrgNbova7mGLxAqmadwlsYWYDuYfg';
    
    let token = anonKey;
    try {
      const sessionData = JSON.parse(localStorage.getItem('sb-zmchgoheciwkitiamihv-auth-token') || '{}');
      if (sessionData.access_token) {
        token = sessionData.access_token;
      }
    } catch(e) {}

    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. Insert into credits table using native fetch
    const creditRes = await fetch(`${supabaseUrl}/rest/v1/credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        student_id: studentId,
        amount: amount,
        reason: reason,
        awarded_by: awardedBy
      })
    });
    
    if (!creditRes.ok) {
      const err = await creditRes.json();
      throw new Error(err.message || 'Failed to insert credit record');
    }
    const creditData = await creditRes.json();
    const creditRec = creditData[0];

    // 2. Fetch current profile
    const profile = await this.getProfile(studentId);
    
    // 3. Update total credits in profiles using native fetch
    const newTotal = (profile.credits || 0) + amount;
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${studentId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ credits: newTotal })
    });
    
    if (!profileRes.ok) {
      const err = await profileRes.json();
      throw new Error(err.message || 'Failed to update profile credits');
    }

    // 4. Update leaderboard (upsert) using native fetch
    const lbHeaders = { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' };
    const lbRes = await fetch(`${supabaseUrl}/rest/v1/leaderboard?on_conflict=student_id`, {
      method: 'POST',
      headers: lbHeaders,
      body: JSON.stringify({
        student_id: studentId,
        total_credits: newTotal
      })
    });
    
    if (!lbRes.ok) {
      const err = await lbRes.json();
      throw new Error(err.message || 'Failed to update leaderboard');
    }

    return creditRec;
  },

  async getLeaderboard() {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*, profiles(full_name, role)')
      .order('total_credits', { ascending: false })
      .limit(50);
    if (error) throw error;
    
    // Calculate ranks
    return data.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
};
