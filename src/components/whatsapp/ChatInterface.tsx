import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, MoreVertical, Smile, Loader2, StopCircle, Settings, Trash2, RefreshCw } from 'lucide-react';
import { Message } from '../../lib/types';
import { processUserMessage } from '../../lib/agents';
import { getMessageHistory, getSeekerByPhone, clearChatHistory } from '../../lib/api';
import { JobCard } from './JobCard';
import { cn } from '../../lib/utils';

export const ChatInterface = () => {
  // 1. Dynamic Phone Number for "Guaranteed Reset"
  const [demoPhone, setDemoPhone] = useState(() => {
    return localStorage.getItem('job_assistant_demo_phone') || '+919876543210';
  });

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Auto-detect key from env
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-IN';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, [apiKey]);

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        recognitionRef.current?.start();
        setIsListening(true);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    // Use the dynamic demoPhone
    const profile = await getSeekerByPhone(demoPhone);
    if (profile) {
      const history = await getMessageHistory(profile.id);
      setMessages(history);
    } else {
      setMessages([{
          id: 'welcome',
          sender: 'bot',
          type: 'text',
          content: 'Hello! Type "Hi" to start.',
          timestamp: new Date()
      }]);
    }
    setIsLoadingHistory(false);
  };

  // Load History on Mount
  useEffect(() => {
    loadHistory();
  }, [demoPhone]); // Reload if phone changes

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const tempId = Date.now().toString();
    const userMsg: Message = {
      id: tempId,
      sender: 'user',
      type: 'text',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        // Pass API Key to Agents
        const responses = await processUserMessage(demoPhone, userMsg.content, apiKey);
        setMessages(prev => [...prev, ...responses]);
    } catch (error) {
        console.error(error);
    } finally {
        setIsTyping(false);
    }
  };

  const handleReset = async () => {
    if(!confirm("Are you sure? This will clear your chat history and start a fresh demo session.")) return;
    
    setIsResetting(true);
    try {
        // 1. Try to clean up DB (Best effort)
        const profile = await getSeekerByPhone(demoPhone);
        if(profile) {
            await clearChatHistory(profile.id);
        }
    } catch (error) {
        console.warn("DB Cleanup failed (likely permissions), switching user identity instead.", error);
    } finally {
        // 2. GUARANTEED RESET: Switch Identity
        // Generate a new random phone number so the system treats you as a new user
        const newPhone = '+91' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
        localStorage.setItem('job_assistant_demo_phone', newPhone);
        setDemoPhone(newPhone);
        
        setIsResetting(false);
        setShowSettings(false);
        // No need to reload page, state update triggers re-render
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
      </div>

      {/* Header */}
      <div className="bg-[#008069] p-3 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                🤖
            </div>
            <div>
                <h2 className="font-medium text-sm md:text-base">Job Assistant AI</h2>
                <p className="text-xs text-green-100/80">
                    {isTyping ? 'typing...' : (apiKey ? 'AI Active 🟢' : 'Basic Mode 🟡')}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 px-2">
            <Settings size={20} className="opacity-80 cursor-pointer hover:opacity-100" onClick={() => setShowSettings(!showSettings)} />
            <MoreVertical size={20} className="opacity-80 cursor-pointer" />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-72 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-800 mb-2">Demo Controls</h3>
            
            <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1">OpenAI API Key</label>
                <input 
                    type="password" 
                    placeholder="sk-..." 
                    className="w-full p-2 border rounded text-sm bg-gray-50"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>

            <button 
                onClick={handleReset}
                disabled={isResetting}
                className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded text-sm flex items-center justify-center gap-2 hover:bg-red-100 mb-2 disabled:opacity-50"
            >
                {isResetting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isResetting ? "Resetting..." : "Start Fresh Session"}
            </button>

            <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-900"
            >
                Close
            </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
        {isLoadingHistory && (
            <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[60%] rounded-lg p-2 shadow-sm relative text-sm",
                msg.sender === 'user' 
                    ? "bg-[#d9fdd3] rounded-tr-none" 
                    : "bg-white rounded-tl-none"
              )}
            >
              {msg.type === 'text' && <p className="text-gray-800 whitespace-pre-wrap px-1">{msg.content}</p>}
              {msg.type === 'job-card' && msg.jobData && <JobCard job={msg.jobData} />}
              
              <span className="text-[10px] text-gray-500 block text-right mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-white rounded-lg p-3 rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 z-10">
        <Smile size={24} className="text-gray-500 cursor-pointer hover:text-gray-600" />
        <Paperclip size={24} className="text-gray-500 cursor-pointer hover:text-gray-600" />
        
        <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 shadow-sm">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type a message"}
                className="flex-1 outline-none text-sm text-gray-700"
            />
        </div>

        {input.trim() ? (
             <button 
                onClick={() => handleSend()}
                className="p-2 bg-[#008069] rounded-full text-white hover:bg-[#006d59] transition-colors shadow-sm"
             >
                <Send size={20} />
             </button>
        ) : (
            <button 
                onClick={toggleListening}
                className={cn(
                    "p-2 rounded-full transition-colors shadow-sm",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-500 hover:bg-gray-200"
                )}
            >
                {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
            </button>
        )}
      </div>
    </div>
  );
};
