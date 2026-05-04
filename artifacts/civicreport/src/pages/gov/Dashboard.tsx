import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useListIssues,
  useUpdateIssueStatus,
  useAddIssueNote,
  getListIssuesQueryKey,
  Issue,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Download,
  Flame,
  ShieldX,
  ThumbsUp,
  TrendingUp,
  Timer,
  Target,
  Zap,
  Activity,
  Globe,
  ChevronRight,
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

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Delhi": {
    "New Delhi": ["New Delhi"],
  },
  "Telangana": {
    "Hyderabad": ["Gajwel"],
  },
  "Maharashtra": {
    "Mumbai": ["Rajapur"],
    "Nagpur": ["Nagpur South West"],
  },
  "Uttar Pradesh": {
    "Gorakhpur": ["Gorakhpur Urban"],
  },
  "West Bengal": {
    "Kolkata": ["Bhabanipur"],
  },
  "Tamil Nadu": {
    "Chennai": ["Kolathur"],
  },
  "Kerala": {
    "Kannur": ["Dharmadam"],
  },
  "Chhattisgarh": {
    "Raipur": ["Patan"],
  },
  "Rajasthan": {
    "Jodhpur": ["Sardarpura"],
  },
  "Haryana": {
    "Karnal": ["Karnal"],
  },
  "Punjab": {
    "Sangrur": ["Dhuri"],
  },
  "Karnataka": {
    "Mysuru": ["Varuna"],
  },
  "Jharkhand": {
    "Sahibganj": ["Barhait"],
  },
  "Odisha": {
    "Bhubaneswar": ["Hinjili"],
  },
};

type SortKey = "newest" | "oldest" | "deadline" | "urgent" | "confirmations";

export default function GovDashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const [locState, setLocState] = useState("all");
  const [locCity, setLocCity] = useState("all");
  const [locConstituency, setLocConstituency] = useState("all");

  const [updateStatus, setUpdateStatus] = useState<
    "in_progress" | "resolved" | "rejected"
  >("in_progress");
  const [updateNote, setUpdateNote] = useState("");
  const [updateDeadline, setUpdateDeadline] = useState("");

  const availableCities = useMemo(() => {
    if (locState === "all") return [];
    return Object.keys(LOCATION_DATA[locState] ?? {});
  }, [locState]);

  const availableConstituencies = useMemo(() => {
    if (locState === "all" || locCity === "all") return [];
    return LOCATION_DATA[locState]?.[locCity] ?? [];
  }, [locState, locCity]);

  const issueQueryParams = useMemo(() => {
    const p: Record<string, string> = { scope: "all" };
    if (statusFilter !== "all") p.status = statusFilter;
    if (locConstituency !== "all") p.constituency = locConstituency;
    else if (locCity !== "all") p.city = locCity;
    else if (locState !== "all") p.state = locState;
    return p;
  }, [statusFilter, locState, locCity, locConstituency]);

  const { data: issues, isLoading: loadingIssues } = useListIssues(
    issueQueryParams as any,
    {
      query: {
        queryKey: getListIssuesQueryKey(issueQueryParams as any),
        enabled: !!user,
        refetchInterval: 30000,
      },
    },
  );

  const statsQueryKey = ["gov-stats", locState, locCity, locConstituency];
  const { data: stats } = useQuery<any>({
    queryKey: statsQueryKey,
    queryFn: async () => {
      const p = new URLSearchParams();
      if (locConstituency !== "all") p.set("constituency", locConstituency);
      else if (locCity !== "all") p.set("city", locCity);
      else if (locState !== "all") p.set("state", locState);
      const res = await fetch(`/api/stats/government?${p.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token ?? ""}` },
      });
      if (!res.ok) throw new Error("stats failed");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

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
      queryClient.invalidateQueries({ queryKey: ["gov-stats"] });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
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
      queryClient.invalidateQueries({ queryKey: ["gov-stats"] });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const kpiExtras = useMemo(() => {
    const list = issues ?? [];
    const resolved = list.filter((i) => i.status === "resolved");
    const inProgress = list.filter((i) => i.status === "in_progress");
    const urgentOpen = list.filter(
      (i) => i.urgent && i.status !== "resolved" && i.status !== "rejected",
    );
    const resolutionTimes = resolved
      .map((i) => {
        const resolvedEvt = i.timeline.find((t) => t.status === "resolved");
        if (!resolvedEvt) return null;
        const days =
          (new Date(resolvedEvt.at).getTime() - new Date(i.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        return days;
      })
      .filter((d): d is number => d !== null && !Number.isNaN(d) && d >= 0);
    const avgResolutionDays = resolutionTimes.length
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;
    const withDeadline = resolved.filter((i) => i.deadline);
    const onTime = withDeadline.filter((i) => {
      const resolvedEvt = i.timeline.find((t) => t.status === "resolved");
      if (!resolvedEvt) return false;
      return new Date(resolvedEvt.at).getTime() <= new Date(i.deadline as string).getTime();
    });
    const onTimePct = withDeadline.length
      ? Math.round((onTime.length / withDeadline.length) * 100)
      : 100;
    const hotspots = list
      .filter((i) => i.status === "verified" || i.status === "in_progress")
      .sort((a, b) => (b.confirmations ?? 0) - (a.confirmations ?? 0))
      .slice(0, 5);
    const totalConfirmations = list.reduce((sum, i) => sum + (i.confirmations ?? 0), 0);
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
    if (categoryFilter !== "all") list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          (i.city ?? "").toLowerCase().includes(q) ||
          (i.state ?? "").toLowerCase().includes(q) ||
          (i.constituency ?? "").toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [issues, categoryFilter, search, sort]);

  const exportCsv = () => {
    if (!filtered.length) {
      toast({ title: "Nothing to export", description: "No issues match." });
      return;
    }
    const header = ["id", "title", "category", "status", "address", "city", "state", "constituency", "createdAt", "deadline", "confirmations", "urgent", "reporter"];
    const rows = filtered.map((i) =>
      [
        i.id,
        JSON.stringify(i.title),
        i.category,
        i.status,
        JSON.stringify(i.address),
        i.city ?? "",
        i.state ?? "",
        i.constituency ?? "",
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

  const locationLabel =
    locConstituency !== "all"
      ? locConstituency
      : locCity !== "all"
      ? locCity
      : locState !== "all"
      ? locState
      : "All Locations";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-muted/20">
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Official Dashboard</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              Welcome, {user.name}
              <span className="text-muted-foreground/50">•</span>
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary font-medium">{locationLabel}</span>
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

        {/* ── Location filter bar ── */}
        <div className="bg-white border border-border/50 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Filter by Location</span>
            {(locState !== "all" || locCity !== "all" || locConstituency !== "all") && (
              <button
                onClick={() => { setLocState("all"); setLocCity("all"); setLocConstituency("all"); }}
                className="ml-auto text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Clear location
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground font-medium">State</label>
              <Select
                value={locState}
                onValueChange={(v) => {
                  setLocState(v);
                  setLocCity("all");
                  setLocConstituency("all");
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {Object.keys(LOCATION_DATA).sort().map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {locState !== "all" && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-5 shrink-0" />
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <label className="text-xs text-muted-foreground font-medium">City</label>
                  <Select
                    value={locCity}
                    onValueChange={(v) => {
                      setLocCity(v);
                      setLocConstituency("all");
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities in {locState}</SelectItem>
                      {availableCities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {locCity !== "all" && availableConstituencies.length > 0 && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-5 shrink-0" />
                <div className="flex flex-col gap-1 min-w-[220px]">
                  <label className="text-xs text-muted-foreground font-medium">Constituency</label>
                  <Select value={locConstituency} onValueChange={setLocConstituency}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All Constituencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Constituencies in {locCity}</SelectItem>
                      {availableConstituencies.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {locState === "all" && (
              <p className="text-xs text-muted-foreground mt-5 italic">
                Showing all issues nationwide. Select a state to drill down.
              </p>
            )}
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Verified</p>
              </div>
              <p className="text-2xl font-bold text-primary">{stats?.totalVerified ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Resolved</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats?.totalResolved ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">In Progress</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{kpiExtras.inProgress}</p>
            </CardContent>
          </Card>
          <Card className={`border-border/50 shadow-sm ${kpiExtras.urgentOpen ? "bg-destructive/10" : "bg-white"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className={`w-3.5 h-3.5 ${kpiExtras.urgentOpen ? "text-destructive" : "text-muted-foreground"}`} />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Urgent Open</p>
              </div>
              <p className={`text-2xl font-bold ${kpiExtras.urgentOpen ? "text-destructive" : "text-foreground"}`}>
                {kpiExtras.urgentOpen}
              </p>
            </CardContent>
          </Card>
          <Card className={`border-border/50 shadow-sm ${stats?.overdue ? "bg-destructive/10" : "bg-white"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className={`w-3.5 h-3.5 ${stats?.overdue ? "text-destructive" : "text-muted-foreground"}`} />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Overdue</p>
              </div>
              <p className={`text-2xl font-bold ${stats?.overdue ? "text-destructive" : "text-foreground"}`}>
                {stats?.overdue ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Timer className="w-3.5 h-3.5 text-purple-600" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Avg Days</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpiExtras.avgResolutionDays || "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-secondary" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">On-Time</p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-foreground">{kpiExtras.onTimePct}%</p>
                {kpiExtras.onTimePct >= 80 && <TrendingUp className="w-4 h-4 text-green-600" />}
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Citizen Confirmations</p>
                <p className="text-xl font-bold text-foreground">{kpiExtras.totalConfirmations}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Resolution Rate</p>
                <p className="text-xl font-bold text-foreground">{resolutionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filters bar ── */}
        <div className="flex flex-wrap gap-3 items-center mb-6 bg-white p-3 rounded-xl border border-border/50 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, address, city, constituency, ID..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Newly Verified</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>
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
          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
            {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Issues list ── */}
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
                      ? differenceInDays(new Date(issue.deadline), new Date())
                      : null;
                    return (
                      <TableRow key={issue.id} className="bg-white">
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {issue.urgent && (
                              <Flame className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium max-w-xs truncate">{issue.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {issue.category} •{" "}
                                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <IssueStatusBadge status={issue.status} />
                            {issue.overdue && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />OVERDUE
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-foreground max-w-[180px] truncate">
                              {issue.address}
                            </span>
                            {(issue.city || issue.state) && (
                              <span className="text-xs text-muted-foreground">
                                {[issue.city, issue.state].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {issue.constituency && (
                              <span className="text-[10px] text-primary/70 font-medium">
                                {issue.constituency}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sla !== null ? (
                            <span
                              className={`text-sm font-semibold ${
                                sla < 0
                                  ? "text-destructive"
                                  : sla <= 2
                                  ? "text-orange-500"
                                  : "text-foreground"
                              }`}
                            >
                              {sla < 0 ? `${Math.abs(sla)}d over` : `${sla}d left`}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{issue.confirmations ?? 0}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/citizen/issues/${issue.id}`}>View</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedIssue(issue);
                                setUpdateStatus("in_progress");
                                setUpdateNote("");
                                setUpdateDeadline("");
                              }}
                            >
                              Update
                            </Button>
                            {issue.status !== "resolved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => quickResolve(issue)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((issue) => (
                <div key={issue.id} className="relative">
                  <IssueCard issue={issue} />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs px-2"
                      onClick={() => {
                        setSelectedIssue(issue);
                        setUpdateStatus("in_progress");
                        setUpdateNote("");
                        setUpdateDeadline("");
                      }}
                    >
                      Update
                    </Button>
                    {issue.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                        onClick={() => quickResolve(issue)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No issues found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try adjusting your location or filters
            </p>
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <div className="w-full lg:w-80 shrink-0 p-6 border-t lg:border-t-0 lg:border-l border-border/50 bg-white flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-destructive" /> Top Hotspots
          </h3>
          {kpiExtras.hotspots.length > 0 ? (
            <div className="space-y-2">
              {kpiExtras.hotspots.map((issue, idx) => (
                <Link href={`/citizen/issues/${issue.id}`} key={issue.id}>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {issue.city ?? issue.address}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          · {issue.confirmations} confirms
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active hotspots</p>
          )}
        </div>

        {stats?.byCategory?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={false}
                >
                  {stats.byCategory.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: any, n: any) => [v, n]} />
                <Legend
                  iconSize={8}
                  formatter={(v) => <span className="text-xs">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.byStatus?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.byStatus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.recentActivity?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {stats.recentActivity.map((a: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                  <p className="font-medium text-foreground truncate">{a.message}</p>
                  <p>{formatDistanceToNow(new Date(a.at), { addSuffix: true })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Update dialog ── */}
      <Dialog open={!!selectedIssue} onOpenChange={(o) => !o && setSelectedIssue(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Issue</DialogTitle>
            <DialogDescription className="truncate">{selectedIssue?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as any)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updateStatus === "in_progress" && (
              <div>
                <label className="text-sm font-medium">Resolution Deadline</label>
                <Input
                  type="date"
                  value={updateDeadline}
                  onChange={(e) => setUpdateDeadline(e.target.value)}
                  className="mt-1.5"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Official Note (optional)</label>
              <Textarea
                placeholder="Add a public note for citizens..."
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={updateMut.isPending}>
                {updateMut.isPending ? "Updating..." : "Update Issue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
