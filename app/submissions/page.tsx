"use client";

import { useState } from "react";
import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from "next/link";

export default function SubmissionsPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/submissions/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.results);
      } else {
        setError(data.error || "Failed to fetch submissions");
      }
    } catch (err) {
      setError("An error occurred while fetching submissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className={title()}>Fetch LeetCode Submissions</h1>
        <p className={subtitle({ class: "mt-2" })}>
          Enter a LeetCode username to fetch and archive their accepted
          submissions
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Fetch Submissions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter LeetCode username (e.g., username123)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleFetch()}
              disabled={loading}
              size="lg"
              classNames={{
                input: "text-lg",
              }}
            />
            <Button
              color="primary"
              onClick={handleFetch}
              isLoading={loading}
              disabled={loading || !username.trim()}
              size="lg"
            >
              {loading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card className="mb-6 border-danger">
          <CardBody>
            <div className="text-danger">{error}</div>
          </CardBody>
        </Card>
      )}

      {result && (
        <Card className="border-success">
          <CardHeader>
            <h2 className="text-xl font-semibold">Fetch Results</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="p-4 text-center rounded-lg bg-success-50 dark:bg-success-900/20">
                <div className="mb-1 text-3xl font-bold text-success">
                  {result.saved}
                </div>
                <div className="text-sm text-default-500">Saved</div>
              </div>
              <div className="p-4 text-center rounded-lg bg-warning-50 dark:bg-warning-900/20">
                <div className="mb-1 text-3xl font-bold text-warning">
                  {result.skipped}
                </div>
                <div className="text-sm text-default-500">Skipped</div>
              </div>
              <div className="p-4 text-center rounded-lg bg-danger-50 dark:bg-danger-900/20">
                <div className="mb-1 text-3xl font-bold text-danger">
                  {result.errors}
                </div>
                <div className="text-sm text-default-500">Errors</div>
              </div>
            </div>

            {result.errors > 0 && result.errorDetails?.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-3 font-semibold text-default-700">
                  Error Details:
                </h3>
                <div className="space-y-2 overflow-y-auto text-sm max-h-40">
                  {result.errorDetails
                    .slice(0, 5)
                    .map((err: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 text-xs rounded bg-danger-50 dark:bg-danger-900/20 text-danger"
                      >
                        <span className="font-mono">{err.submissionId}</span>:{" "}
                        {err.error}
                      </div>
                    ))}
                  {result.errorDetails.length > 5 && (
                    <div className="py-2 text-xs text-center text-default-400">
                      ... and {result.errorDetails.length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                as={Link}
                href="/submissions/list"
                color="primary"
                variant="flat"
                fullWidth
              >
                View All Submissions →
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
