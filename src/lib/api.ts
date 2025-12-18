import { supabase } from './supabase';
import { Job, UserProfile, Message } from './types';

// --- SEEKER APIs ---

export const getSeekerByPhone = async (phone: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching seeker:', error);
      }
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error in getSeekerByPhone:', err);
    return null;
  }
};

export const createSeeker = async (phone: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ phone, skills: [] }])
      .select()
      .single();

    if (error) {
      console.error('Error creating seeker:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error in createSeeker:', err);
    return null;
  }
};

export const updateSeeker = async (id: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) console.error('Error updating seeker:', error);
    return data;
  } catch (err) {
    console.error('Unexpected error in updateSeeker:', err);
    return null;
  }
};

// --- JOB APIs (Vector Search Enabled) ---

export const getJobs = async (
  filters: { city?: string | null; skills?: string[] | null }, 
  queryEmbedding?: number[]
) => {
  try {
    if (queryEmbedding) {
      console.log("Running Vector Search...");
      // Note: match_jobs RPC needs to be created in Supabase if not exists
      // For now we assume it exists or fallback to basic search
      const { data, error } = await supabase.rpc('match_jobs', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5
      });

      if (error) {
        // console.error('Vector search error:', error);
        return getJobsBasic(filters);
      }
      return data as Job[];
    }

    return getJobsBasic(filters);
  } catch (err) {
    console.error('Unexpected error in getJobs:', err);
    return [];
  }
};

const getJobsBasic = async (filters: { city?: string | null }) => {
  try {
    let query = supabase.from('jobs').select('*');
    
    // Only filter by city if it's explicitly provided (not null/undefined)
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    const { data, error } = await query.limit(5);
    if (error) return [];
    return data as Job[];
  } catch (err) {
    console.error('Unexpected error in getJobsBasic:', err);
    return [];
  }
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

// --- APPLICATION APIs ---

export const applyForJob = async (jobId: string, seekerId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('applications')
      .insert({ job_id: jobId, seeker_id: seekerId });
      
    if (error) {
        if (error.code === '23505') return { success: true }; // Duplicate
        if (error.code === '23503') return { success: false, error: "JOB_NOT_FOUND" };
        return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getAppliedJobIds = async (seekerId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('job_id')
      .eq('seeker_id', seekerId);

    if (error) return [];
    return data.map(app => app.job_id);
  } catch (err) {
    return [];
  }
};

// --- MESSAGE APIs ---

export const saveMessage = async (msg: { profile_id: string; sender: 'user' | 'bot'; type: string; content: string; job_data?: any; options?: string[] }) => {
  try {
    // Note: 'options' might need to be stored in JSONB or ignored if schema doesn't support it
    // For now, we just store standard fields. Options are transient for UI usually.
    const { error } = await supabase
      .from('messages')
      .insert([{
        profile_id: msg.profile_id,
        sender: msg.sender,
        type: msg.type,
        content: msg.content,
        job_data: msg.job_data
      }]);
    if (error) console.error('Error saving message:', error);
  } catch (err) {
    console.error('Unexpected error in saveMessage:', err);
  }
};

export const getMessageHistory = async (profile_id: string): Promise<Message[]> => {
  try {
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
  } catch (err) {
    return [];
  }
};

export const clearChatHistory = async (profile_id: string) => {
    try {
        await supabase.from('messages').delete().eq('profile_id', profile_id);
        await supabase.from('applications').delete().eq('seeker_id', profile_id);
        await supabase.from('profiles').delete().eq('id', profile_id);
    } catch (err) {
        console.error('Unexpected error in clearChatHistory:', err);
        throw err;
    }
};

// NEW: Only clears user data, keeps jobs
export const resetUserSessionData = async () => {
    try {
        // Delete all messages
        await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete all applications
        await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete all profiles
        await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return true;
    } catch (e) {
        console.error("Reset Session Error:", e);
        return false;
    }
};

// EXISTING: Clears everything including jobs
export const clearAllData = async () => {
    try {
        await resetUserSessionData();
        await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return true;
    } catch (e) {
        console.error("Clear All Error:", e);
        return false;
    }
};
