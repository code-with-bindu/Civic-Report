import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListIssues,
  getListIssuesQueryKey,
  useListOfficials,
  getListOfficialsQueryKey,
} from "@workspace/api-client-react";
import { IssueCard } from "@/components/ui/IssueCard";
import {
  PlusCircle,
  SearchX,
  Search,
  ListChecks,
  Hourglass,
  Wrench,
  CheckCircle2,
  Flame,
  LayoutGrid,
  List as ListIcon,
  ThumbsUp,
  Globe2,
  Building,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  "All",
  "Pothole",
  "Water Logging",
  "Streetlight",
  "Graffiti",
  "Garbage",
  "Safety",
  "Other",
];
const STATUSES = [
  "All",
  "Pending",
  "Verified",
  "In Progress",
  "Resolved",
  "Rejected",
];

type SortKey = "newest" | "oldest" | "confirmations" | "urgent";
type Tab = "mine" | "area" | "all";

const AREA_KEY = "civicreport:area_state";

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("mine");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [areaState, setAreaState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(AREA_KEY) ?? "";
  });

  useEffect(() => {
    if (areaState) localStorage.setItem(AREA_KEY, areaState);
  }, [areaState]);

  const { data: officials } = useListOfficials({
    query: { queryKey: getListOfficialsQueryKey() },
  });

  const states = useMemo(() => {
    const set = new Set<string>();
    (officials ?? []).forEach((o) => o.state && set.add(o.state));
    return Array.from(set).sort();
  }, [officials]);

  // default state once officials load
  useEffect(() => {
    if (!areaState && states.length > 0) {
      setAreaState(states[0]);
    }
  }, [states, areaState]);

  // pick query args based on tab
  const queryArgs = useMemo(() => {
    if (tab === "mine") {
      return {
        scope: "mine" as const,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        status:
          statusFilter !== "All"
            ? statusFilter.toLowerCase().replace(" ", "_")
            : undefined,
      };
    }
    if (tab === "area") {
      return {
        scope: "area" as const,
        state: areaState || undefined,
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        status:
          statusFilter !== "All"
            ? statusFilter.toLowerCase().replace(" ", "_")
            : undefined,
      };
    }
    return {
      scope: "all" as const,
      category: categoryFilter !== "All" ? categoryFilter : undefined,
      status:
        statusFilter !== "All"
          ? statusFilter.toLowerCase().replace(" ", "_")
          : undefined,
    };
  }, [tab, categoryFilter, statusFilter, areaState]);

  const { data: issues, isLoading } = useListIssues(queryArgs as never, {
    query: {
      queryKey: getListIssuesQueryKey(queryArgs as never),
      enabled: !!user,
    },
  });

  const { data: myIssues } = useListIssues(
    { scope: "mine" },
    {
      query: {
        queryKey: getListIssuesQueryKey({ scope: "mine" }),
        enabled: !!user,
      },
    },
  );

  const myStats = useMemo(() => {
    const list = myIssues ?? [];
    const totalConfirmations = list.reduce(
      (sum, i) => sum + (i.confirmations ?? 0),
      0,
    );
    return {
      total: list.length,
      pending: list.filter((i) => i.status === "pending").length,
      inProgress: list.filter((i) => i.status === "in_progress").length,
      resolved: list.filter((i) => i.status === "resolved").length,
      urgent: list.filter(
        (i) => i.urgent && i.status !== "resolved" && i.status !== "rejected",
      ).length,
      totalConfirmations,
      impactScore: list.reduce(
        (sum, i) =>
          sum + (i.status === "resolved" ? 10 : (i.confirmations ?? 0)),
        0,
      ),
    };
  }, [myIssues]);

  const filtered = useMemo(() => {
    let list = issues ? [...issues] : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "confirmations":
          return (b.confirmations ?? 0) - (a.confirmations ?? 0);
        case "urgent":
          return Number(!!b.urgent) - Number(!!a.urgent);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return list;
  }, [issues, search, sort]);

  const statCards = [
    {
      label: "Total Reports",
      value: myStats.total,
      icon: ListChecks,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending",
      value: myStats.pending,
      icon: Hourglass,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "In Progress",
      value: myStats.inProgress,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Resolved",
      value: myStats.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Urgent Open",
      value: myStats.urgent,
      icon: Flame,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Confirmations",
      value: myStats.totalConfirmations,
      icon: ThumbsUp,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  const tabMeta: Record<
    Tab,
    { label: string; icon: typeof ListChecks; helper: string }
  > = {
    mine: {
      label: "My Reports",
      icon: ListChecks,
      helper: "Issues you have submitted.",
    },
    area: {
      label: "My Area",
      icon: Building,
      helper: "Live reports across your state.",
    },
    all: {
      label: "All India",
      icon: Globe2,
      helper: "Every active report across the country.",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Citizen"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-sm">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs text-muted-foreground">Impact</span>
            <span className="font-bold text-foreground">
              {myStats.impactScore}
            </span>
          </div>
          <Link href="/citizen/new">
            <Button
              size="lg"
              className="rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50 shadow-sm bg-white h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
                >
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {s.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3">
            <TabsTrigger value="mine" className="gap-1.5">
              <ListChecks className="w-4 h-4" /> My Reports
            </TabsTrigger>
            <TabsTrigger value="area" className="gap-1.5">
              <Building className="w-4 h-4" /> My Area
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              <Globe2 className="w-4 h-4" /> All India
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "area" && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              State:
            </span>
            <Select value={areaState} onValueChange={setAreaState}>
              <SelectTrigger className="w-[200px] bg-card">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {tabMeta[tab].helper}
      </p>

      <div className="bg-white border border-border/50 rounded-xl shadow-sm p-4 mb-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, address or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="confirmations">Most confirmed</SelectItem>
            <SelectItem value="urgent">Urgent first</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-border/50">
          <span className="text-sm font-medium text-muted-foreground px-2">
            Status:
          </span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === s ? "bg-primary text-white font-medium shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-border/50">
          <span className="text-sm font-medium text-muted-foreground px-2">
            Category:
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${categoryFilter === c ? "bg-secondary text-secondary-foreground font-medium shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((issue) => (
              <Link
                key={issue.id}
                href={`/citizen/issues/${issue.id}`}
                className="block bg-white border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    {issue.photoUrl ? (
                      <img
                        src={issue.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{issue.title}</h3>
                      {issue.urgent && (
                        <Flame className="w-4 h-4 text-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {issue.category} • {issue.address}
                      {issue.state ? ` • ${issue.state}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {issue.status.replace("_", " ")}
                    </p>
                    <p className="text-xs text-primary font-bold">
                      {issue.confirmations} confirmations
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-border/50 shadow-sm">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No issues found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {tab === "area"
              ? `No reports in ${areaState || "this state"} match your filters.`
              : "We couldn't find any reports matching your current filters."}
          </p>
          {tab === "mine" && (
            <Link href="/citizen/new">
              <Button variant="outline" className="mt-6">
                Report a new issue
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
