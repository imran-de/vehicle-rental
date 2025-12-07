import pool from './db';

const createTables = async () => {
    const userTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'customer',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    `;

    const vehicleTableQuery = `
        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            registration_number VARCHAR(50) UNIQUE NOT NULL,
            daily_rent_price DECIMAL(10, 2) NOT NULL,
            availability_status VARCHAR(20) NOT NULL DEFAULT 'available',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    `;

    const bookingTableQuery = `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
            rent_start_date TIMESTAMP NOT NULL,
            rent_end_date TIMESTAMP NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        );
    `;

    try {
        await pool.query(userTableQuery);
        await pool.query(vehicleTableQuery);
        await pool.query(bookingTableQuery);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export default createTables;
