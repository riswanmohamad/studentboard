import Link from "next/link";
import { BookOpen, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">StudentBoard</h1>
        <p className="text-muted-foreground text-center text-lg mb-8">
          Study smarter. Pass your exams.
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Exam-ready boards</p>
              <p className="text-xs text-muted-foreground">
                Pre-built study plans for every subject
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Small daily tasks</p>
              <p className="text-xs text-muted-foreground">
                Break big topics into bite-sized steps
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Track your progress</p>
              <p className="text-xs text-muted-foreground">
                See how close you are to being exam-ready
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button asChild className="w-full h-12 text-base" size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 text-base" size="lg">
            <Link href="/auth/login">I already have an account</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground">
        <p>&copy; 2026 StudentBoard. All rights reserved.</p>
      </div>
    </div>
  );
}
