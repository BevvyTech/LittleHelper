import { type ISessionRepository } from '../../ports/repositories/ISessionRepository.js';

export class LogoutUserUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionToken: string): Promise<void> {
    await this.sessionRepository.deleteByToken(sessionToken);
  }
}
