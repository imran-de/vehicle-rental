import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await UserService.updateUser(Number(userId), req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await UserService.deleteUser(Number(userId));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
    });
});

export const UserController = {
    getAllUsers,
    updateUser,
    deleteUser,
};
