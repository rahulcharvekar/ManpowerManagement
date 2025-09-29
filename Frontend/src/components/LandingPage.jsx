export function LandingPage({ onEntitySelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Manpower Management System
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Choose your role to access the appropriate dashboard
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            className="bg-white rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl shadow-lg animate-slide-up"
            onClick={() => onEntitySelect("worker")}
          >
            <div className="text-6xl mb-6 animate-bounce-in">👷‍♂️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Worker</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Access worker dashboard to view job opportunities, apply for positions, track applications, and manage your profile.
            </p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
              Enter as Worker
            </button>
          </div>

          <div 
            className="bg-white rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl shadow-lg animate-slide-up"
            onClick={() => onEntitySelect("employer")}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-6xl mb-6 animate-bounce-in" style={{ animationDelay: '0.1s' }}>🏢</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Employer</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Manage job postings, review applications, schedule interviews, and hire workers for your organization.
            </p>
            <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
              Enter as Employer
            </button>
          </div>

          <div 
            className="bg-white rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl shadow-lg animate-slide-up md:col-span-2 lg:col-span-1"
            onClick={() => onEntitySelect("board")}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-6xl mb-6 animate-bounce-in" style={{ animationDelay: '0.2s' }}>📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Board</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Administrative dashboard to oversee the entire system, manage users, and view comprehensive analytics.
            </p>
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
              Enter as Board Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
