import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { VehicleService } from './vehicle.service';

const createVehicle = catchAsync(async (req: Request, res: Response) => {
    const result = await VehicleService.createVehicle(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Vehicle created successfully',
        data: result,
    });
});

const getAllVehicles = catchAsync(async (req: Request, res: Response) => {
    const result = await VehicleService.getAllVehicles();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.length === 0 ? 'No vehicles found' : 'Vehicles retrieved successfully',
        data: result,
    });
});

const getVehicleById = catchAsync(async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const result = await VehicleService.getVehicleById(Number(vehicleId));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Vehicle retrieved successfully',
        data: result,
    });
});

const updateVehicle = catchAsync(async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const result = await VehicleService.updateVehicle(Number(vehicleId), req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Vehicle updated successfully',
        data: result,
    });
});

const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    await VehicleService.deleteVehicle(Number(vehicleId));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Vehicle deleted successfully',
    });
});

export const VehicleController = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
};
