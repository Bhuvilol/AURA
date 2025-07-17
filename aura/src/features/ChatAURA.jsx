import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ChatContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  background: linear-gradient(135deg, #181c24 0%, #23283b 40%, #0072ff 100%);
  background-size: 200% 200%;
  animation: ${gradientMove} 12s ease-in-out infinite;
  border-radius: 28px;
  box-shadow: 0 8px 32px 0 #00c6ff44, 0 0 24px 0 #00c6ff33;
  border: 1.5px solid rgba(0,198,255,0.18);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  padding: 1.5rem 1rem 1rem 1rem;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.7rem;
  justify-content: ${props => props.isUser ? "flex-end" : "flex-start"};
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${props => props.isUser ? "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" : "rgba(0,198,255,0.15)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.10);
`;

const MessageBubble = styled(motion.div)`
  background: ${props => props.isUser ? "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)" : "rgba(30,40,60,0.85)"};
  color: ${props => props.isUser ? "#fff" : "#b6eaff"};
  border-radius: 18px 18px 4px 18px;
  padding: 0.9rem 1.2rem;
  max-width: 75%;
  box-shadow: 0 2px 12px 0 #00c6ff55, 0 0 8px #00c6ff77;
  font-size: 1.08rem;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 0 24px #00c6ffcc;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 0.7rem;
  align-items: center;
`;

const ChatInput = styled.textarea`
  flex: 1;
  border-radius: 12px;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 1.08rem;
  resize: none;
  min-height: 44px;
  background: rgba(255,255,255,0.18);
  color: #222;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.08);
  outline: none;
`;

const SendButton = styled.button`
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 198, 255, 0.12);
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
  }
`;

const VoiceButton = styled.button`
  background: rgba(0,198,255,0.12);
  color: #0072ff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.10);
  transition: background 0.2s;
  &:hover {
    background: rgba(0,198,255,0.22);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00c6ff;
  font-size: 1.08rem;
  margin-left: 2.5rem;
`;

// Helper to render KaTeX math
function renderMath(text) {
  const regex = /\$\$(.+?)\$\$/g;
  let lastIndex = 0;
  let result = [];
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    try {
      result.push(
        <span
          key={key++}
          dangerouslySetInnerHTML={{ __html: katex.renderToString(match[1], { throwOnError: false }) }}
        />
      );
    } catch {
      result.push(match[0]);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

// Helper to render code blocks
function renderCodeBlocks(text) {
  const regex = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let result = [];
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(
      <pre key={key++} style={{ background: "#222", color: "#fff", borderRadius: 8, padding: 12, margin: "8px 0", overflowX: "auto" }}>
        <code>{match[1]}</code>
      </pre>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

const ChatAURA = () => {
  const [messages, setMessages] = useState([
    { sender: "aura", text: "Hello! I am AURA, your academic co-pilot. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  let recognition = null;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Voice input (Web Speech API)
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (!recognition) {
      recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
    }
    recognition.onresult = (event) => {
      setInput(input + event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: "aura", text: data.reply || data.error || "No response from AI." }]);
    } catch {
      setMessages(msgs => [...msgs, { sender: "aura", text: "Sorry, I couldn't reach the AI right now." }]);
    }
    setTyping(false);
  };

  return (
    <ChatContainer>
      <Messages>
        {messages.map((msg, i) => (
          <MessageRow key={i} isUser={msg.sender === "user"} style={i === 0 ? { marginTop: '1.2rem' } : {}}>
            {msg.sender !== "user" && (
              <Avatar isUser={false} title="AURA">🤖</Avatar>
            )}
            <MessageBubble
              isUser={msg.sender === "user"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {renderCodeBlocks(renderMath(msg.text))}
            </MessageBubble>
            {msg.sender === "user" && (
              <Avatar isUser={true} title="You">🧑</Avatar>
            )}
          </MessageRow>
        ))}
        {typing && (
          <MessageRow isUser={false}>
            <Avatar isUser={false} title="AURA">🤖</Avatar>
            <TypingIndicator>
              <span>• • •</span> AURA is thinking…
            </TypingIndicator>
          </MessageRow>
        )}
        <div ref={messagesEndRef} />
      </Messages>
      <InputRow>
        <ChatInput
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question or use the mic..."
          rows={1}
        />
        <VoiceButton onClick={handleVoice} title="Speak to AURA">
          <span role="img" aria-label="mic">🎤</span>
        </VoiceButton>
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputRow>
    </ChatContainer>
  );
};

export default ChatAURA; 