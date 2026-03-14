export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Living QR Art,{' '}
        <span className="text-purple-400">on-chain.</span>
      </h1>
      <p className="text-lg text-white/60 max-w-xl mb-10">
        QRON transforms your product QR codes into AI-generated art verified on the blockchain.
        Every scan tells a story.
      </p>
      <div className="flex gap-4">
        <a
          href="/services"
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          View Services
        </a>
        <a
          href="/orders"
          className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          My Orders
        </a>
      </div>
    </main>
  );
}
