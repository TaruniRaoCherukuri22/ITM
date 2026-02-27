import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, MessageSquare, X, Maximize2, Minimize2, MessageSquareText } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Chatbot({ onClose, userId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello HR 👋 I am your Internal Talent Assistant. Ask me about users, vacancies, resume scores, or analytics.",
      sender: "bot",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Who are the top employees?",
    "Show me vacancies in New York",
    "Filter users with python skills",
    "Give me a skills report"
  ];

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const checkConnection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      setIsConnected(res.ok);
    } catch {
      setIsConnected(false);
    }
  };

  const handleSendMessage = async (message) => {
    const finalMessage = message || inputValue;
    if (!finalMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: finalMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/hr-chat/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalMessage, userId }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.botResponse?.text || data.error || "I couldn't generate a response. Please try again.",
        rawData: data.botResponse,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I'm having trouble connecting to the backend. Please check if the server is running. 🚨",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isMinimized ? 'h-14' : 'h-[600px]'} w-[400px] max-w-[calc(100vw-3rem)] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden flex flex-col z-50 transition-all duration-300 ease-out font-sans`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <MessageSquareText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">HR Intelligence</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? "bg-green-400" : "bg-red-400"}`}></span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">{isConnected ? "Online" : "Connecting..."}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm ${msg.sender === "user" ? "bg-blue-100 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-indigo-600"}`}>
                  {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.sender === "user"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                  }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Modern Table Rendering */}
                  {msg.sender === "bot" && msg.rawData?.type === "table" && msg.rawData.data && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50 shadow-inner">
                      <table className="w-full text-left text-[11px] border-collapse min-w-[300px]">
                        <thead>
                          <tr className="bg-gray-100/30">
                            {msg.rawData.data.length > 0 && Object.keys(msg.rawData.data[0]).map((key) => (
                              <th key={key} className="px-3 py-2 font-bold text-gray-500 uppercase tracking-tight border-b border-gray-100">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {msg.rawData.data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              {Object.values(row).map((val, i) => (
                                <td key={i} className="px-3 py-2 text-gray-600">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Interactive Suggestions */}
                  {msg.sender === "bot" && msg.rawData?.type === "suggestions" && msg.rawData.data && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100/50">
                      {msg.rawData.data.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(s.action)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all border border-blue-100 active:scale-95"
                        >
                          {s.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 min-w-[60px]">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && !isLoading && (
            <div className="px-5 py-2 overflow-x-auto no-scrollbar flex gap-2 bg-gray-50/50">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask something..."
                className="w-full pl-4 pr-4 py-3 bg-gray-100 text-gray-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbot;