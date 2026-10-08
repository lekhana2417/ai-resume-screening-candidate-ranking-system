import React, { useState, useRef, useEffect } from 'react';
import { JobDescription, CandidateAnalysisResult, ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit
} from 'lucide-react';

interface RecruiterChatbotProps {
  jobDescription: JobDescription;
  candidateResults: CandidateAnalysisResult[];
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const RecruiterChatbot: React.FC<RecruiterChatbotProps> = ({
  jobDescription,
  candidateResults,
  isOpen,
  onToggleOpen
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your **AI Recruiting Copilot** powered by Gemini.

I have full visibility into your **Job Description** and **${candidateResults.length} uploaded candidate resumes**. 

Ask me anything—such as comparing candidates, probing skill gaps, drafting technical interview questions, or assessing salary/seniority alignment!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Context summary to pass to backend
  const buildContext = () => {
    return {
      jobDescription: {
        title: jobDescription.title,
        department: jobDescription.department,
        minExperienceYears: jobDescription.minExperienceYears,
        educationLevel: jobDescription.educationLevel,
        requiredSkills: jobDescription.requiredSkills,
        preferredSkills: jobDescription.preferredSkills,
        summary: jobDescription.summary || jobDescription.rawText.slice(0, 500)
      },
      candidates: candidateResults.map(c => ({
        name: c.candidateName,
        role: c.currentRole,
        experienceYears: c.experienceYears,
        education: c.education,
        overallScore: c.overallScore,
        skillsScore: c.skillsScore,
        tier: c.tier,
        status: c.status,
        matchedSkills: c.matchedSkills,
        missingRequiredSkills: c.missingRequiredSkills,
        strengths: c.strengths,
        gaps: c.gaps,
        summary: c.executiveSummary
      }))
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: buildContext()
        })
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Failed to get chat response:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I encountered an error communicating with Gemini. Please check your network connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Chat history reset. How can I assist you with your active candidates and requisition?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestedPrompts = [
    "Who is the best candidate for this role and why?",
    "Compare the top 2 candidates side-by-side",
    "What are the biggest skill gaps in the candidate pool?",
    "Generate 3 technical interview questions for our strongest applicant"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-4 shadow-xl shadow-blue-500/25 flex items-center space-x-2.5 transition transform hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="font-bold text-sm">AI Recruiter Copilot</span>
        {candidateResults.length > 0 && (
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {candidateResults.length} Resumes
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[460px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-white">Recruiter Copilot</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 font-semibold">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {jobDescription.title ? `${jobDescription.title} (${candidateResults.length} candidates)` : 'Ready for queries'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className={isUser ? 'text-blue-200' : 'text-slate-400'}>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-2xs flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1">Analyzing resumes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px]">
          {suggestedPrompts.slice(0, 2).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg text-left whitespace-nowrap transition cursor-pointer border border-slate-200/60"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about candidate strengths, gaps, or interview prep..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
