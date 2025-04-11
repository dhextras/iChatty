export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-action">
      <div className="flex flex-col items-center transition-opacity duration-500">
        <div className="mb-6 animate-pulse items-center justify-center">
          <img src="/logo.svg" alt="iChatty" className="block w-full" />
        </div>

        <div className="mt-8 flex space-x-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="h-3 w-3 animate-wave rounded-full bg-white"
              style={{ animationDelay: `${dot * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
