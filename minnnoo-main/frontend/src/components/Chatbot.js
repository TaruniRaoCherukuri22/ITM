import { useState } from "react";
import { apiFetch } from "../utils/api";

export default function Chatbot({ userId, onClose }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 Ask me anything about jobs, ATS score, or applications." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/chatbot/ask", {
        method: "POST",
        body: JSON.stringify({
          userId,
          message: input
        })
      });

      const data = await res.json();

      const botMessages = [{ from: "bot", text: data.reply }];

if (data.data && Array.isArray(data.data)) {
  data.data.forEach(job => {
    botMessages.push({
      from: "bot",
      text: `📌 ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n⭐ ATS Score: ${job.atsScore}`
    });
  });
}

setMessages(prev => [...prev, ...botMessages]);

      // setMessages(prev => [
      //   ...prev,
      //   { from: "bot", text: data.reply }
      // ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "Something went wrong 😕" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-[#11162a]
                    border border-white/10 rounded-2xl shadow-xl z-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center
                      p-4 border-b border-white/10">
        <h3 className="font-semibold text-blue-400">
          🤖 Career Assistant
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✖
        </button>
      </div>

      {/* MESSAGES */}
      <div className="p-4 h-80 overflow-y-auto space-y-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[85%]
              ${m.from === "user"
                ? "bg-blue-600 ml-auto text-white"
                : "bg-black/40 text-gray-200"}`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <p className="text-xs text-gray-400">Thinking...</p>
        )}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 p-4 border-t border-white/10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          className="flex-1 bg-black/40 px-3 py-2 rounded-lg
                     text-sm focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 rounded-lg text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
