"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/actions/auth";

interface ProfileContentProps {
  profile: {
    email: string;
    username: string | null;
    full_name: string | null;
  };
}

export default function ProfileContent({ profile }: ProfileContentProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header title="Profile" />
      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {profile.full_name || profile.username || "Student"}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    @{profile.username || "—"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {profile.email}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>StudentBoard v0.1.0</p>
            <p className="mt-1">Study smarter. Pass your exams.</p>
          </div>
        </div>
      </div>
    </>
  );
}
