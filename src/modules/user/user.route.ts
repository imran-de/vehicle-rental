import express from 'express';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/', auth('admin'), UserController.getAllUsers);

router.put(
    '/:userId',
    auth('admin', 'customer'),
    UserController.updateUser,
);

router.delete('/:userId', auth('admin'), UserController.deleteUser);

export const UserRoutes = router;
