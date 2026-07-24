

export default function TypingIndicator({ partnerNameTyping }) {
  return (
    <div className="typing-container">
      <div className="typing-dots-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
        <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
      </div>
      <span className="typing-label">💬 {partnerNameTyping} está a escrever</span>
    </div>
  );
}
