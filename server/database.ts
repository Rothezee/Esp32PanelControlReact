import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'
import { promisify } from 'util'

let db: sqlite3.Database

export function initDatabase() {
  db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error('Error opening database:', err)
    } else {
      console.log('Connected to SQLite database')
    }
  })

  // Create tables
  createTables()
}

async function createTables() {
  const run = promisify(db.run.bind(db))
  
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Devices table
    await run(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        locality TEXT DEFAULT '',
        fields TEXT DEFAULT '[]',
        last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Device data table
    await run(`
      CREATE TABLE IF NOT EXISTS device_data (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
      )
    `)

    // Daily closes table
    await run(`
      CREATE TABLE IF NOT EXISTS daily_closes (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        date TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
      )
    `)

    // Create default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    await run(`
      INSERT OR IGNORE INTO users (id, username, password) 
      VALUES (?, ?, ?)
    `, ['admin', 'admin', hashedPassword])

    // Create sample devices
    const sampleDevices = [
      { 
        id: 'ESP32_001', 
        name: 'Máquina 1', 
        type: 'grua',
        locality: 'Centro Comercial Plaza Norte',
        fields: [
          { id: '1', name: 'Pesos', key: 'pesos', type: 'number', required: true },
          { id: '2', name: 'Coin', key: 'coin', type: 'number', required: true },
          { id: '3', name: 'Premios', key: 'premios', type: 'number', required: true },
          { id: '4', name: 'Banco', key: 'banco', type: 'number', required: true },
        ]
      },
      { 
        id: 'ESP32_002', 
        name: 'Máquina 2', 
        type: 'grua',
        locality: 'Mall del Sur',
        fields: [
          { id: '1', name: 'Pesos', key: 'pesos', type: 'number', required: true },
          { id: '2', name: 'Coin', key: 'coin', type: 'number', required: true },
          { id: '3', name: 'Premios', key: 'premios', type: 'number', required: true },
          { id: '4', name: 'Banco', key: 'banco', type: 'number', required: true },
        ]
      },
      { 
        id: 'EXPENDEDORA_1', 
        name: 'Expendedora 1', 
        type: 'expendedora',
        locality: 'Centro Comercial Unicentro',
        fields: [
          { id: '1', name: 'Fichas', key: 'fichas', type: 'number', required: true },
          { id: '2', name: 'Dinero', key: 'dinero', type: 'number', required: true },
        ]
      },
      { 
        id: 'Videojuego_1', 
        name: 'Videojuego 1', 
        type: 'videojuego',
        locality: 'Parque de Diversiones Central',
        fields: [
          { id: '1', name: 'Coin', key: 'coin', type: 'number', required: true },
        ]
      },
      { 
        id: 'Ticket_1', 
        name: 'Ticketera 1', 
        type: 'ticketera',
        locality: 'Centro Comercial Santafé',
        fields: [
          { id: '1', name: 'Coin', key: 'coin', type: 'number', required: true },
          { id: '2', name: 'Tickets', key: 'tickets', type: 'number', required: true },
        ]
      },
    ]

    for (const device of sampleDevices) {
      await run(`
        INSERT OR IGNORE INTO devices (id, name, type, locality, fields) 
        VALUES (?, ?, ?, ?, ?)
      `, [device.id, device.name, device.type, device.locality, JSON.stringify(device.fields)])
    }

    // Generate fictional test data for the last 30 days
    const devices = await dbAll('SELECT id FROM devices')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (const device of devices) {
      for (let day = 0; day < 30; day++) {
        const date = new Date(thirtyDaysAgo)
        date.setDate(date.getDate() + day)
        
        // Generate 5-15 entries per day per device
        const entriesPerDay = Math.floor(Math.random() * 11) + 5
        
        for (let entry = 0; entry < entriesPerDay; entry++) {
          const entryTime = new Date(date)
          entryTime.setHours(Math.floor(Math.random() * 24))
          entryTime.setMinutes(Math.floor(Math.random() * 60))
          
          // Generate realistic data based on device type
          let data = {}
          const deviceInfo = sampleDevices.find(d => d.id === device.id)
          
          if (deviceInfo?.type === 'grua') {
            data = {
              pesos: Math.floor(Math.random() * 50) + 10,
              coin: Math.floor(Math.random() * 20) + 1,
              premios: Math.floor(Math.random() * 5),
              banco: Math.floor(Math.random() * 200) - 50
            }
          } else if (deviceInfo?.type === 'expendedora') {
            data = {
              fichas: Math.floor(Math.random() * 100) + 20,
              dinero: Math.floor(Math.random() * 500) + 100
            }
          } else if (deviceInfo?.type === 'videojuego') {
            data = {
              coin: Math.floor(Math.random() * 15) + 1
            }
          } else if (deviceInfo?.type === 'ticketera') {
            data = {
              coin: Math.floor(Math.random() * 10) + 1,
              tickets: Math.floor(Math.random() * 50) + 10
            }
          }
          
          const entryId = `${device.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          await run(`
            INSERT OR IGNORE INTO device_data (id, device_id, data, timestamp) 
            VALUES (?, ?, ?, ?)
          `, [entryId, device.id, JSON.stringify(data), entryTime.toISOString()])
        }
      }
    }
    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}

export function getDatabase(): sqlite3.Database {
  return db
}

// Helper function to promisify database operations
export function dbGet(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function dbAll(query: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

export function dbRun(query: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}