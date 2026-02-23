import { redirect } from "next/navigation";

/**
 * Root route: redirect to main Residents page.
 */
export default function Home() {
  redirect("/residents");
}
