import { type IUserRepository } from '../../ports/repositories/IUserRepository.js';
import { type ISessionRepository } from '../../ports/repositories/ISessionRepository.js';
import { type IOAuthGateway } from '../../ports/gateways/IOAuthGateway.js';
import { Session } from '../../../domain/users/Session.js';
import { createForbiddenError } from '@littlehelper/shared';

export interface AuthenticateUserInput {
  code: string;
}

export interface AuthenticateUserOutput {
  sessionToken: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: 'USER' | 'ADMIN';
  };
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly oauthGateway: IOAuthGateway
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const accessToken = await this.oauthGateway.exchangeCodeForToken(input.code);
    const userInfo = await this.oauthGateway.getUserInfo(accessToken);

    let user = await this.userRepository.findByEmail(userInfo.email);

    if (user) {
      if (user.isBanned()) {
        throw createForbiddenError();
      }

      user = await this.userRepository.update(user.id, {
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        lastLogin: new Date(),
      });
    } else {
      user = await this.userRepository.create({
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
      });
    }

    const token = Session.generateToken();
    const expiresAt = Session.createExpiryDate(7);

    await this.sessionRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });

    return {
      sessionToken: token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }
}
