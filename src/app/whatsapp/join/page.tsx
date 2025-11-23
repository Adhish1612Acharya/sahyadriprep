"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Users, ShieldCheck } from "lucide-react";

export default function WhatsappJoinPage() {
  const [loading, setLoading] = useState(false);

  const handleJoinWhatsapp = () => {
    setLoading(true);
    window.open("https://chat.whatsapp.com/HtZFz8GepZf9rzCDhl8vuI?mode=wwt", "_blank");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8fafc] via-[#f3f4f6] to-white dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155] p-4">
      <Card className="w-full max-w-md shadow-lg border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center shadow">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Join SahyadriPrep Updates Group
          </CardTitle>
          <CardDescription className="mt-2 text-green-700/80">
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" /> 500+ students
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Safe & Verified
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-center text-muted-foreground">
            <p>📢 For Updates & New Features</p>
            <p className="mt-2">
              Join the official SahyadriPrep Updates Group to get:
            </p>
            <ul className="mt-4 text-left text-sm list-disc list-inside text-green-700/80">
              <li>New feature announcements</li>
              <li>Important interview tips</li>
              <li>Latest senior interview experiences</li>
              <li>Platform improvements & updates</li>
            </ul>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
            onClick={handleJoinWhatsapp}
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Join WhatsApp Group
              </>
            )}
          </Button>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Only verified students can join. Please follow community guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
