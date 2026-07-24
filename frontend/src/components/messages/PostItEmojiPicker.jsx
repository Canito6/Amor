

const QUICK_EMOJIS = ['❤️', '😍', '😂', '😭', '🥺', '💕', '✨', '🔥'];

export default function PostItEmojiPicker({
  handleReact
}) {
  return (
    <div className="emoji-picker-panel" onClick={(e) => e.stopPropagation()}>
      {QUICK_EMOJIS.map(emoji => (
        <button
          key={emoji}
          className="emoji-option"
          onClick={(e) => handleReact(e, emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
