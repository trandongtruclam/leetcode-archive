import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedProblems() {
  await prisma.problem.deleteMany();

  const problems = await prisma.problem.createMany({
    data: [
      {
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        content:
          "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
        tags: ["array", "hash-table"],
      },
      {
        slug: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        content:
          "Given a string s, find the length of the longest substring without repeating characters.",
        tags: ["string", "sliding-window", "hash-table"],
      },
      {
        slug: "median-of-two-sorted-arrays",
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        content:
          "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        tags: ["array", "binary-search", "divide-and-conquer"],
      },
      {
        slug: "regular-expression-matching",
        title: "Regular Expression Matching",
        difficulty: "Hard",
        content:
          "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
        tags: ["string", "dynamic-programming", "recursion"],
      },
      {
        slug: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        content:
          "You are given an integer array height of length n. There are n vertical lines drawn at coordinates (i, height[i]). Find two lines that together with the x-axis form a container that can hold the most water.",
        tags: ["array", "two-pointers", "greedy"],
      },
    ],
  });
  console.log(`Seeded ${problems.count} problems`);
}

export async function main() {
  await seedProblems();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect;
  });
