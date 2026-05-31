import { supabase } from '../config/supabase';

export const attendanceService = {
  async recordAttendance(eventId, studentId, method) {
    const { data, error } = await supabase.from('attendance').insert([{
      event_id: eventId,
      student_id: studentId,
      method: method
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  async getStudentAttendance(studentId) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, events(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async getEventAttendance(eventId) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, profiles(*)')
      .eq('event_id', eventId);
      
    if (error) throw error;
    return data;
  }
};
