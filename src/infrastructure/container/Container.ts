import { Pool } from 'pg';
import { pool } from '@infrastructure/database/connection';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { GetUserProfileUseCase } from '@application/use-cases/user/GetUserProfileUseCase';
import { AuthController } from '@presentation/controllers/AuthController';
import { UserController } from '@presentation/controllers/UserController';

export class Container {
  private static instance: Container;

  private readonly _pool: Pool;
  private readonly _userRepository: UserRepository;

  // Use Cases
  private readonly _registerUserUseCase: RegisterUserUseCase;
  private readonly _loginUserUseCase: LoginUserUseCase;
  private readonly _refreshTokenUseCase: RefreshTokenUseCase;
  private readonly _getUserProfileUseCase: GetUserProfileUseCase;

  // Controllers
  private readonly _authController: AuthController;
  private readonly _userController: UserController;

  private constructor() {
    // Infrastructure
    this._pool = pool;
    this._userRepository = new UserRepository(this._pool);

    // Use Cases
    this._registerUserUseCase = new RegisterUserUseCase(this._userRepository);
    this._loginUserUseCase = new LoginUserUseCase(this._userRepository);
    this._refreshTokenUseCase = new RefreshTokenUseCase(this._userRepository);
    this._getUserProfileUseCase = new GetUserProfileUseCase(this._userRepository);

    // Controllers
    this._authController = new AuthController(
      this._registerUserUseCase,
      this._loginUserUseCase,
      this._refreshTokenUseCase
    );
    this._userController = new UserController(this._getUserProfileUseCase);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get userRepository() {
    return this._userRepository;
  }

  get authController() {
    return this._authController;
  }

  get userController() {
    return this._userController;
  }
}
