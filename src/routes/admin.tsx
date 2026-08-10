import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Access | SSIT Study Hub" },
      {
        name: "description",
        content: "Admin access for uploading textbook PDFs, practicals and PYQs to SSIT Study Hub.",
      },
      { property: "og:title", content: "Admin Access | SSIT Study Hub" },
      { property: "og:description", content: "Unlock upload controls for SSIT Study Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, signIn, signOut } = useAdmin();
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="glass-card rounded-3xl p-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-black text-foreground">Admin access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload controls are hidden for students. Enter the admin code to enable uploads on this
            device.
          </p>

          {isAdmin ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                Admin mode is active — Upload PDF buttons are visible across the site.
              </p>
              <Button variant="outline" className="w-full rounded-full" onClick={signOut}>
                Turn off admin mode
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Label htmlFor="code">Admin code</Label>
              <Input
                id="code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter admin code"
              />
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  if (signIn(code)) toast.success("Admin mode enabled.");
                  else toast.error("Incorrect admin code.");
                  setCode("");
                }}
              >
                Unlock uploads
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
