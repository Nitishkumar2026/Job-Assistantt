import { UserProfile, Message } from './types';
import * as api from './api';
import { getOpenAIClient, generateEmbedding } from './openai';

/**
 * THE "BRAIN" of the system.
 * Uses OpenAI GPT-4o if API Key is present, otherwise falls back to Regex.
 */

// System Prompts
const SUPERVISOR_PROMPT = `
You are the Supervisor Agent for a WhatsApp Job Assistant.
Your goal is to classify the user's intent into one of these categories:
1. ONBOARDING: User is providing name, city, or basic info to create a profile.
2. UPDATE_PROFILE: User explicitly wants to change existing info (e.g., "Change city to Delhi").
3. JOB_SEARCH: User is asking for jobs, vacancies, or work.
4. GENERAL_QA: General questions, greetings, or unclear inputs.

Return ONLY a JSON object: { "intent": "..." }
`;

const PROFILE_EXTRACTOR_PROMPT = `
You are a Profile Extraction Agent.
Extract the following fields from the user's text if present:
- name (string)
- city (string)
- skills (array of strings)
- expected_salary (string/number)

Return a JSON object with extracted fields. If a field is not found, do not include it.
Example Input: "My name is Rahul, I drive a truck in Mumbai, expecting 20k"
Example Output: { "name": "Rahul", "city": "Mumbai", "skills": ["Truck Driver"], "expected_salary": "20000" }
`;

// --- AI LOGIC ---

const determineIntentWithAI = async (text: string, client: any): Promise<string> => {
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: SUPERVISOR_PROMPT },
        { role: "user", content: text }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(completion.choices[0].message.content);
    return result.intent || 'GENERAL_QA';
  } catch (e) {
    console.error("AI Intent Error:", e);
    return 'GENERAL_QA';
  }
};

const extractProfileWithAI = async (text: string, client: any) => {
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: PROFILE_EXTRACTOR_PROMPT },
        { role: "user", content: text }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error("AI Extraction Error:", e);
    return {};
  }
};

// --- MAIN PROCESSOR ---

export const processUserMessage = async (phone: string, text: string, apiKey?: string): Promise<Message[]> => {
  const client = getOpenAIClient(apiKey);
  
  // 1. Identify User
  let profile = await api.getSeekerByPhone(phone);
  
  if (!profile) {
    profile = await api.createSeeker(phone);
    if (!profile) return [{ id: 'err', sender: 'bot', type: 'text', content: 'System Error', timestamp: new Date() }];
    
    const welcomeMsg: Message = {
      id: Math.random().toString(),
      sender: 'bot',
      type: 'text',
      content: "👋 Welcome to JobAssistant! Let's create your profile. What is your full name?",
      timestamp: new Date()
    };
    await api.saveMessage({ profile_id: profile.id, sender: 'bot', type: 'text', content: welcomeMsg.content });
    return [welcomeMsg];
  }

  // 2. Save User Message
  await api.saveMessage({ profile_id: profile.id, sender: 'user', type: 'text', content: text });

  // 3. Determine Intent (AI or Regex)
  let intent = 'GENERAL_QA';
  if (client) {
    intent = await determineIntentWithAI(text, client);
  } else {
    // Fallback Regex Logic
    const lower = text.toLowerCase();
    if (lower.includes('update')) intent = 'UPDATE_PROFILE';
    else if (lower.includes('job') || lower.includes('work') || lower.includes('find')) intent = 'JOB_SEARCH';
    else if (!profile.name || !profile.city || !profile.skills || profile.skills.length === 0) intent = 'ONBOARDING';
  }

  console.log("Determined Intent:", intent);

  const responses: Message[] = [];

  // 4. Handle Intent
  if (intent === 'ONBOARDING' || intent === 'UPDATE_PROFILE') {
    let updates: any = {};
    
    if (client) {
      updates = await extractProfileWithAI(text, client);
    } else {
      // Basic regex fallback
      if (!profile.name) updates.name = text;
      else if (!profile.city) updates.city = text;
      else if (!profile.skills?.length) updates.skills = [text];
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await api.updateSeeker(profile.id, updates);
      
      // Refresh profile for context
      profile = { ...profile, ...updates };
      
      responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: `✅ Updated: ${Object.keys(updates).join(', ')}. \n\nCurrent Profile:\nName: ${profile.name || '-'}\nCity: ${profile.city || '-'}\nSkills: ${profile.skills?.join(', ') || '-'}`,
        timestamp: new Date()
      });

      if (profile.name && profile.city && profile.skills?.length) {
        responses.push({
          id: Math.random().toString(),
          sender: 'bot',
          type: 'text',
          content: "Your profile is ready! Type 'Find Jobs' to see matches.",
          timestamp: new Date()
        });
      }
    } else {
      responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: "Could you please provide more details? (Name, City, or Skills)",
        timestamp: new Date()
      });
    }
  } 
  else if (intent === 'JOB_SEARCH') {
    responses.push({
      id: Math.random().toString(),
      sender: 'bot',
      type: 'text',
      content: `🔍 Searching for jobs matching your profile...`,
      timestamp: new Date()
    });

    let jobs = [];
    if (client && profile.skills && profile.skills.length > 0) {
      // Generate embedding for the user's skills + city
      const queryText = `${profile.skills.join(' ')} ${profile.city || ''} ${profile.preferred_job_type || ''}`;
      const embedding = await generateEmbedding(queryText, client);
      jobs = await api.getJobs({}, embedding);
    } else {
      jobs = await api.getJobs({ city: profile.city, skills: profile.skills });
    }

    if (jobs.length > 0) {
      jobs.forEach(job => {
        responses.push({
          id: Math.random().toString(),
          sender: 'bot',
          type: 'job-card',
          content: 'Job Match',
          jobData: job,
          timestamp: new Date()
        });
      });
    } else {
      responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: "No matching jobs found yet. Try updating your city or skills!",
        timestamp: new Date()
      });
    }
  } 
  else {
    // GENERAL QA
    responses.push({
      id: Math.random().toString(),
      sender: 'bot',
      type: 'text',
      content: "I am your Job Assistant. You can ask me to 'Find Jobs' or 'Update my Profile'.",
      timestamp: new Date()
    });
  }

  // 5. Save Responses
  for (const resp of responses) {
    await api.saveMessage({ 
      profile_id: profile.id, 
      sender: 'bot', 
      type: resp.type, 
      content: resp.content,
      job_data: resp.jobData 
    });
  }

  return responses;
};
