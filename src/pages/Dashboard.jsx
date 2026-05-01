import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import MemberDashboard from "@/components/dashboard/MemberDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AdminDashboard user={user} /> : <MemberDashboard user={user} />;
}
