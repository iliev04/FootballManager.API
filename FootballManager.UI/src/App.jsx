import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    axios.get('https://localhost:7216/api/clubs')
      .then(response => {
        setClubs(response.data);
      })
      .catch(error => {
        console.error("Грешка при теглене на данните!", error);
      });
  }, []);

  return (
    <div className="container">
      <h1>🏆 Моят Football Manager</h1>
      <h2>Списък с отбори:</h2>
      
      <div className="clubs-list">
        {clubs.map(club => (
          <div key={club.id} className="club-card">
            <h3>{club.name}</h3>
            <p>Бюджет: <strong>€{club.budget.toLocaleString()}</strong></p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App