import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to inventory page
  redirect("/inventory");
}

