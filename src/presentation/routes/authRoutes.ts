import { Router } from 'express';
import { AuthController } from '@presentation/controllers/AuthController';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);

  return router;
}
