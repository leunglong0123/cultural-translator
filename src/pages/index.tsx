import { useState } from "react"
import GroundingMetadata, { GroundingMetadataProps } from "@/components/GroundingMetadata"

const examples = [
  "I would like to know a slang from nepal called सल्याङ",
  "I want to learn about the Political Landscape of Nepal.",
  "I want to know a festival related to Nepali Culture named Tihar",
  "I want to know the nepal food cusine named Dal bhat",
];
const Home = () => {
  const [messages, setMessages] = useState<
    { role: string; text: string; groundingMetadata?: GroundingMetadataProps; timestamp?: string; showReferences?: boolean }[]
  >([])
  const [userInput, setUserInput] = useState("")
  const [loading, setLoading] = useState(false)

  const toggleReferences = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === index ? { ...msg, showReferences: !msg.showReferences } : msg
      )
    );
  };

  const sendMessageV2 = async (message: string) => {
    if (!message) {
      console.log("user", message);
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: message, timestamp },
    ]);
    setUserInput("");
    setLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: message,
          history,
        }),
      });

      const data = await res.json();

      const botResponse = data.responses[0];
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: botResponse.text,
          groundingMetadata: botResponse.groundingMetadata,
          timestamp,
          showReferences: false,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to handle example click

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold">Cultural Translator Chatbot</h1>
        </div>

        {/* Chat Window */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.length <= 0 && (
            <div className="flex-row grid grid-cols-4 gap-4">
              {examples.map((example) => {
                return (
                  <div
                    key={example}
                    className="border rounded-md p-4 border-sky-800 select-none cursor-pointer"
                    onClick={() => sendMessageV2(example)} // Use the new function
                  >
                    {example}
                  </div>
                );
              })}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {msg.role === "model" && (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  B
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-xs p-3 rounded-lg shadow ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-400 block mt-1 text-right">
                  {msg.timestamp}
                </span>

                {/* Show Reference Button */}
                {msg.role === "model" && msg.groundingMetadata && (
                  <>
                    <button
                      onClick={() => toggleReferences(idx)}
                      className="text-blue-500 text-sm mt-2 underline focus:outline-none"
                    >
                      {msg.showReferences
                        ? "Hide References"
                        : "Show References"}
                    </button>
                    {msg.showReferences && (
                      <GroundingMetadata
                        groundingChunks={msg.groundingMetadata.groundingChunks}
                      />
                    )}
                  </>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold ml-3">
                  U
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              onClick={() => sendMessageV2(userInput)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
