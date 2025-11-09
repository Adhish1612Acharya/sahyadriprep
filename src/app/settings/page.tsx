"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and security
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <section className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Change password</h3>
              <p className="text-sm text-muted-foreground">
                Update your account password to keep your account secure.
              </p>
            </div>

            <div>
              <Button asChild>
                <Link
                  href="/auth/change-password"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Link>
              </Button>
            </div>
          </section>

          {/* Future settings can be added here */}
        </CardContent>
      </Card>
    </div>
  );
}
