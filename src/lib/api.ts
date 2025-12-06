import { supabase } from './supabase';
import { Job, UserProfile, Message } from './types';

// --- SEEKER APIs ---

export const getSeekerByPhone = async (phone: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching seeker:', error);
  }
  return data;
};

export const createSeeker = async (phone: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ phone, skills: [] }])
    .select()
    .single();

  if (error) console.error('Error creating seeker:', error);
  return data;
};

export const updateSeeker = async (id: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) console.error('Error updating seeker:', error);
  return data;
};

// --- JOB APIs (Vector Search Enabled) ---

export const getJobs = async (
  filters: { city?: string | null; skills?: string[] | null }, 
  queryEmbedding?: number[]
) => {
  // 1. If we have an embedding, use Vector Search (RPC)
  if (queryEmbedding) {
    console.log("Running Vector Search...");
    const { data, error } = await supabase.rpc('match_jobs', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3, // Lowered to 0.3 for better demo results
      match_count: 5
    });

    if (error) {
      console.error('Vector search error:', error);
      return getJobsBasic(filters);
    }
    console.log("Vector Search Results:", data?.length);
    return data as Job[];
  }

  // 2. Fallback: Basic Text Search
  return getJobsBasic(filters);
};

const getJobsBasic = async (filters: { city?: string | null }) => {
  let query = supabase.from('jobs').select('*');
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  const { data, error } = await query.limit(5);
  if (error) return [];
  return data as Job[];
};

export const createJob = async (job: Omit<Job, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateJobEmbedding = async (jobId: string, embedding: number[]) => {
  const { error } = await supabase
    .from('jobs')
    .update({ embedding })
    .eq('id', jobId);
  if (error) console.error('Error updating job embedding:', error);
};

// --- MESSAGE APIs ---

export const saveMessage = async (msg: { profile_id: string; sender: 'user' | 'bot'; type: string; content: string; job_data?: any }) => {
  const { error } = await supabase
    .from('messages')
    .insert([msg]);
  if (error) console.error('Error saving message:', error);
};

export const getMessageHistory = async (profile_id: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: true });

  if (error) return [];

  return data.map(m => ({
    id: m.id,
    sender: m.sender,
    type: m.type,
    content: m.content,
    timestamp: new Date(m.created_at),
    jobData: m.job_data
  }));
};

// Helper to clear chat for demo
export const clearChatHistory = async (profile_id: string) => {
    console.log("Starting reset for profile:", profile_id);
    
    // 1. Delete all messages first (to satisfy foreign keys)
    const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('profile_id', profile_id);
    
    if (msgError) {
        console.error("Error deleting messages:", msgError);
        throw new Error("Failed to delete messages: " + msgError.message);
    }

    // 2. Delete the profile entirely (Cleaner than updating fields)
    // This forces the bot to treat you as a new user next time
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile_id);

    if (profileError) {
        console.error("Error deleting profile:", profileError);
        // Fallback: If delete fails, try to just clear fields
        await supabase
            .from('profiles')
            .update({ name: null, city: null, skills: [] })
            .eq('id', profile_id);
    }
};
