import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("API Error:", err))
  }, [])

  return (
    <div className="min-h-screen bg-blue-900 p-10 text-white text-center">
      <h1 className="text-4xl font-bold mb-10">User Profiles (Live from Docker)</h1>
      <div className="flex justify-center gap-5">
        {users.map(u => (
          <div key={u.id} className="bg-white text-black p-5 rounded-xl shadow-lg w-64">
            <h2 className="text-xl font-bold">{u.name}</h2>
            <p className="text-gray-600">{u.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App