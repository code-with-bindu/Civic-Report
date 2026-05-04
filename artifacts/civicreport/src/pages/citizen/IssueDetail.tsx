import { useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  useGetIssue,
  useConfirmIssue,
  useAddIssueNote,
  getGetIssueQueryKey,
  getListIssuesQueryKey,
} from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { IssueStatusBadge } from "@/components/ui/IssueStatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  ThumbsUp,
  ShieldAlert,
  MessageSquare,
  ShieldCheck,
  FileText,
  ChevronRight,
  Share2,
  CalendarClock,
  Bell,
  BellOff,
  Users,
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

async function apiPost(path: string, token: string | null) {
  const res = await fetch(path, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function IssueDetail() {
  const [, params] = useRoute("/citizen/issues/:id");
  const id = params?.id || "";

  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issue, isLoading } = useGetIssue(id, {
    query: { enabled: !!id, queryKey: getGetIssueQueryKey(id) },
  });
  const confirmMut = useConfirmIssue();
  const addNoteMut = useAddIssueNote();

  const [note, setNote] = useState("");

  const subscribeMut = useMutation({
    mutationFn: () => apiPost(`/api/issues/${id}/subscribe`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetIssueQueryKey(id) });
      toast({ title: "Subscribed", description: "You'll get real-time updates on this issue." });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const unsubscribeMut = useMutation({
    mutationFn: () => apiPost(`/api/issues/${id}/unsubscribe`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetIssueQueryKey(id) });
      toast({ title: "Unsubscribed", description: "You won't receive further updates." });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const handleConfirm = async () => {
    try {
      await confirmMut.mutateAsync({ id });
      toast({
        title: "Issue Confirmed",
        description: "Thank you for verifying this issue.",
      });
      queryClient.invalidateQueries({ queryKey: getGetIssueQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await addNoteMut.mutateAsync({ id, data: { note } });
      setNote("");
      toast({ title: "Note added" });
      queryClient.invalidateQueries({ queryKey: getGetIssueQueryKey(id) });
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: issue?.title ?? "CivicReport Issue",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Share it with your community.",
        });
      }
    } catch {
      // user cancelled
    }
  };

  const isSubscribed = issue?.isSubscribed ?? false;
  const isFollowPending = subscribeMut.isPending || unsubscribeMut.isPending;

  const toggleFollow = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please log in to follow this issue.", variant: "destructive" });
      return;
    }
    if (isSubscribed) {
      unsubscribeMut.mutate();
    } else {
      subscribeMut.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Issue not found</h2>
      </div>
    );
  }

  const isReporter = user?.id === issue.reporterId;
  const canConfirm =
    user?.role === "citizen" &&
    !isReporter &&
    issue.status !== "resolved" &&
    issue.status !== "rejected";

  const deadlineInfo = (() => {
    if (!issue.deadline) return null;
    const days = differenceInDays(new Date(issue.deadline), new Date());
    if (issue.status === "resolved")
      return { label: "Resolved on time", color: "text-green-600", icon: ShieldCheck };
    if (days < 0)
      return {
        label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`,
        color: "text-destructive",
        icon: ShieldAlert,
      };
    return {
      label: `${days} day${days === 1 ? "" : "s"} remaining`,
      color: days <= 2 ? "text-amber-600" : "text-foreground",
      icon: CalendarClock,
    };
  })();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {issue.photoUrl ? (
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-muted mb-6 relative shadow-md">
                <img
                  src={issue.photoUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
                {issue.urgent && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-destructive/20 animate-pulse">
                    <ShieldAlert className="w-4 h-4" /> Urgent Hazard
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-40 rounded-2xl bg-muted mb-6 flex items-center justify-center relative shadow-sm border border-border/50">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <IssueStatusBadge status={issue.status} />
              <span className="text-sm font-medium px-3 py-1 bg-secondary/10 text-secondary rounded-full">
                {issue.category}
              </span>
              <span className="text-sm text-muted-foreground ml-auto flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(issue.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {issue.title}
              </h1>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={isSubscribed ? "default" : "outline"}
                  onClick={toggleFollow}
                  disabled={isFollowPending}
                  title={isSubscribed ? "Unsubscribe from updates" : "Subscribe to updates"}
                  className="gap-1.5"
                >
                  {isSubscribed ? (
                    <BellOff className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline text-xs">
                    {isSubscribed ? "Following" : "Follow"}
                  </span>
                  {(issue.subscriberCount ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-xs opacity-70">
                      <Users className="w-3 h-3" />
                      {issue.subscriberCount}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground mb-6 bg-muted/30 p-4 rounded-xl">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{issue.address}</p>
                {issue.city && (
                  <p className="text-sm">
                    {issue.city}{" "}
                    {issue.constituency ? `• ${issue.constituency}` : ""}
                  </p>
                )}
              </div>
            </div>

            {issue.description && (
              <div className="prose prose-sm sm:prose max-w-none text-muted-foreground mb-8">
                <p className="whitespace-pre-wrap">{issue.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white border rounded-full px-4 py-2 w-fit shadow-sm">
              <span>Reported by:</span>
              <strong className="text-foreground">
                {issue.anonymous
                  ? "Anonymous Citizen"
                  : issue.reporterName || "Unknown"}
              </strong>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Status Timeline
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {issue.timeline.map((event, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <IssueStatusBadge status={event.status as any} />
                      <time className="text-xs text-muted-foreground">
                        {format(new Date(event.at), "MMM d, yyyy h:mm a")}
                      </time>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {deadlineInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <deadlineInfo.icon
                      className={`w-5 h-5 ${deadlineInfo.color}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      Expected Resolution
                    </p>
                    <p className={`font-bold ${deadlineInfo.color}`}>
                      {deadlineInfo.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due{" "}
                      {format(new Date(issue.deadline as string), "MMM d, yyyy")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Community Verification
                </CardTitle>
                <CardDescription>
                  Issues need community confirmation to ensure authenticity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-muted-foreground">
                      Authenticity Score
                    </span>
                    <span className="font-bold text-primary">
                      {issue.authenticityScore}%
                    </span>
                  </div>
                  <Progress value={issue.authenticityScore} className="h-2" />
                </div>

                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">
                      {issue.confirmations} Confirmations
                    </span>
                  </div>
                </div>

                {canConfirm && (
                  <Button
                    className="w-full shadow-md"
                    size="lg"
                    onClick={handleConfirm}
                    disabled={confirmMut.isPending}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {confirmMut.isPending
                      ? "Confirming..."
                      : "I confirm this issue"}
                  </Button>
                )}
                {isReporter && (
                  <p className="text-xs text-center text-muted-foreground italic">
                    You cannot verify your own report.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Official Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issue.notes && issue.notes.length > 0 ? (
                  <div className="space-y-4">
                    {issue.notes.map((n, i) => (
                      <div
                        key={i}
                        className="bg-muted/30 p-3 rounded-xl border border-border/50"
                      >
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-semibold text-foreground">
                            {n.by}
                          </span>
                          <span className="text-muted-foreground">
                            {format(new Date(n.at), "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{n.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">
                    No official notes yet.
                  </p>
                )}

                {user?.role === "government" && (
                  <div className="pt-4 border-t border-border/50 mt-4 space-y-3">
                    <Textarea
                      placeholder="Add an official update..."
                      className="min-h-[80px] text-sm"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleAddNote}
                      disabled={addNoteMut.isPending || !note.trim()}
                    >
                      Add Note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
