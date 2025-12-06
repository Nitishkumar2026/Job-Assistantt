import React, { useState } from 'react';
import { handleIncomingWebhook } from '../../lib/webhook-handler';
import { Loader2, CheckCircle, AlertTriangle, Play } from 'lucide-react';

export const WebhookTester = ({ apiKey }: { apiKey: string }) => {
    // UPDATED WITH USER'S REAL IDs FROM SCREENSHOT
    const [jsonInput, setJsonInput] = useState(`{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "1200645164782009", 
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550297372",
              "phone_number_id": "953379621182745"
            },
            "contacts": [{
              "profile": { "name": "Rahul Test User" },
              "wa_id": "919876543210"
            }],
            "messages": [{
              "from": "919876543210",
              "id": "wamid.HBgLMTY1...",
              "timestamp": "1749416383",
              "type": "text",
              "text": { "body": "I need a driver job in Mumbai" }
            }]
          },
          "field": "messages"
        }
      ]
    }
  ]
}`);

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const runTest = async () => {
        setStatus('loading');
        setLogs([]);
        try {
            const parsed = JSON.parse(jsonInput);
            setLogs(prev => [...prev, "✅ JSON Parsed successfully"]);
            
            const result = await handleIncomingWebhook(parsed, apiKey);
            
            if (result.success) {
                setLogs(prev => [...prev, `👤 User Identified: ${result.user?.name} (${result.user?.phone})`]);
                setLogs(prev => [...prev, `🤖 AI Agents Triggered`]);
                setLogs(prev => [...prev, `📤 Responses Generated: ${result.responses?.length}`]);
                setStatus('success');
            } else {
                setLogs(prev => [...prev, `❌ Error: ${result.error}`]);
                setStatus('error');
            }
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ JSON Syntax Error: ${e.message}`]);
            setStatus('error');
        }
    };

    return (
        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg border border-slate-700 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">Webhook Simulator (Server Test)</span>
                <button 
                    onClick={runTest}
                    disabled={status === 'loading'}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-2 transition-colors"
                >
                    {status === 'loading' ? <Loader2 size={12} className="animate-spin"/> : <Play size={12}/>}
                    Simulate POST
                </button>
            </div>
            
            <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded p-2 text-green-400 focus:outline-none focus:border-green-500 font-mono resize-none"
            />

            {logs.length > 0 && (
                <div className="mt-2 space-y-1 bg-black/30 p-2 rounded">
                    {logs.map((log, i) => (
                        <div key={i} className={log.includes('❌') ? 'text-red-400' : 'text-green-300'}>
                            {log}
                        </div>
                    ))}
                </div>
            )}
            
            {status === 'success' && (
                <div className="mt-2 p-2 bg-green-900/30 border border-green-800 text-green-200 rounded flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>Webhook processed! Check the Chat Simulator to see the bot's reply.</span>
                </div>
            )}
        </div>
    );
};
