import { type IUserRepository } from '../../ports/repositories/IUserRepository.js';
import { type ISessionRepository } from '../../ports/repositories/ISessionRepository.js';
import { createAuthRequiredError } from '@littlehelper/shared';

export interface GetCurrentUserOutput {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
}

export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async execute(sessionToken: string): Promise<GetCurrentUserOutput> {
    const session = await this.sessionRepository.findByToken(sessionToken);

    if (!session || !session.isValid()) {
      throw createAuthRequiredError();
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user || user.isBanned()) {
      throw createAuthRequiredError();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }
}
