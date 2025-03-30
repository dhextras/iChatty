export default function SplashScreen() {
  return (
    <div className="from-primary to-action fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br">
      <div className="flex flex-col items-center transition-opacity duration-500">
        <div className="mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-white">
          <img src="/logo.png" alt="I-Chatty" className="block w-full" />
        </div>
        <h1 className="animate-slideup mb-2 text-3xl font-bold text-white">
          I-Chatty
        </h1>
        <p className="animate-slideup animation-delay-200 text-lg text-white opacity-90">
          Your personal support companion
        </p>

        <div className="mt-8 flex space-x-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="animate-wave h-3 w-3 rounded-full bg-white"
              style={{ animationDelay: `${dot * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
