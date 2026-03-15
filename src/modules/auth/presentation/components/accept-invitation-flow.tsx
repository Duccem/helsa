"use client";

import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

interface AcceptInvitationFlowProps {
  invitationId?: string;
  isAuthenticated: boolean;
}

export const AcceptInvitationFlow = ({ invitationId, isAuthenticated }: AcceptInvitationFlowProps) => {
  const router = useRouter();

  const callbackURL = useMemo(() => {
    if (!invitationId) {
      return "/accept-invitation";
    }

    return `/accept-invitation?invitationId=${encodeURIComponent(invitationId)}`;
  }, [invitationId]);

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      if (!invitationId) {
        throw new Error("Missing invitation id.");
      }

      const { error } = await authClient.organization.acceptInvitation({ invitationId });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully.");
      router.push("/home");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to accept invitation.");
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !invitationId || isPending || isSuccess) {
      return;
    }

    mutate();
  }, [invitationId, isAuthenticated, isPending, isSuccess, mutate]);

  if (!invitationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Invalid invitation link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This invitation link is missing the invitation identifier. Please request a new invitation.
          </p>
          <Link href="/sign-in" className="text-sm text-indigo-500 hover:underline">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accept organization invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You need to sign in or create an account first. After authentication, you will be redirected back to accept
            this invitation.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild className="w-full">
              <Link href={`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`}>
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`}>
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accepting invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing your invitation...
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Invitation accepted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Redirecting you to your dashboard...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept organization invitation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We could not accept the invitation automatically. Click the button below to try again.
        </p>
        {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
        <Button onClick={() => mutate()} className="w-full">
          Accept invitation
        </Button>
      </CardContent>
    </Card>
  );
};
