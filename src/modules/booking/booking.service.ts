import pool from '../../config/db';
import AppError from '../../utils/AppError';

const createBooking = async (
    userId: number,
    payload: { vehicle_id: number; rent_start_date: string; rent_end_date: string },
) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const vehicleResult = await client.query(
            'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1',
            [payload.vehicle_id]
        );
        const vehicle = vehicleResult.rows[0];

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found!');
        }

        if (vehicle.availability_status !== 'available') {
            throw new AppError(400, 'Vehicle is not available!');
        }

        const startDate = new Date(payload.rent_start_date);
        const endDate = new Date(payload.rent_end_date);

        if (startDate < new Date()) {
            throw new AppError(400, 'Start date cannot be in the past!');
        }

        if (endDate <= startDate) {
            throw new AppError(400, 'End date must be after start date!');
        }

        const durationInMs = endDate.getTime() - startDate.getTime();
        const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
        const total_price = durationInDays * vehicle.daily_rent_price;

        const bookingResult = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status, "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW()) 
             RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
            [userId, payload.vehicle_id, startDate, endDate, total_price]
        );
        const booking = bookingResult.rows[0];

        await client.query(
            `UPDATE vehicles SET availability_status = 'booked', "updatedAt" = NOW() WHERE id = $1`,
            [payload.vehicle_id]
        );

        const customerResult = await client.query(
            'SELECT id, name, email, phone, role FROM users WHERE id = $1',
            [userId]
        );
        booking.customer = customerResult.rows[0];
        booking.vehicle = vehicle;

        await client.query('COMMIT');
        return booking;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAllBookings = async (userId: number, role: string) => {
    await returnExpiredBookings(); // Auto-return expired bookings
    let query = `
        SELECT b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status, 
               json_build_object(
                   'id', v.id, 
                   'vehicle_name', v.vehicle_name, 
                   'type', v.type, 
                   'registration_number', v.registration_number, 
                   'daily_rent_price', v.daily_rent_price, 
                   'availability_status', v.availability_status
               ) as vehicle, 
               json_build_object(
                   'id', u.id, 
                   'name', u.name, 
                   'email', u.email, 
                   'phone', u.phone, 
                   'role', u.role
               ) as customer  
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        JOIN users u ON b.customer_id = u.id
    `;
    const params: any[] = [];

    if (role !== 'admin') {
        query += ` WHERE b.customer_id = $1`;
        params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rows;
};

const updateBooking = async (bookingId: number, userId: number, role: string, payload: any) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const bookingResult = await client.query(
            'SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE id = $1',
            [bookingId]
        );
        const booking = bookingResult.rows[0];

        if (!booking) {
            throw new AppError(404, 'Booking not found!');
        }

        if (role === 'customer') {
            if (booking.customer_id !== userId) {
                throw new AppError(403, 'You are not authorized to update this booking!');
            }
            if (payload.status !== 'cancelled') {
                throw new AppError(400, 'Customers can only cancel bookings!');
            }
        } else if (role === 'admin') {
            if (payload.status !== 'returned') {
                throw new AppError(400, 'Admins can only mark bookings as returned!');
            }
        } else {
            throw new AppError(403, 'Invalid role!');
        }

        const updatedBookingResult = await client.query(
            `UPDATE bookings SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
            [payload.status, bookingId]
        );
        const updatedBooking = updatedBookingResult.rows[0];

        if (payload.status === 'returned' || payload.status === 'cancelled') {
            await client.query(
                `UPDATE vehicles SET availability_status = 'available', "updatedAt" = NOW() WHERE id = $1`,
                [booking.vehicle_id]
            );
        }

        const vehicleResult = await client.query(
            'SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1',
            [booking.vehicle_id]
        );
        const customerResult = await client.query(
            'SELECT id, name, email, phone, role FROM users WHERE id = $1',
            [booking.customer_id]
        );

        updatedBooking.vehicle = vehicleResult.rows[0];
        updatedBooking.customer = customerResult.rows[0];

        await client.query('COMMIT');
        return updatedBooking;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const returnExpiredBookings = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find and update expired bookings
        const expiredBookingsResult = await client.query(
            `UPDATE bookings
             SET status = 'returned', "updatedAt" = NOW()
             WHERE status = 'active' AND rent_end_date < NOW()
             RETURNING vehicle_id`
        );

        const vehicleIds = expiredBookingsResult.rows.map((row) => row.vehicle_id);

        if (vehicleIds.length > 0) {
            const uniqueVehicleIds = [...new Set(vehicleIds)];
            await client.query(
                `UPDATE vehicles
                 SET availability_status = 'available', "updatedAt" = NOW()
                 WHERE id = ANY($1::int[])`,
                [uniqueVehicleIds]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error auto-returning bookings:', error);
    } finally {
        client.release();
    }
};

export const BookingService = {
    createBooking,
    getAllBookings,
    updateBooking,
    returnExpiredBookings,
};
