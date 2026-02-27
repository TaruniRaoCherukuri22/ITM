import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User as UserIcon } from "lucide-react";

export default function HRChatbot({ userId, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your HR Assistant. How can I help you today?",
      type: "text"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (overrideMsg = null) => {
    const textToSend = overrideMsg || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "hr", text: textToSend, type: "text" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/hr-chat/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend, userId })
        }
      );

      const data = await res.json();

      if (data.botResponse) {
        setMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: data.botResponse.text,
            data: data.botResponse.data,
            type: data.botResponse.type || "text"
          }
        ]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, I'm having trouble connecting to the server.", type: "text" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (m) => {
    if (m.type === "suggestions" && Array.isArray(m.data)) {
      return (
        <div className="space-y-2">
          <p>{m.text}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {m.data.map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s.action)}
                className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full hover:bg-blue-100 transition"
              >
                {s.description}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (m.type === "table" && Array.isArray(m.data)) {
      const keys = m.data.length > 0 ? Object.keys(m.data[0]) : [];
      return (
        <div className="space-y-2">
          <p>{m.text}</p>
          <div className="overflow-x-auto mt-2 border rounded-lg bg-white">
            <table className="min-w-full text-[11px] divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {keys.map(k => <th key={k} className="px-2 py-1.5 text-left font-semibold text-gray-600">{k}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {m.data.map((row, i) => (
                  <tr key={i}>
                    {keys.map(k => <td key={k} className="px-2 py-1.5 text-gray-700">{row[k]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{m.text}</p>;
  };

  return (
    <div className="w-80 sm:w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold">HR Assistant</h3>
            <p className="text-[10px] text-blue-100">Online & Ready to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-gray-50/50"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "hr" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${m.sender === "hr" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                ${m.sender === "hr" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {m.sender === "hr" ? <UserIcon size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm shadow-sm
                  ${m.sender === "hr"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
              >
                {renderContent(m)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-gray-500" />
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none text-gray-700"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
