import pool from '../../config/db';
import AppError from '../../utils/AppError';
import { BookingService } from '../booking/booking.service';

const VALID_VEHICLE_TYPES = ['car', 'bike', 'van', 'SUV'];

const createVehicle = async (payload: any) => {
    if (!VALID_VEHICLE_TYPES.includes(payload.type)) {
        throw new AppError(400, `Type must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`);
    }

    const keys = Object.keys(payload);
    const values = Object.values(payload);
    const columns = keys.map((key) => `"${key}"`).join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
        INSERT INTO vehicles (${columns}, "createdAt", "updatedAt") 
        VALUES (${placeholders}, NOW(), NOW()) 
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllVehicles = async () => {
    await BookingService.returnExpiredBookings();
    const result = await pool.query(
        'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles'
    );
    return result.rows;
};

const getVehicleById = async (id: number) => {
    await BookingService.returnExpiredBookings();
    const result = await pool.query(
        'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

const updateVehicle = async (id: number, payload: any) => {
    if (payload.type && !VALID_VEHICLE_TYPES.includes(payload.type)) {
        throw new AppError(400, `Type must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`);
    }

    const keys = Object.keys(payload);
    const values = Object.values(payload);

    if (keys.length === 0) {
        throw new AppError(400, 'No data to update');
    }

    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const query = `
        UPDATE vehicles 
        SET ${setClause}, "updatedAt" = NOW() 
        WHERE id = $1 
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    `;

    const result = await pool.query(query, [id, ...values]);

    if (result.rowCount === 0) {
        throw new AppError(404, 'Vehicle not found');
    }

    return result.rows[0];
};

const deleteVehicle = async (id: number) => {
    const activeBooking = await pool.query(
        `SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
        [id]
    );

    if (activeBooking.rowCount && activeBooking.rowCount > 0) {
        throw new AppError(400, 'Cannot delete vehicle with active bookings!');
    }

    const result = await pool.query(
        'DELETE FROM vehicles WHERE id = $1 RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status',
        [id]
    );

    if (result.rowCount === 0) {
        throw new AppError(404, 'Vehicle not found');
    }

    return result.rows[0];
};

export const VehicleService = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
};
