import prisma from '@/lib/core/prisma'

export const trackedUserRepo = {
  findByUsername(username: string) {
    return prisma.trackedUser.findUnique({
      where: { username },
    })
  },

  create(username: string) {
    return prisma.trackedUser.create({
      data: {
        username,
        enabled: true,
      },
    })
  },

  updateLastFetched(id: string) {
    return prisma.trackedUser.update({
      where: { id },
      data: { lastFetched: new Date() },
    })
  },
}
