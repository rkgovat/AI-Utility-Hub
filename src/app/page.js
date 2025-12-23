import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto p-10">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Welcome to your AI Hub
        </h1>
        <p className="text-lg text-slate-600">
          Select a specialized AI assistant to get started.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fitness Card */}
        <Link href="/fitness" className="group border rounded-xl p-6 bg-white shadow-sm hover:shadow-md hover:border-blue-500 transition-all">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600">🏋️ Fitness Coach</h2>
          <p className="text-slate-500">
            Generate custom workout plans based on your goals and schedule.
          </p>
        </Link>

        {/* Cooking Card (Inactive for now) */}
        <div className="border rounded-xl p-6 bg-gray-100 opacity-60 cursor-not-allowed">
          <h2 className="text-2xl font-bold mb-2">🍳 Meal Prepping</h2>
          <p className="text-slate-500">
            Coming soon: AI-powered recipes and grocery lists.
          </p>
        </div>
      </div>
    </div>
  );
}