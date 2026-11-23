import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";

export async function requireAdmin() {
  const u = await getUser();
  if (!u) redirect("/login");
  if (u.role !== "admin") redirect("/");
  return u;
}
