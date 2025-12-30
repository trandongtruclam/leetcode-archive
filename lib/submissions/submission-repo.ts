import prisma from "@/lib/core/prisma";

export interface FindSubmissionsParams {
  username?: string;
  difficulty?: string;
  lang?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const submissionRepo = {
  findByUsernameAndSubmissionId(username: string, submissionId: string) {
    return prisma.submission.findUnique({
      where: {
        username_submissionId: {
          username,
          submissionId,
        },
      },
    });
  },

  findById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
    });
  },

  create(data: Parameters<typeof prisma.submission.create>[0]["data"]) {
    return prisma.submission.create({ data });
  },

  async findMany(params: FindSubmissionsParams = {}) {
    const { username, difficulty, lang, search, page = 1, limit = 20 } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (username) {
      where.username = { contains: username, mode: "insensitive" };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (lang) {
      where.lang = lang;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          submissionId: true,
          username: true,
          title: true,
          slug: true,
          timestamp: true,
          runtime: true,
          runtimeDisplay: true,
          memoryDisplay: true,
          lang: true,
          difficulty: true,
          topics: true,
          runtimePercentile: true,
          memoryPercentile: true,
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      submissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
