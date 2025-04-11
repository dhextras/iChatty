export default function TypingIndicator() {
  return (
    <div className="flex max-w-fit items-center justify-center rounded-lg px-4 py-3 pb-2 pt-4">
      <div className="flex h-8 items-center space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-typing h-2.5 w-2.5 rounded-full bg-gray-500"
            style={{
              animationDelay: `${i * 0.15}s`,
              position: "relative",
            }}
          />
        ))}
      </div>
    </div>
  );
}
