"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { title } from "@/components/primitives";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";

interface Submission {
  id: string;
  submissionId: string;
  username: string;
  title: string;
  slug: string;
  timestamp: number;
  runtime: number;
  runtimeDisplay: string | null;
  runtimePercentile: number | null;
  memory: bigint | string | null;
  memoryDisplay: string | null;
  memoryPercentile: number | null;
  lang: string;
  difficulty: string | null;
  topics: string[];
  code: string;
  questionId: string | null;
  totalCorrect: number | null;
  totalTestcases: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      const id =
        typeof params.id === "string"
          ? params.id
          : Array.isArray(params.id)
            ? params.id[0]
            : null;
      if (!id) {
        setError("Invalid submission ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/submissions/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Convert BigInt to string for display
          const sub = data.data;
          if (sub.memory && typeof sub.memory === "bigint") {
            sub.memory = sub.memory.toString();
          }
          setSubmission(sub);
        } else {
          setError(data.error || "Failed to fetch submission");
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching submission"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="rounded-lg mb-6">
          <div className="h-12 w-3/4 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Card>
          <CardBody>
            <Skeleton className="rounded-lg">
              <div className="h-64 rounded-lg bg-default-200"></div>
            </Skeleton>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-danger">
          <CardBody>
            <div className="text-danger text-center py-8">
              <p className="text-lg font-semibold mb-2">
                {error || "Submission not found"}
              </p>
              <Link href="/submissions/list">
                <Button color="primary" variant="flat" className="mt-4">
                  Back to Submissions List
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/submissions/list">
          <Button variant="light" className="mb-4">
            ← Back to List
          </Button>
        </Link>
        <h1 className={title()}>{submission.title}</h1>
        <p className="text-default-500 mt-2">
          Submission details and solution code
        </p>
      </div>

      {/* Metadata */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            {submission.difficulty && (
              <Chip
                size="lg"
                color={getDifficultyColor(submission.difficulty)}
                variant="solid"
              >
                {submission.difficulty}
              </Chip>
            )}
            <Chip
              size="lg"
              variant="flat"
              className={getLangColor(submission.lang)}
            >
              {submission.lang}
            </Chip>
            <div className="text-sm text-default-500">
              @{submission.username} • {formatDate(submission.timestamp)}
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {submission.runtimeDisplay && (
              <div className="p-4 bg-default-100 rounded-lg">
                <div className="text-xs text-default-500 mb-1">Runtime</div>
                <div className="text-2xl font-bold text-foreground">
                  {submission.runtimeDisplay}
                </div>
                {submission.runtimePercentile !== null && (
                  <div className="text-xs text-success mt-1">
                    📊 {submission.runtimePercentile.toFixed(1)}% percentile
                  </div>
                )}
              </div>
            )}
            {submission.memoryDisplay && (
              <div className="p-4 bg-default-100 rounded-lg">
                <div className="text-xs text-default-500 mb-1">Memory</div>
                <div className="text-2xl font-bold text-foreground">
                  {submission.memoryDisplay}
                </div>
                {submission.memoryPercentile !== null && (
                  <div className="text-xs text-success mt-1">
                    📊 {submission.memoryPercentile.toFixed(1)}% percentile
                  </div>
                )}
              </div>
            )}
            {submission.totalCorrect !== null &&
              submission.totalTestcases !== null && (
                <div className="p-4 bg-default-100 rounded-lg">
                  <div className="text-xs text-default-500 mb-1">
                    Test Cases
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {submission.totalCorrect}/{submission.totalTestcases}
                  </div>
                  <div className="text-xs text-success mt-1">✅ All passed</div>
                </div>
              )}
            <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <div className="text-xs text-default-500 mb-1">Status</div>
              <div className="text-2xl font-bold text-success">Accepted</div>
            </div>
          </div>

          {/* Topics */}
          {submission.topics.length > 0 && (
            <div className="mt-6">
              <div className="text-sm text-default-500 mb-3 font-medium">
                Topics:
              </div>
              <div className="flex flex-wrap gap-2">
                {submission.topics.map((topic, idx) => (
                  <Chip key={idx} size="sm" variant="flat">
                    {topic}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="mt-6 flex gap-2 flex-wrap">
            <Button
              as="a"
              href={`https://leetcode.com/problems/${submission.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="solid"
            >
              View Problem on LeetCode
            </Button>
            <Button
              as="a"
              href={`https://leetcode.com/submissions/detail/${submission.submissionId}/`}
              target="_blank"
              rel="noopener noreferrer"
              color="default"
              variant="bordered"
            >
              View Submission on LeetCode
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Code */}
      <Card className="bg-content1">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Solution Code</h2>
          {submission.code && (
            <Button
              size="sm"
              variant="flat"
              onClick={() => {
                if (submission.code) {
                  navigator.clipboard.writeText(submission.code);
                }
              }}
            >
              Copy Code
            </Button>
          )}
        </CardHeader>
        <CardBody className="pt-0">
          {submission.code ? (
            <div className="bg-default-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-default-100 font-mono">
                <code>{submission.code}</code>
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-default-400">
              <p className="italic">
                Code not available. This submission was saved without cookies
                configured.
              </p>
              <p className="text-sm mt-2">
                Please configure LEETCODE_SESSION and LEETCODE_CSRFTOKEN in
                .env.local to fetch code.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
