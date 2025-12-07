import express from 'express';
import auth from '../../middlewares/auth';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post(
    '/',
    auth('customer'),
    BookingController.createBooking,
);

router.get('/', auth('admin', 'customer'), BookingController.getAllBookings);

router.put(
    '/:bookingId',
    auth('admin', 'customer'),
    BookingController.updateBooking,
);

export const BookingRoutes = router;
