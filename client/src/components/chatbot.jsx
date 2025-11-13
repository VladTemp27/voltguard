import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Chatbot() {
  const [showChatbot, setShowChatbot] = useState(false)

  return (
    <>
      {/* Chatbot Button */}
      <Button
        onClick={() => setShowChatbot(!showChatbot)}
        size="icon"
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full shadow-lg bg-white hover:bg-gray-50 border-4 border-primary flex items-center justify-center"
      >
        <img src="/energy-shield-logo.png" alt="Chat Assistant" className="w-12 h-12" />
      </Button>

      {/* Chatbot Preview */}
      {showChatbot && (
        <div className="absolute bottom-24 right-8 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-primary">Energy Assistant</h3>
            <button onClick={() => setShowChatbot(false)} className="text-gray-500 hover:text-primary text-2xl">
              ×
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-base text-primary font-semibold">Assistant</p>
              <p className="text-base text-gray-700 mt-1">How can I help you save energy today?</p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-lg ml-auto w-fit">
              <p className="text-base text-secondary">What's my status?</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full mt-3 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
    </>
  )
}
