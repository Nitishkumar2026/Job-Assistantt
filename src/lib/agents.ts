import { UserProfile, Message } from './types';
import * as api from './api';
import { getOpenAIClient, generateEmbedding } from './openai';

// --- CONFIGURATION ---
const AI_MODEL = "google/gemini-2.0-flash-001";

const SUPERVISOR_PROMPT = `
You are the Supervisor Agent for a WhatsApp Job Assistant.
Classify the user's intent:

1. ONBOARDING: User is providing name, city, skills, or answering the "City Search" preference question (Yes/No).
2. UPDATE_PROFILE: User explicitly wants to change info.
3. JOB_SEARCH: User is explicitly asking to FIND jobs.
4. GENERAL_QA: User is asking a QUESTION (How to, What is, Salary, Advice).

Return JSON: { "intent": "..." }
`;

const PROFILE_EXTRACTOR_PROMPT = `
Extract fields: name, city, skills (array), expected_salary.
Return JSON object.
`;

const GENERAL_QA_PROMPT = `
You are an expert Career Counselor for blue-collar workers in India.
Provide a **REAL, ACCURATE, and DETAILED** answer. 
- Do NOT use dummy text. 
- Use realistic salary ranges for India (e.g. ₹15k-25k).
- Give step-by-step advice for interviews or documents.
- Be helpful and encouraging.
`;

// --- LOCAL KNOWLEDGE BASE ---
const getLocalKnowledgeAnswer = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (lower.includes('salary')) {
        return "💰 **Estimated Salaries (India):**\n• Driver: ₹18,000 - ₹25,000\n• Delivery: ₹15,000 - ₹30,000\n• Security: ₹15,000 - ₹20,000\n• Office Boy: ₹12,000 - ₹18,000";
    }
    return null;
};

// --- AI LOGIC ---
const determineIntentWithAI = async (text: string, client: any): Promise<string | null> => {
  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: "system", content: SUPERVISOR_PROMPT }, { role: "user", content: text }],
      model: AI_MODEL,
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(completion.choices[0].message.content);
    return result.intent || 'GENERAL_QA';
  } catch (e) { return null; }
};

const extractProfileWithAI = async (text: string, client: any) => {
  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: "system", content: PROFILE_EXTRACTOR_PROMPT }, { role: "user", content: text }],
      model: AI_MODEL,
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) { return null; }
};

// --- MAIN PROCESSOR ---

export const processUserMessage = async (phone: string, text: string, apiKey?: string): Promise<Message[]> => {
  const client = getOpenAIClient(apiKey);
  let profile = await api.getSeekerByPhone(phone);
  
  // 1. New User
  if (!profile) {
    profile = await api.createSeeker(phone);
    if (!profile) return [{ id: 'err', sender: 'bot', type: 'text', content: 'System Error', timestamp: new Date() }];
    
    const welcomeMsg: Message = {
      id: Math.random().toString(),
      sender: 'bot',
      type: 'text',
      content: "👋 Welcome to JobAssistant! Let's create your profile.\n\nWhat is your full name?",
      timestamp: new Date()
    };
    await api.saveMessage({ profile_id: profile.id, sender: 'bot', type: 'text', content: welcomeMsg.content });
    return [welcomeMsg];
  }

  await api.saveMessage({ profile_id: profile.id, sender: 'user', type: 'text', content: text });

  // 2. Determine Intent
  let intent: string | null = null;
  
  // SPECIAL CHECK: If we are waiting for Search Preference (Yes/No)
  if (profile.name && profile.city && profile.skills && profile.skills.length > 0 && !profile.search_mode) {
      const lower = text.toLowerCase();
      if (lower === 'yes' || lower.includes('yes')) {
          // User wants Local Search
          await api.updateSeeker(profile.id, { search_mode: 'local' });
          profile.search_mode = 'local';
          intent = 'JOB_SEARCH';
      } else if (lower === 'no' || lower.includes('no')) {
          // User wants Global Search
          await api.updateSeeker(profile.id, { search_mode: 'global' });
          profile.search_mode = 'global';
          intent = 'JOB_SEARCH';
      } else {
          // Ambiguous response, treat as Onboarding to re-ask
          intent = 'ONBOARDING';
      }
  } else {
      if (client) intent = await determineIntentWithAI(text, client);
      if (!intent) {
        // Fallback
        const lower = text.toLowerCase();
        if (lower.includes('job') || lower.includes('find')) intent = 'JOB_SEARCH';
        else if (!profile.name || !profile.city || !profile.skills?.length) intent = 'ONBOARDING';
        else intent = 'GENERAL_QA';
      }
  }

  console.log("Intent:", intent);
  const responses: Message[] = [];

  // 3. Handle Intent
  if (intent === 'ONBOARDING' || intent === 'UPDATE_PROFILE') {
    let updates: any = {};
    if (client) updates = await extractProfileWithAI(text, client) || {};
    
    // Fallback extraction
    if (Object.keys(updates).length === 0) {
       if (!profile.name) updates.name = text;
       else if (!profile.city) updates.city = text;
       else if (!profile.skills?.length) updates.skills = [text];
    }

    // If user is updating profile, reset search mode to ask again
    if (intent === 'UPDATE_PROFILE') {
        updates.search_mode = null;
    }

    if (Object.keys(updates).length > 0) {
      await api.updateSeeker(profile.id, updates);
      profile = { ...profile, ...updates };
      
      responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: `✅ Saved: ${Object.keys(updates).join(', ')}`,
        timestamp: new Date()
      });
    }

    // FLOW CONTROL
    if (!profile.name) {
        responses.push({ id: Math.random().toString(), sender: 'bot', type: 'text', content: "What is your full name?", timestamp: new Date() });
    } else if (!profile.city) {
        responses.push({ id: Math.random().toString(), sender: 'bot', type: 'text', content: `Hi ${profile.name}, which city do you live in?`, timestamp: new Date() });
    } else if (!profile.skills || profile.skills.length === 0) {
        responses.push({ id: Math.random().toString(), sender: 'bot', type: 'text', content: `Got it, ${profile.city}. What job are you looking for? (e.g. Driver, Electrician)`, timestamp: new Date() });
    } else if (!profile.search_mode) {
        // NEW STEP: Ask for City Preference
        responses.push({ 
            id: Math.random().toString(), 
            sender: 'bot', 
            type: 'text', 
            content: `Are you searching for a job based on your city (${profile.city})?\n\nTap an option:`, 
            timestamp: new Date(),
            options: ['Yes', 'No'] // UI will render buttons
        });
    } else {
        responses.push({ id: Math.random().toString(), sender: 'bot', type: 'text', content: "Profile ready! Type 'Find Jobs' to start.", timestamp: new Date() });
    }
  } 
  else if (intent === 'JOB_SEARCH') {
    // Determine Search Scope
    let searchCity = profile.city;
    
    // If user explicitly said "No" to city filter, or if they are asking for a specific skill in this message that overrides context
    if (profile.search_mode === 'global') {
        searchCity = null; // Remove city filter
    }

    // Check if user provided specific skills in this message (overriding profile skills)
    let searchSkills = profile.skills;
    if (client) {
        const extraction = await extractProfileWithAI(text, client);
        if (extraction?.skills?.length) {
            searchSkills = extraction.skills;
            // If searching specific skill, maybe ignore city? 
            // Let's stick to the user's preference unless they say "in Mumbai" explicitly.
            if (extraction.city) searchCity = extraction.city;
        }
    }

    const modeText = searchCity ? `in ${searchCity}` : "(All India)";
    responses.push({
      id: Math.random().toString(),
      sender: 'bot',
      type: 'text',
      content: `🔍 Searching for ${searchSkills?.join(', ')} jobs ${modeText}...`,
      timestamp: new Date()
    });

    // Generate Embedding
    const queryText = `${searchSkills?.join(' ')} ${searchCity || ''}`;
    let embedding = undefined;
    if (client) embedding = await generateEmbedding(queryText, client);

    const jobs = await api.getJobs({ city: searchCity, skills: searchSkills }, embedding);

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
        content: `No jobs found ${modeText}. Try updating your profile or search for "Anywhere".`,
        timestamp: new Date()
      });
    }
  } 
  else {
    // GENERAL QA (Real Answers)
    let answer = null;
    if (client) {
        try {
            const completion = await client.chat.completions.create({
                messages: [{ role: "system", content: GENERAL_QA_PROMPT }, { role: "user", content: text }],
                model: AI_MODEL,
            });
            answer = completion.choices[0].message.content;
        } catch (e) {}
    }
    if (!answer) answer = getLocalKnowledgeAnswer(text);
    if (!answer) answer = "I can help you Find Jobs or Answer Questions. Try asking 'What is driver salary?'";

    responses.push({ id: Math.random().toString(), sender: 'bot', type: 'text', content: answer, timestamp: new Date() });
  }

  // Save Bot Responses
  for (const resp of responses) {
    await api.saveMessage({ 
      profile_id: profile.id, 
      sender: 'bot', 
      type: resp.type, 
      content: resp.content,
      job_data: resp.jobData,
      options: resp.options
    });
  }

  return responses;
};
