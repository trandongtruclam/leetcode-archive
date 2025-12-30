"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { title } from "@/components/primitives";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

interface Submission {
  id: string;
  submissionId: string;
  username: string;
  title: string;
  slug: string;
  timestamp: number;
  runtime: number;
  runtimeDisplay: string | null;
  memoryDisplay: string | null;
  lang: string;
  difficulty: string | null;
  topics: string[];
  runtimePercentile: number | null;
  memoryPercentile: number | null;
}

export default function SubmissionsListPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (usernameFilter) params.append("username", usernameFilter);
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      if (langFilter) params.append("lang", langFilter);

      const response = await fetch(`/api/submissions?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, search, usernameFilter, difficultyFilter, langFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDifficultyColor = (
    difficulty: string | null
  ): "success" | "warning" | "danger" | "default" => {
    if (!difficulty) return "default";
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "default";
    }
  };

  const getLangColor = (lang: string): string => {
    const colors: Record<string, string> = {
      java: "bg-orange-500",
      python: "bg-blue-500",
      cpp: "bg-purple-500",
      javascript: "bg-yellow-500",
      typescript: "bg-blue-600",
    };
    return colors[lang.toLowerCase()] || "bg-default-500";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className={title()}>Submissions Archive</h1>
        <p className="text-default-500 mt-2">
          Browse and search through all saved LeetCode submissions
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by title or username..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Input
              placeholder="Filter by username"
              value={usernameFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUsernameFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              placeholder="Difficulty"
              selectedKeys={difficultyFilter ? [difficultyFilter] : []}
              onSelectionChange={(keys: any) => {
                const value = Array.from(keys)[0] as string;
                setDifficultyFilter(value || "");
                setPage(1);
              }}
            >
              <SelectItem key="Easy">Easy</SelectItem>
              <SelectItem key="Medium">Medium</SelectItem>
              <SelectItem key="Hard">Hard</SelectItem>
            </Select>
            <Select
              placeholder="Language"
              selectedKeys={langFilter ? [langFilter] : []}
              onSelectionChange={(keys: any) => {
                const value = Array.from(keys)[0] as string;
                setLangFilter(value || "");
                setPage(1);
              }}
            >
              <SelectItem key="java">Java</SelectItem>
              <SelectItem key="python">Python</SelectItem>
              <SelectItem key="cpp">C++</SelectItem>
              <SelectItem key="javascript">JavaScript</SelectItem>
              <SelectItem key="typescript">TypeScript</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-default-500">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {submissions.length}
          </span>{" "}
          of <span className="font-semibold text-foreground">{total}</span>{" "}
          submissions
        </p>
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-200"></div>
                </Skeleton>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-default-500 text-lg">No submissions found</p>
            <p className="text-default-400 text-sm mt-2">
              Try adjusting your filters or fetch some submissions first
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                isPressable
                className="hover:scale-[1.01] transition-transform"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-2">
                            <a
                              href={`https://leetcode.com/problems/${submission.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
                            >
                              {submission.title}
                            </a>
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {submission.difficulty && (
                              <Chip
                                size="sm"
                                color={getDifficultyColor(
                                  submission.difficulty
                                )}
                                variant="solid"
                              >
                                {submission.difficulty}
                              </Chip>
                            )}
                            <Chip
                              size="sm"
                              variant="flat"
                              className={getLangColor(submission.lang)}
                            >
                              {submission.lang}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-default-500 mb-3 flex-wrap">
                        <span className="font-medium text-default-700">
                          @{submission.username}
                        </span>
                        <span>•</span>
                        <span>{formatDate(submission.timestamp)}</span>
                        {submission.runtimeDisplay && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-default-700">
                              ⚡ {submission.runtimeDisplay}
                            </span>
                          </>
                        )}
                        {submission.memoryDisplay && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-default-700">
                              💾 {submission.memoryDisplay}
                            </span>
                          </>
                        )}
                        {submission.runtimePercentile !== null && (
                          <>
                            <span>•</span>
                            <span className="text-success">
                              📊 {submission.runtimePercentile.toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>

                      {submission.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {submission.topics.map((topic, idx) => (
                            <Chip
                              key={idx}
                              size="sm"
                              variant="flat"
                              className="text-default-600"
                            >
                              {topic}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        as={Link}
                        href={`/submissions/${submission.id}`}
                        color="primary"
                        variant="solid"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button
                        as="a"
                        href={`https://leetcode.com/submissions/detail/${submission.submissionId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="default"
                        variant="bordered"
                        size="sm"
                      >
                        LeetCode
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="mt-8">
              <CardBody>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="flat"
                  >
                    Previous
                  </Button>
                  <span className="text-default-600">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="flat"
                  >
                    Next
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
