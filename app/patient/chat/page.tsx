"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatCircle, PaperPlaneTilt, User, Robot } from "phosphor-react"

export default function HealthChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your AI health assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setInput("")

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your question. I'm analyzing your query and will provide helpful health information. For specific medical concerns, please consult with a healthcare professional.",
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">Health Chat</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">AI health assistant for your questions</p>
        </div>

        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm h-[600px] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[oklch(0.6_0.2_45)] flex items-center justify-center flex-shrink-0">
                      <Robot size={20} weight="regular" className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.sender === "user"
                        ? "bg-[oklch(0.6_0.2_45)] text-white"
                        : "bg-[rgba(55,50,47,0.05)] text-[#37322F]"
                    }`}
                  >
                    <p className="font-sans text-sm">{message.text}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User size={20} weight="regular" className="text-[#37322F]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-[rgba(55,50,47,0.12)] p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your health question..."
                  className="flex-1 border border-[rgba(55,50,47,0.12)]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90"
                >
                  <PaperPlaneTilt size={20} weight="regular" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
