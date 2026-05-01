import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useListIssues,
  useGetGovernmentStats,
  useUpdateIssueStatus,
  useAddIssueNote,
  getListIssuesQueryKey,
  getGetGovernmentStatsQueryKey,
  Issue,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueStatusBadge } from "@/components/ui/IssueStatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Download,
  Flame,
  CheckCircle2,
  ShieldX,
  ThumbsUp,
  TrendingUp,
  Timer,
  Target,
  Zap,
  Activity,
} from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { IssueCard } from "@/components/ui/IssueCard";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a855f7",
  "#ef4444",
  "#10b981",
];

const CATEGORIES = [
  "all",
  "Pothole",
  "Water Logging",
  "Streetlight",
  "Graffiti",
  "Garbage",
  "Safety",
  "Other",
];

type SortKey = "newest" | "oldest" | "deadline" | "urgent" | "confirmations";

export default function GovDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const [updateStatus, setUpdateStatus] = useState<
    "in_progress" | "resolved" | "rejected"
  >("in_progress");
  const [updateNote, setUpdateNote] = useState("");
  const [updateDeadline, setUpdateDeadline] = useState("");

  const { data: issues, isLoading: loadingIssues } = useListIssues(
    {
      scope: "constituency",
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    {
      query: {
        queryKey: getListIssuesQueryKey({
          scope: "constituency",
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        enabled: !!user,
      },
    },
  );

  const { data: stats } = useGetGovernmentStats(
    { constituency: user?.constituency },
    {
      query: {
        queryKey: getGetGovernmentStatsQueryKey({
          constituency: user?.constituency,
        }),
        enabled: !!user,
      },
    },
  );

  const updateMut = useUpdateIssueStatus();
  const noteMut = useAddIssueNote();

  const handleUpdateStatus = async () => {
    if (!selectedIssue) return;
    try {
      await updateMut.mutateAsync({
        id: selectedIssue.id,
        data: {
          status: updateStatus,
          note: updateNote || undefined,
          deadline:
            updateStatus === "in_progress" && updateDeadline
              ? updateDeadline
              : undefined,
        },
      });
      toast({ title: "Issue updated successfully" });
      setSelectedIssue(null);
      setUpdateNote("");
      setUpdateDeadline("");
      queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getGetGovernmentStatsQueryKey(),
      });
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const quickResolve = async (issue: Issue) => {
    try {
      await updateMut.mutateAsync({
        id: issue.id,
        data: { status: "resolved", note: "Resolved by official." },
      });
      toast({ title: `Resolved: ${issue.title}` });
      queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getGetGovernmentStatsQueryKey(),
      });
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // ---- Additional KPI computations from issues list ----
  const kpiExtras = useMemo(() => {
    const list = issues ?? [];
    const resolved = list.filter((i) => i.status === "resolved");
    const inProgress = list.filter((i) => i.status === "in_progress");
    const urgentOpen = list.filter(
      (i) => i.urgent && i.status !== "resolved" && i.status !== "rejected",
    );

    // average resolution days = resolved time - createdAt time
    const resolutionTimes = resolved
      .map((i) => {
        const resolvedEvt = i.timeline.find((t) => t.status === "resolved");
        if (!resolvedEvt) return null;
        const days =
          (new Date(resolvedEvt.at).getTime() -
            new Date(i.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        return days;
      })
      .filter((d): d is number => d !== null && !Number.isNaN(d) && d >= 0);
    const avgResolutionDays = resolutionTimes.length
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // on-time = resolved before deadline (or no deadline)
    const withDeadline = resolved.filter((i) => i.deadline);
    const onTime = withDeadline.filter((i) => {
      const resolvedEvt = i.timeline.find((t) => t.status === "resolved");
      if (!resolvedEvt) return false;
      return (
        new Date(resolvedEvt.at).getTime() <=
        new Date(i.deadline as string).getTime()
      );
    });
    const onTimePct = withDeadline.length
      ? Math.round((onTime.length / withDeadline.length) * 100)
      : 100;

    // top hotspots: open verified or in_progress issues sorted by confirmations
    const hotspots = list
      .filter((i) => i.status === "verified" || i.status === "in_progress")
      .sort((a, b) => (b.confirmations ?? 0) - (a.confirmations ?? 0))
      .slice(0, 5);

    // total community engagement
    const totalConfirmations = list.reduce(
      (sum, i) => sum + (i.confirmations ?? 0),
      0,
    );

    return {
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
      onTimePct,
      urgentOpen: urgentOpen.length,
      inProgress: inProgress.length,
      hotspots,
      totalConfirmations,
    };
  }, [issues]);

  const filtered = useMemo(() => {
    let list = issues ? [...issues] : [];
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "deadline": {
          const ad = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bd = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return ad - bd;
        }
        case "urgent":
          return Number(!!b.urgent) - Number(!!a.urgent);
        case "confirmations":
          return (b.confirmations ?? 0) - (a.confirmations ?? 0);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return list;
  }, [issues, categoryFilter, search, sort]);

  const exportCsv = () => {
    if (!filtered.length) {
      toast({ title: "Nothing to export", description: "No issues match." });
      return;
    }
    const header = [
      "id",
      "title",
      "category",
      "status",
      "address",
      "createdAt",
      "deadline",
      "confirmations",
      "urgent",
      "reporter",
    ];
    const rows = filtered.map((i) =>
      [
        i.id,
        JSON.stringify(i.title),
        i.category,
        i.status,
        JSON.stringify(i.address),
        i.createdAt,
        i.deadline ?? "",
        i.confirmations ?? 0,
        i.urgent ? "yes" : "no",
        i.reporterName ?? (i.anonymous ? "anonymous" : ""),
      ].join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civicreport-issues-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== "government") {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  const resolutionRate = stats?.totalVerified
    ? Math.round((stats.totalResolved / stats.totalVerified) * 100)
    : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-muted/20">
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Official Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {user.name} • {user.constituency || "All Constituencies"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border shadow-sm">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="px-3"
              >
                <List className="w-4 h-4 mr-2" /> Table
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Verified
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {stats?.totalVerified ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Resolved
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats?.totalResolved ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  In Progress
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {kpiExtras.inProgress}
              </p>
            </CardContent>
          </Card>
          <Card
            className={`border-border/50 shadow-sm ${kpiExtras.urgentOpen ? "bg-destructive/10" : "bg-white"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame
                  className={`w-3.5 h-3.5 ${kpiExtras.urgentOpen ? "text-destructive" : "text-muted-foreground"}`}
                />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Urgent Open
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${kpiExtras.urgentOpen ? "text-destructive" : "text-foreground"}`}
              >
                {kpiExtras.urgentOpen}
              </p>
            </CardContent>
          </Card>
          <Card
            className={`border-border/50 shadow-sm ${stats?.overdue ? "bg-destructive/10" : "bg-white"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle
                  className={`w-3.5 h-3.5 ${stats?.overdue ? "text-destructive" : "text-muted-foreground"}`}
                />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Overdue
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${stats?.overdue ? "text-destructive" : "text-foreground"}`}
              >
                {stats?.overdue ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Timer className="w-3.5 h-3.5 text-purple-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Avg Days
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {kpiExtras.avgResolutionDays || "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-secondary" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  On-Time
                </p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-foreground">
                  {kpiExtras.onTimePct}%
                </p>
                {kpiExtras.onTimePct >= 80 && (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-3 mb-6">
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Citizen Confirmations
                </p>
                <p className="text-xl font-bold text-foreground">
                  {kpiExtras.totalConfirmations}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Resolution Rate
                </p>
                <p className="text-xl font-bold text-foreground">
                  {resolutionRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-6 bg-white p-3 rounded-xl border border-border/50 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, address or issue id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="verified">Newly Verified</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[170px] bg-white">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="deadline">Deadline soonest</SelectItem>
              <SelectItem value="urgent">Urgent first</SelectItem>
              <SelectItem value="confirmations">Most confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingIssues ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          viewMode === "table" ? (
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Confirms</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((issue) => {
                    const sla = issue.deadline
                      ? differenceInDays(
                          new Date(issue.deadline),
                          new Date(),
                        )
                      : null;
                    return (
                      <TableRow key={issue.id} className="bg-white">
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {issue.urgent && (
                              <Flame className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium max-w-xs truncate">
                                {issue.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {issue.category} •{" "}
                                {formatDistanceToNow(
                                  new Date(issue.createdAt),
                                  { addSuffix: true },
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <IssueStatusBadge status={issue.status} />
                            {issue.overdue && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                OVERDUE
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground max-w-[200px] truncate">
                            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                            {issue.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          {issue.deadline ? (
                            <div
                              className={`text-xs flex items-center font-medium ${
                                sla !== null && sla < 0
                                  ? "text-destructive"
                                  : sla !== null && sla <= 2
                                    ? "text-amber-600"
                                    : "text-foreground"
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {sla !== null && sla < 0
                                ? `${Math.abs(sla)}d overdue`
                                : sla === 0
                                  ? "Due today"
                                  : `${sla}d left`}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No deadline
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {issue.confirmations}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {issue.status !== "resolved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Quick resolve"
                                onClick={() => quickResolve(issue)}
                                disabled={updateMut.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIssue(issue);
                                    setUpdateStatus(
                                      issue.status === "in_progress"
                                        ? "resolved"
                                        : "in_progress",
                                    );
                                    setUpdateDeadline(issue.deadline ?? "");
                                  }}
                                >
                                  Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader>
                                  <DialogTitle>Update Issue</DialogTitle>
                                  <DialogDescription>
                                    {issue.title}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label>New Status</Label>
                                    <Select
                                      value={updateStatus}
                                      onValueChange={(v: any) =>
                                        setUpdateStatus(v)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="in_progress">
                                          In Progress
                                        </SelectItem>
                                        <SelectItem value="resolved">
                                          Resolved
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                          Reject (invalid report)
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {updateStatus === "in_progress" && (
                                    <div className="space-y-2">
                                      <Label>Expected Resolution Date</Label>
                                      <Input
                                        type="date"
                                        value={updateDeadline}
                                        onChange={(e) =>
                                          setUpdateDeadline(e.target.value)
                                        }
                                        min={
                                          new Date()
                                            .toISOString()
                                            .split("T")[0]
                                        }
                                      />
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    <Label>
                                      {updateStatus === "rejected"
                                        ? "Reason for Rejection"
                                        : "Official Note (Public)"}
                                    </Label>
                                    <Textarea
                                      placeholder={
                                        updateStatus === "rejected"
                                          ? "Explain why this report is being rejected..."
                                          : "Explain the action taken..."
                                      }
                                      value={updateNote}
                                      onChange={(e) =>
                                        setUpdateNote(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={handleUpdateStatus}
                                    disabled={updateMut.isPending}
                                    variant={
                                      updateStatus === "rejected"
                                        ? "destructive"
                                        : "default"
                                    }
                                  >
                                    {updateStatus === "rejected" ? (
                                      <>
                                        <ShieldX className="w-4 h-4 mr-2" />{" "}
                                        Reject
                                      </>
                                    ) : (
                                      "Save Changes"
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-border/50">
            <CheckCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No issues to display</h3>
            <p className="text-muted-foreground mt-2">
              Nothing matches your current filters.
            </p>
          </div>
        )}
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-border/50 p-6 lg:p-8 flex flex-col gap-8 shrink-0">
        <div>
          <h2 className="text-xl font-bold mb-2">Constituency Insights</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Live snapshot of your jurisdiction.
          </p>
        </div>

        {stats?.byCategory && stats.byCategory.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">
              Issues by Category
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.byCategory}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stats?.byStatus && stats.byStatus.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">
              Status Breakdown
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={(entry) => entry.status.replace("_", " ")}
                  >
                    {stats.byStatus.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {kpiExtras.hotspots.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-destructive" />
                Top Hotspots
              </h3>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/60 rounded px-2 py-0.5">
                Most confirmed
              </span>
            </div>
            <div className="space-y-3">
              {kpiExtras.hotspots.map((h, idx) => (
                <Link
                  key={h.id}
                  href={`/gov/issues/${h.id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:shadow-md hover:border-primary/30 transition-all">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        idx === 0
                          ? "bg-destructive/15 text-destructive"
                          : idx === 1
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-muted text-foreground"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {h.title}
                        </p>
                        {h.urgent && (
                          <Flame className="w-3 h-3 text-destructive shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {h.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <ThumbsUp className="w-3 h-3" />
                          {h.confirmations}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(h.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="flex-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {stats.recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  <div>
                    <p className="text-foreground">{act.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(act.at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
