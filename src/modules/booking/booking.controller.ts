import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await BookingService.createBooking(userId, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Booking created successfully',
        data: result,
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await BookingService.getAllBookings(userId, role);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Bookings retrieved successfully',
        data: result,
    });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await BookingService.updateBooking(Number(bookingId), userId, role, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking updated successfully',
        data: result,
    });
});

export const BookingController = {
    createBooking,
    getAllBookings,
    updateBooking,
};
