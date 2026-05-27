import { redirect } from "next/navigation";

export default function RegistroClientePage() {
  redirect("/login?tab=cliente");
}
