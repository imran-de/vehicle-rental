import express from 'express';
import auth from '../../middlewares/auth';
import { VehicleController } from './vehicle.controller';

const router = express.Router();

router.post(
    '/',
    auth('admin'),
    VehicleController.createVehicle,
);

router.get('/', VehicleController.getAllVehicles);

router.get('/:vehicleId', VehicleController.getVehicleById);

router.put(
    '/:vehicleId',
    auth('admin'),
    VehicleController.updateVehicle,
);

router.delete('/:vehicleId', auth('admin'), VehicleController.deleteVehicle);

export const VehicleRoutes = router;
