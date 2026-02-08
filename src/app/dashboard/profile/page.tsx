import { getProfile } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import ProfileContent from "./profile-content";
import { Header } from "@/components/layout/header";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return <ProfileContent profile={profile} />;
}
