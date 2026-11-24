import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin";
import AdminLoginForm from "./form";

export const metadata = { title: "Admin - Entrar" };
export default async function Page() {
  if (await isAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}
