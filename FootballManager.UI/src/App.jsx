import { useState, useEffect } from 'react';

// --- ПОМОЩНИ КОМПОНЕНТИ ---

// 1. Компонент за информационните карти горе
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

// 2. НОВ КОМПОНЕНТ: 2D Графика на терена
function Pitch({ isSimulating }) {
  // Генерираме 22 играчи с начални случайни позиции (x, y в проценти)
  const [players, setPlayers] = useState(() => {
    const init = [];
    for (let i = 0; i < 22; i++) {
      init.push({
        id: i,
        team: i < 11 ? 'home' : 'away',
        x: i < 11 ? Math.random() * 40 + 5 : Math.random() * 40 + 55, // Домакините вляво, гостите вдясно
        y: Math.random() * 80 + 10
      });
    }
    return init;
  });

  useEffect(() => {
    if (!isSimulating) return;
    
    // На всяка секунда променяме позициите им леко, за да симулираме движение
    const interval = setInterval(() => {
      setPlayers(prev => prev.map(p => ({
        ...p,
        x: Math.max(2, Math.min(98, p.x + (Math.random() - 0.5) * 15)),
        y: Math.max(2, Math.min(98, p.y + (Math.random() - 0.5) * 15))
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="relative w-full h-48 bg-green-800 border-4 border-slate-300 rounded-lg mb-6 overflow-hidden shadow-inner">
      {/* Линии на терена */}
      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/60 transform -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-20 h-20 border-4 border-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-0 w-16 h-32 border-4 border-l-0 border-white/60 transform -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-16 h-32 border-4 border-r-0 border-white/60 transform -translate-y-1/2"></div>
      
      {/* Играчите */}
      {players.map(p => (
        <div 
          key={p.id} 
          className={`absolute w-3 h-3 rounded-full transition-all duration-1000 ease-in-out shadow-lg border border-white/50 ${p.team === 'home' ? 'bg-red-500 z-20' : 'bg-blue-500 z-10'}`} 
          style={{ top: `${p.y}%`, left: `${p.x}%` }}
        ></div>
      ))}

      {/* Индикация, че се играе */}
      {isSimulating && (
        <div className="absolute top-2 right-4 text-white/80 font-bold text-sm animate-pulse">LIVE 🔴</div>
      )}
    </div>
  );
}

// --- ГЛАВНО ПРИЛОЖЕНИЕ ---

function App() {
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стейт за Мач Симулатора
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchEvents, setMatchEvents] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // Изтегляне на данните при зареждане
  useEffect(() => {
    Promise.all([
      fetch('https://localhost:7216/api/Clubs').then(res => res.json()),
      fetch('https://localhost:7216/api/Players').then(res => res.json())
    ])
    .then(([clubsData, playersData]) => {
      setClubs(clubsData.sort((a, b) => b.budget - a.budget));
      setPlayers(playersData.sort((a, b) => b.marketValue - a.marketValue).slice(0, 5));
      setLoading(false);
      
      if (clubsData.length >= 2) {
        setHomeTeam(clubsData[0].id);
        setAwayTeam(clubsData[1].id);
      }
    });
  }, []);

  // Логика за симулиране на мач
  const startMatch = async () => {
    if (homeTeam === awayTeam) {
      alert("Избери два различни отбора!");
      return;
    }

    setMatchEvents([]);
    setFinalResult(null);
    setIsSimulating(true);

    try {
      const response = await fetch('https://localhost:7216/api/Matches/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeClubId: parseInt(homeTeam), awayClubId: parseInt(awayTeam) })
      });

      if (!response.ok) {
        const errText = await response.text();
        alert("Грешка от сървъра: " + errText);
        setIsSimulating(false);
        return;
      }

      const data = await response.json();
      
      // 1. Взимаме само редовете със събития (тези, които започват с "-")
      const rawLines = data.report.split('\n').filter(line => line.trim().startsWith('-'));
      
      // 2. Сортираме ги по минутата (извличаме числото преди символа ')
      const sortedEvents = rawLines.sort((a, b) => {
        const minA = parseInt(a.match(/- (\d+)'/)?.[1] || 0);
        const minB = parseInt(b.match(/- (\d+)'/)?.[1] || 0);
        return minA - minB;
      });

      // Ако мачът е 0:0, добавяме фиктивно събитие, за да има какво да покажем
      if (sortedEvents.length === 0) {
        sortedEvents.push("🎙️ Здрава битка в центъра на терена, но без сериозни опасности.");
      }

      let currentEventIndex = 0;
      
      // 3. Показваме ги едно по едно
      const interval = setInterval(() => {
        if (currentEventIndex < sortedEvents.length) {
          setMatchEvents(prev => [...prev, sortedEvents[currentEventIndex]]);
          currentEventIndex++;
        } else {
          // Мачът свърши
          clearInterval(interval);
          setTimeout(() => {
            setFinalResult(data.result);
            setIsSimulating(false);
          }, 1500); // Кратка пауза преди крайния резултат
        }
      }, 1800);

    } catch (error) {
      console.error(error);
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* СТРАНИЧНО МЕНЮ */}
      <aside className="w-64 bg-slate-800 p-6 border-r border-slate-700 flex flex-col z-10">
        <h2 className="text-3xl font-black mb-10 tracking-wider">
          <span className="text-green-500">FM</span> PRO
        </h2>
        <nav className="flex flex-col space-y-3 text-slate-300 font-medium">
          <a href="#" className="text-white bg-green-950/50 px-4 py-2.5 rounded-lg border-l-4 border-green-500 transition">Табло</a>
          <a href="#" className="px-4 py-2.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition">Отбори</a>
          <a href="#" className="px-4 py-2.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition">Трансфери</a>
        </nav>
      </aside>

      {/* ОСНОВНА ЧАСТ */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-slate-950 relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Европейска Суперлига</h1>
            <p className="text-slate-400 mt-2 text-lg">Сезон 2026 | Главно Табло</p>
          </div>
          <button 
            onClick={() => setIsMatchModalOpen(true)}
            className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/30 flex items-center gap-2 animate-pulse">
            Симулирай Мач <span className="text-xl">⚔️</span>
          </button>
        </header>

        {/* 4 Картинки горе */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <Card title="Следващ мач" value="Ман Сити" sub="След 4 дни" icon="🏆" />
          <Card title="Общ Бюджет" value="€ 1.28 B" sub="Финансово състояние" icon="💰" color="text-green-400" />
          <Card title="Изиграни Мачове" value="3" sub="От общо 90" icon="📈" />
          <Card title="Статус на сървъра" value="Онлайн" sub="API връзката е активна" icon="🟢" color="text-blue-400" />
        </div>

        {/* Централна зона - Таблици */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Класиране по Бюджет */}
          <section className="xl:col-span-2 bg-slate-800 p-7 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Класиране по Бюджет</h3>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 text-xs uppercase text-slate-500 font-semibold px-4 py-2">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Отбор</div>
                <div className="col-span-4 text-right">Бюджет (€)</div>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-400 animate-pulse">Зареждане...</div>
              ) : (
                clubs.map((club, index) => (
                  <div key={club.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 rounded-lg hover:bg-slate-700/30 transition border-b border-slate-700/50 last:border-0">
                    <div className="col-span-1 font-bold text-slate-500">{index + 1}</div>
                    <div className="col-span-7 font-semibold text-base flex items-center gap-3">
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
            <h3 className="text-2xl font-bold mb-6">Звезди на лигата</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-slate-400">Зареждане...</div>
              ) : (
                players.map((player) => (
                  <div key={player.id} className="flex items-center gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl border border-slate-500">👤</div>
                    <div className="flex-1">
                      <p className="font-semibold text-md">{player.firstName} {player.lastName}</p>
                      <p className="text-slate-400 text-xs mt-1">Поз: {player.position} | ОВР: <span className="text-white font-bold">{Math.round((player.attackStat + player.defenseStat + player.stamina)/3)}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      {/* --- МОДАЛЕН ПРОЗОРЕЦ ЗА МАЧА --- */}
      {isMatchModalOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-slate-800 w-full max-w-3xl rounded-2xl border border-slate-600 shadow-2xl p-8 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Мач Център</h2>
              {!isSimulating && (
                <button onClick={() => setIsMatchModalOpen(false)} className="text-slate-400 hover:text-white text-3xl transition">×</button>
              )}
            </div>

            {/* Избор на отбори */}
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700">
              <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} disabled={isSimulating} className="bg-slate-800 p-3 rounded-lg border border-slate-600 text-white w-[40%] text-lg font-bold focus:ring-2 focus:ring-green-500 outline-none">
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="text-3xl font-black text-slate-500 px-4">VS</div>
              <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} disabled={isSimulating} className="bg-slate-800 p-3 rounded-lg border border-slate-600 text-white w-[40%] text-lg font-bold focus:ring-2 focus:ring-green-500 outline-none">
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* БУТОН СТАРТ */}
            {!isSimulating && !finalResult && (
              <button onClick={startMatch} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-xl uppercase tracking-widest transition shadow-lg shadow-blue-900/50 mb-4 hover:scale-[1.02]">
                Начален Съдийски Сигнал ⚽
              </button>
            )}

            {/* 2D ТЕРЕН */}
            {(isSimulating || finalResult) && (
              <Pitch isSimulating={isSimulating} />
            )}

            {/* ТИКЕР СЪС СЪБИТИЯ */}
            <div className="flex-1 overflow-y-auto bg-slate-950 rounded-xl p-6 border border-slate-700 space-y-3 min-h-[150px]">
              {matchEvents.length === 0 && !isSimulating && !finalResult && (
                <p className="text-center text-slate-500 mt-8">Очаква се началото на мача...</p>
              )}

              {matchEvents.map((ev, index) => (
                <div key={index} className="p-3 rounded-lg border-l-4 bg-slate-800 border-blue-500 text-slate-200 animate-[slideIn_0.3s_ease-out]">
                  {ev.includes('ГОЛ') ? <span className="font-bold text-green-400">⚽ {ev}</span> : ev}
                </div>
              ))}

              {isSimulating && (
                <div className="text-center text-blue-400 animate-pulse font-bold mt-4">
                  Мачът се играе... ⏱️
                </div>
              )}
            </div>

            {/* КРАЕН РЕЗУЛТАТ */}
            {finalResult && (
              <div className="mt-6 bg-slate-900 border-2 border-green-500 p-6 rounded-xl text-center animate-[popIn_0.5s_ease-out]">
                <p className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">Краен Резултат</p>
                <h3 className="text-4xl font-black text-white">{finalResult}</h3>
                <button onClick={() => {setMatchEvents([]); setFinalResult(null);}} className="mt-4 text-green-500 hover:text-green-400 font-bold underline transition">
                  Избери нов мач
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default App;