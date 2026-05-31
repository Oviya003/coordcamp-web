import { supabase } from '../config/supabase';

export const eventsService = {
  async getEvents() {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getUpcomingEvents(limit = 10) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getEventById(id) {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createEvent(eventData) {
    const { data, error } = await supabase.from('events').insert([eventData]).select().single();
    if (error) throw error;
    return data;
  },

  async updateEvent(id, eventData) {
    const { data, error } = await supabase.from('events').update(eventData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
