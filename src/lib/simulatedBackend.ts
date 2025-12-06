import { Message, UserProfile, Job } from './types';
import { SEED_JOBS } from './mockData';

// Simple state simulation
let userProfile: UserProfile = {
  phone: '+1234567890',
  skills: []
};

// Simulated "LLM" Logic
export const processMessage = async (input: string): Promise<Message[]> => {
  const lowerInput = input.toLowerCase();
  const responses: Message[] = [];
  const timestamp = new Date();

  // 1. Supervisor Agent Logic (Simplified for Demo)
  if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('start')) {
    responses.push({
      id: Date.now().toString(),
      sender: 'bot',
      type: 'text',
      content: "👋 Welcome to JobAssistant! I can help you create a profile or find jobs.\n\nTell me, what is your name?",
      timestamp
    });
  } 
  else if (!userProfile.name) {
    userProfile.name = input;
    responses.push({
      id: Date.now().toString(),
      sender: 'bot',
      type: 'text',
      content: `Nice to meet you, ${userProfile.name}. What city are you looking for work in?`,
      timestamp
    });
  }
  else if (!userProfile.city) {
    userProfile.city = input;
    responses.push({
      id: Date.now().toString(),
      sender: 'bot',
      type: 'text',
      content: `Got it, ${userProfile.city}. What kind of work do you do? (e.g., Driver, Electrician, Retail)`,
      timestamp
    });
  }
  else if (userProfile.skills.length === 0) {
    userProfile.skills.push(input);
    responses.push({
      id: Date.now().toString(),
      sender: 'bot',
      type: 'text',
      content: `Okay, looking for ${input} jobs in ${userProfile.city}...`,
      timestamp
    });

    // Trigger Job Matching
    const matches = SEED_JOBS.filter(j => 
      j.title.toLowerCase().includes(input.toLowerCase()) || 
      j.description.toLowerCase().includes(input.toLowerCase()) ||
      j.city.toLowerCase().includes(userProfile.city?.toLowerCase() || '')
    );

    if (matches.length > 0) {
       matches.forEach(job => {
         responses.push({
           id: Math.random().toString(),
           sender: 'bot',
           type: 'job-card',
           content: 'Job Match',
           jobData: job,
           timestamp
         });
       });
       responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: "Here are some jobs I found for you! Tap 'Apply' to contact them.",
        timestamp
      });
    } else {
      responses.push({
        id: Math.random().toString(),
        sender: 'bot',
        type: 'text',
        content: "I couldn't find any exact matches right now, but I've saved your profile and will notify you when new jobs arrive!",
        timestamp
      });
    }
  } else {
    // General QA
    responses.push({
      id: Date.now().toString(),
      sender: 'bot',
      type: 'text',
      content: "I've updated your context. You can ask for 'jobs' or update your 'salary' expectations.",
      timestamp
    });
  }

  return new Promise(resolve => setTimeout(() => resolve(responses), 1000));
};
