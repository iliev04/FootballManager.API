import { useState, useEffect } from 'react';

function App() {
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Изтегляме едновременно отборите и играчите от C# API-то
    Promise.all([
      fetch('https://localhost:7216/api/Clubs').then(res => res.json()),
      fetch('https://localhost:7216/api/Players').then(res => res.json())
    ])
    .then(([clubsData, playersData]) => {
      // Подреждаме отборите по бюджет (тъй като още нямаме поле за Точки)
      const sortedClubs = clubsData.sort((a, b) => b.budget - a.budget);
      setClubs(sortedClubs);
      
      // Подреждаме играчите по пазарна цена и взимаме Топ 5 за звезди на таблото
      const topPlayers = playersData.sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);
      setPlayers(topPlayers);
      
      setLoading(false);
    })
    .catch(error => {
      console.error("Грешка при връзката с API-то:", error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* 1. Странично меню (Sidebar) */}
      <aside className="w-64 bg-slate-800 p-6 border-r border-slate-700 flex flex-col z-10">
        <h2 className="text-3xl font-black mb-10 tracking-wider">
          <span className="text-green-500">FM</span> PRO
        </h2>
        
        <nav className="flex flex-col space-y-3 text-slate-300 font-medium">
          <a href="#" className="text-white bg-green-950/50 px-4 py-2.5 rounded-lg border-l-4 border-green-500 transition">Табло</a>
          <a href="#" className="px-4 py-2.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition">Отбори</a>
          <a href="#" className="px-4 py-2.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition">Трансфери</a>
          <a href="#" className="px-4 py-2.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition">Тактика</a>
        </nav>
      </aside>

      {/* Основна част */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-slate-950">
        
        {/* Хедър */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Европейска Суперлига</h1>
            <p className="text-slate-400 mt-2 text-lg">Сезон 2026 | Главно Табло</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/30 text-lg flex items-center gap-2">
              Продължи <span className="text-xl">⚽</span>
            </button>
          </div>
        </header>

        {/* Информационни карти (Топ ред) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <Card title="Следващ мач" value="Ман Сити" sub="След 4 дни" icon="🏆" />
          <Card title="Общ Бюджет на Лигата" value="€ 1.28 B" sub="Финансово състояние" icon="💰" color="text-green-400" />
          <Card title="Изиграни Мачове" value="3" sub="От общо 90" icon="📈" />
          <Card title="Статус на сървъра" value="Онлайн" sub="API връзката е активна" icon="🟢" color="text-blue-400" />
        </div>

        {/* Централна част - Списъци */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Класиране по Бюджет */}
          <section className="xl:col-span-2 bg-slate-800 p-7 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Класиране по Бюджет</h3>
              <span className="text-slate-400 text-sm font-semibold">На живо</span>
            </div>
            
            <div className="space-y-1">
              {/* Хедър на таблицата */}
              <div className="grid grid-cols-12 gap-2 text-xs uppercase text-slate-500 font-semibold px-4 py-2">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Отбор</div>
                <div className="col-span-4 text-right">Бюджет (€)</div>
              </div>
              
              {/* Данни от C# */}
              {loading ? (
                <div className="p-8 text-center text-slate-400 animate-pulse">Зареждане на данните от API-то...</div>
              ) : (
                clubs.map((club, index) => (
                  <div key={club.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 rounded-lg hover:bg-slate-700/30 transition border-b border-slate-700/50 last:border-0">
                    <div className="col-span-1 font-bold text-slate-500">{index + 1}</div>
                    <div className="col-span-7 font-semibold text-base flex items-center gap-3">
                      {/* Генерираме кръгче с първата буква на отбора като лого */}
                      <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white">
                        {club.name.charAt(0)}
                      </div>
                      {club.name}
                    </div>
                    <div className="col-span-4 text-right font-bold text-green-400">
                      {(club.budget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Най-скъпи играчи */}
          <section className="bg-slate-800 p-7 rounded-2xl border border-slate-700 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Най-скъпи играчи</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-slate-400">Зареждане...</div>
              ) : (
                players.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl border border-slate-500">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-md">{player.firstName} {player.lastName}</p>
                      <p className="text-slate-400 text-xs mt-1">Позиция: {player.position} | Атака: <span className="text-white font-bold">{player.attackStat}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-sm">€{(player.marketValue / 1000000).toFixed(0)}M</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// Помощен компонент за картите
function Card({ title, value, sub, icon, color = "text-white" }) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex gap-5 items-start transition hover:-translate-y-1 hover:shadow-2xl hover:border-slate-600">
      <div className="text-4xl mt-1">{icon}</div>
      <div>
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold">{title}</h3>
        <p className={`text-3xl font-extrabold mt-1.5 ${color}`}>{value}</p>
        <p className="text-sm text-slate-500 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default App;