import { type PrismaClient } from '../prisma/index.js';
import { Release, ReleasePageSnapshot } from '../../domain/releases/index.js';
import {
  type IReleaseRepository,
  type CreateReleaseData,
  type ReleaseSnapshotData,
} from '../../application/ports/repositories/IReleaseRepository.js';

export class ReleaseRepositoryPrisma implements IReleaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateReleaseData): Promise<Release> {
    const release = await this.prisma.release.create({
      data: {
        tag: data.tag,
        name: data.name,
        description: data.description ?? null,
      },
    });
    return this.toDomain(release);
  }

  async findByTag(tag: string): Promise<Release | null> {
    const release = await this.prisma.release.findUnique({ where: { tag } });
    return release ? this.toDomain(release) : null;
  }

  async findAll(): Promise<Release[]> {
    const releases = await this.prisma.release.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return releases.map((r) => this.toDomain(r));
  }

  async delete(tag: string): Promise<void> {
    await this.prisma.release.delete({ where: { tag } });
  }

  async createSnapshot(
    releaseId: string,
    snapshots: ReleaseSnapshotData[]
  ): Promise<ReleasePageSnapshot[]> {
    const created = await this.prisma.$transaction(
      snapshots.map((snap) =>
        this.prisma.releasePageSnapshot.create({
          data: {
            releaseId,
            pageLocaleId: snap.pageLocaleId,
            slugAtRelease: snap.slugAtRelease,
            titleAtRelease: snap.titleAtRelease,
          },
        })
      )
    );

    return created.map((s) => this.toSnapshotDomain(s));
  }

  async getSnapshotByRelease(releaseId: string): Promise<ReleasePageSnapshot[]> {
    const snapshots = await this.prisma.releasePageSnapshot.findMany({
      where: { releaseId },
    });
    return snapshots.map((s) => this.toSnapshotDomain(s));
  }

  private toDomain(release: NonNullable<Awaited<ReturnType<PrismaClient['release']['findUnique']>>>): Release {
    return new Release({
      id: release.id,
      tag: release.tag,
      name: release.name,
      description: release.description,
      createdAt: release.createdAt,
    });
  }

  private toSnapshotDomain(
    snapshot: NonNullable<Awaited<ReturnType<PrismaClient['releasePageSnapshot']['findFirst']>>>
  ): ReleasePageSnapshot {
    return new ReleasePageSnapshot({
      id: snapshot.id,
      releaseId: snapshot.releaseId,
      pageLocaleId: snapshot.pageLocaleId,
      slugAtRelease: snapshot.slugAtRelease,
      titleAtRelease: snapshot.titleAtRelease,
    });
  }
}
