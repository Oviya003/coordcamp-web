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
    // 1. Insert into credits table
    const { data: creditRec, error: creditError } = await supabase.from('credits').insert([{
      student_id: studentId,
      amount: amount,
      reason: reason,
      awarded_by: awardedBy
    }]).select().single();
    if (creditError) throw creditError;

    // 2. Fetch current profile
    const profile = await this.getProfile(studentId);
    
    // 3. Update total credits in profiles
    const newTotal = (profile.credits || 0) + amount;
    await this.updateProfile(studentId, { credits: newTotal });

    // 4. Update leaderboard (upsert)
    const { error: leaderboardError } = await supabase.from('leaderboard').upsert({
      student_id: studentId,
      total_credits: newTotal
    }, { onConflict: 'student_id' });
    if (leaderboardError) throw leaderboardError;

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
