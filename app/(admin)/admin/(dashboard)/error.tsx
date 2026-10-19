"use client";

import { useEffect } from "react";
import { TbAlertTriangle, TbRefresh } from "react-icons/tb";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/admin/ui/card";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <Card className="mx-auto mt-8 w-full max-w-md">
      <CardHeader>
        <span className="bg-negative-soft text-negative mb-2 grid size-10 place-items-center rounded-full">
          <TbAlertTriangle aria-hidden="true" className="size-5" />
        </span>
        <CardTitle className="font-display text-lg">That didn&apos;t load</CardTitle>
        <CardDescription>
          Usually Supabase being slow or an env var missing on the server. Try again, and if it sticks, check the
          server logs{error.digest ? ` for ${error.digest}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Button onClick={reset}>
          <TbRefresh aria-hidden="true" />
          Try again
        </Button>
      </CardFooter>
    </Card>
  );
}
