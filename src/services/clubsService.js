import { supabase } from '../config/supabase';

export const clubsService = {
  async getClubs() {
    const { data, error } = await supabase.from('clubs').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getClubById(id) {
    const { data, error } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createClub(clubData) {
    const { data, error } = await supabase.from('clubs').insert([clubData]).select().single();
    if (error) throw error;
    return data;
  },

  async joinClub(clubId, studentId) {
    const { data, error } = await supabase.from('club_members').insert([{ club_id: clubId, student_id: studentId }]).select().single();
    if (error) throw error;
    return data;
  },

  async leaveClub(clubId, studentId) {
    const { error } = await supabase.from('club_members').delete().eq('club_id', clubId).eq('student_id', studentId);
    if (error) throw error;
    return true;
  },
  
  async getClubMembers(clubId) {
    const { data, error } = await supabase.from('club_members').select('*, profiles(*)').eq('club_id', clubId);
    if (error) throw error;
    return data;
  }
};
