"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trackEvent, EVENTS } from "@/lib/posthog";
import type { Subject } from "@/lib/types";
import Link from "next/link";

const GRADES = [
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11" },
];

export default function CreateBoardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (grade) {
      loadSubjects(parseInt(grade));
    }
  }, [grade]);

  async function loadSubjects(gradeNum: number) {
    const supabase = createClient();
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("grade", gradeNum)
      .eq("country", "LK")
      .order("display_order", { ascending: true });

    setSubjects(data || []);
    setSelectedSubject(null);
  }

  async function handleCreate() {
    if (!selectedSubject || !grade) return;
    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/boards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: parseInt(grade),
          subject_id: selectedSubject.id,
          name: `G${grade} ${selectedSubject.name}`,
          show_weekly: showWeekly,
          show_monthly: showMonthly,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create board");
        return;
      }

      trackEvent(EVENTS.BOARD_CREATED, {
        grade: parseInt(grade),
        subject: selectedSubject.name,
      });

      router.push(`/dashboard/boards/${result.board.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Header title="Create Board" showLogo={false} />
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-lg mx-auto">
          <Link
            href="/dashboard/boards"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

        {/* Step 1: Select Grade */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                1
              </span>
              Select Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={grade}
              onValueChange={(v) => {
                setGrade(v);
                setStep(2);
                trackEvent(EVENTS.GRADE_SELECTED, { grade: v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Step 2: Select Subject */}
        {step >= 2 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  2
                </span>
                Select Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Loading subjects...
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject.id}
                      variant={
                        selectedSubject?.id === subject.id
                          ? "default"
                          : "outline"
                      }
                      className="h-auto py-3 px-3 text-sm"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setStep(3);
                        trackEvent(EVENTS.SUBJECT_SELECTED, {
                          subject: subject.name,
                        });
                      }}
                    >
                      {subject.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Options */}
        {step >= 3 && selectedSubject && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  3
                </span>
                Planning Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Weekly Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Plan items for each week
                  </p>
                </div>
                <Switch
                  checked={showWeekly}
                  onCheckedChange={setShowWeekly}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Monthly Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Plan items for each month
                  </p>
                </div>
                <Switch
                  checked={showMonthly}
                  onCheckedChange={setShowMonthly}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {step >= 3 && selectedSubject && (
          <div className="space-y-3">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full h-12 text-base gap-2"
              size="lg"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating board...
                </>
              ) : (
                `Create G${grade} ${selectedSubject.name} Board`
              )}
            </Button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
