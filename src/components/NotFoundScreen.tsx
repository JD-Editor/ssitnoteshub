import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export function NotFoundScreen({ message = "We couldn't find that page." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
