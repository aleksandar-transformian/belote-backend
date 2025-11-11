import { Router } from 'express';
import { UserController } from '@presentation/controllers/UserController';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  router.get('/profile', authMiddleware, userController.getProfile);
  router.get('/:userId', authMiddleware, userController.getPublicProfile);

  return router;
}
