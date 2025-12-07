import pool from '../../config/db';
import AppError from '../../utils/AppError';

const getAllUsers = async () => {
    const result = await pool.query(
        'SELECT id, name, email, phone, role FROM users'
    );
    return result.rows;
};

const updateUser = async (id: number, payload: any) => {
    const keys = Object.keys(payload);
    const values = Object.values(payload);

    if (keys.length === 0) {
        throw new AppError(400, 'No data to update');
    }

    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const query = `
        UPDATE users 
        SET ${setClause}, "updatedAt" = NOW() 
        WHERE id = $1 
        RETURNING id, name, email, phone, role
    `;

    const result = await pool.query(query, [id, ...values]);

    if (result.rowCount === 0) {
        throw new AppError(404, 'User not found');
    }

    return result.rows[0];
};

const deleteUser = async (id: number) => {
    const activeBooking = await pool.query(
        `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
        [id]
    );

    if (activeBooking.rowCount && activeBooking.rowCount > 0) {
        throw new AppError(400, 'Cannot delete user with active bookings!');
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, role', [id]);

    if (result.rowCount === 0) {
        throw new AppError(404, 'User not found');
    }

    return result.rows[0];
};

export const UserService = {
    getAllUsers,
    updateUser,
    deleteUser,
};
