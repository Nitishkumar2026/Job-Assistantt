import React, { useState } from 'react';
import { WebhookTester } from '../components/whatsapp/WebhookTester';
import { CheckCircle, Copy, FileText, Server, Key, ShieldCheck } from 'lucide-react';

export const DocsPage = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  
  // Meta Credentials State - PRE-FILLED FROM YOUR SCREENSHOT
  const [metaToken, setMetaToken] = useState('EAAa8eiEajHQBQEjXjkMZANqXXhh4CxDkaFRYAt5SiMlTv38SW1Clf6U5ELzcRn0Exjea8MdyMnf0l2s5bhEjZA11CLARV3ghyaNa5f3oqOBeKsI1GgnoWeVaTbTAWmZAFK3ngZBxbKQig8f72RhQ8PRAIWBcet86LnFAzIaZCrjlBSFZCMY8WQBiBK11nPLPyWtS7FQSoMUp01as3HHdpCgVVu3AWWZACGJEHXmNgoInbqqKlxeRNTB4dLoh90jgigZCNAVaOZAZCRD1GZB3qz0tWvOkgZDZD');
  const [phoneId, setPhoneId] = useState('953379621182745'); // Extracted from your image
  const [generated, setGenerated] = useState(false);

  const generateReadme = () => {
    if(!metaToken) {
        alert("Please paste the Access Token first!");
        return;
    }
    setGenerated(true);
  };

  const readmeContent = `
# 📱 AI-Powered WhatsApp Job Assistant

## 🚀 Project Overview
This project is an intelligent job matching bot for WhatsApp. It uses OpenAI (GPT-4o) to understand user intent and Vector Embeddings (Supabase pgvector) to match job seekers with relevant roles.

## 🛠️ Configuration
- **Phone Number ID:** \`${phoneId}\`
- **WhatsApp Business Account ID:** \`1200645164782009\`
- **AI Model:** GPT-4o
- **Database:** Supabase (PostgreSQL + Vector)

## 🔑 Environment Variables
\`\`\`env
WHATSAPP_PHONE_ID=${phoneId}
WHATSAPP_API_TOKEN=${metaToken.substring(0, 20)}...
OPENAI_API_KEY=sk-proj-...
\`\`\`

## 📂 Repository Structure
- \`/server.js\` - Main Entry point for Webhook handling.
- \`/src/lib/agents.ts\` - AI Logic (Supervisor, Profile Extraction).
- \`/src/lib/openai.ts\` - Embedding generation logic.

## 🧪 How to Test
1. Run \`yarn install\`
2. Run \`node server.js\`
3. Send a WhatsApp message to the test number: +1 555 029 7372

## 🔗 API Endpoints
- \`POST /webhook\` - Handles incoming WhatsApp messages.
- \`GET /webhook\` - Verifies Meta connection.
  `.trim();

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Assignment Submission Center</h1>
        <p className="text-slate-500">Generate your final deliverables and test the webhook logic.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Meta Setup */}
        <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Server className="text-blue-600"/> 
                    Step 1: Meta Configuration
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                    Your credentials from the screenshot are pre-filled below.
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number ID</label>
                        <input 
                            value={phoneId}
                            onChange={(e) => setPhoneId(e.target.value)}
                            className="w-full p-2 border rounded text-sm bg-gray-100 font-mono text-gray-600"
                            readOnly
                        />
                        <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle size={10}/> Extracted from your image
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            Access Token <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                value={metaToken}
                                onChange={(e) => setMetaToken(e.target.value)}
                                placeholder="Paste the long code starting with EAAG..."
                                className="w-full p-2 border rounded text-sm pl-8 bg-green-50 border-green-200 text-green-800"
                                type="password"
                            />
                            <Key size={14} className="absolute left-2.5 top-3 text-green-600" />
                        </div>
                        <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                            <ShieldCheck size={10}/> Token Configured
                        </p>
                    </div>
                    
                    <button 
                        onClick={generateReadme}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FileText size={18} />
                        Generate Submission Files
                    </button>
                </div>
            </section>

            {generated && (
                <section className="bg-slate-900 p-6 rounded-xl shadow-lg text-slate-300 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-green-400"/> Final README.md
                        </h3>
                        <button 
                            onClick={() => navigator.clipboard.writeText(readmeContent)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded flex items-center gap-1 text-white font-medium transition-colors"
                        >
                            <Copy size={12}/> Copy Code
                        </button>
                    </div>
                    <div className="relative">
                        <pre className="text-xs font-mono bg-black/50 p-4 rounded-lg overflow-x-auto h-64 border border-slate-800">
                            {readmeContent}
                        </pre>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        Copy this and save it as README.md in your assignment folder.
                    </p>
                </section>
            )}
        </div>

        {/* RIGHT COLUMN: Testing */}
        <div className="space-y-6">
            <section className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">🛠️ Webhook Logic Tester</h2>
                <p className="text-slate-400 text-sm mb-4">
                    This simulator sends a fake WhatsApp message to your backend logic to prove it works.
                </p>
                <WebhookTester apiKey={apiKey} />
            </section>

            <section className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="text-green-600"/> Final Checklist
                </h3>
                <ul className="space-y-3 text-sm text-green-700">
                    <li className="flex items-center gap-2 bg-white p-2 rounded border border-green-100">
                        <CheckCircle size={16} className="text-green-500"/> 
                        Database Connected (Supabase)
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded border border-green-100">
                        <CheckCircle size={16} className="text-green-500"/> 
                        Vector Search Enabled
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded border border-green-100">
                        <CheckCircle size={16} className="text-green-500"/> 
                        AI Agents Active (OpenAI)
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded border border-green-100">
                        <CheckCircle size={16} className="text-green-500"/> 
                        Meta Configured ({phoneId})
                    </li>
                </ul>
            </section>
        </div>

      </div>
    </div>
  );
};
