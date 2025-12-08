import { type IReleaseRepository } from '../../ports/repositories/IReleaseRepository.js';

export class GetReleasesUseCase {
  constructor(private readonly releaseRepository: IReleaseRepository) {}

  async execute() {
    return this.releaseRepository.findAll();
  }
}
