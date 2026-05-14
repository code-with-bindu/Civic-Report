import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetPublicStats,
  getGetPublicStatsQueryKey,
  useListIssues,
  getListIssuesQueryKey,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  Shield,
  Megaphone,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ThumbsUp,
  Lightbulb,
  Camera,
  Bell,
  CheckCircle,
  TrendingUp,
  Quote,
  Construction,
  Droplets,
  Zap,
  Trash2,
  ShieldAlert,
  PaintBucket,
  Lock,
  BarChart3,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { IssueStatusBadge } from "@/components/ui/IssueStatusBadge";

const CATEGORIES = [
  {
    name: "Potholes",
    icon: Construction,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    desc: "Damaged or broken roads",
  },
  {
    name: "Water Logging",
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    desc: "Drainage and flooding issues",
  },
  {
    name: "Streetlights",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    desc: "Broken or missing lights",
  },
  {
    name: "Garbage",
    icon: Trash2,
    color: "text-green-600",
    bg: "bg-green-500/10",
    desc: "Waste and sanitation",
  },
  {
    name: "Safety Hazards",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10",
    desc: "Public risks and dangers",
  },
  {
    name: "Graffiti",
    icon: PaintBucket,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    desc: "Vandalism cleanup",
  },
  {
    name: "Roads & Signs",
    icon: MapPin,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    desc: "Damaged signage",
  },
  {
    name: "Public Safety",
    icon: Lock,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    desc: "Community concerns",
  },
];

const FEATURES = [
  {
    icon: Camera,
    title: "Photo + GPS Reporting",
    desc: "Snap, drop a pin, and report in under 30 seconds.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Community Verification",
    desc: "Reports gain authenticity through neighborhood confirmations.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    desc: "Get notified the moment your issue moves forward.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Lock,
    title: "Anonymous Reporting",
    desc: "Stay safe — report sensitive issues without revealing identity.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Live Resolution Tracking",
    desc: "Watch progress with status timelines and SLA deadlines.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: Smartphone,
    title: "Works Anywhere",
    desc: "Mobile-first design that loads fast on any connection.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Sparkles,
    title: "Authenticity Score",
    desc: "Smart scoring prioritizes urgent, well-documented reports.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Building,
    title: "Direct to Officials",
    desc: "Verified issues route straight to the right MLA.",
    color: "from-sky-500 to-blue-500",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Reported a pothole on Ring Road and it was filled in 4 days. This actually works.",
    name: "Priya S.",
    role: "Citizen, New Delhi",
  },
  {
    quote:
      "The community confirmation feature is brilliant — no more fake complaints clogging the system.",
    name: "Rajesh K.",
    role: "MLA, Karol Bagh",
  },
  {
    quote:
      "I used to call the municipal office for hours. Now I just open CivicReport.",
    name: "Anita M.",
    role: "Resident",
  },
  {
    quote:
      "Transparent timelines mean my constituents trust us more. Best tool we've adopted.",
    name: "Vikram R.",
    role: "Government Official",
  },
  {
    quote:
      "Got 50 streetlights fixed in my colony in a month. The dashboard makes it easy to follow up.",
    name: "Meera J.",
    role: "Resident Welfare Association",
  },
];

function Scroller({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <div
        ref={ref}
        aria-label={ariaLabel}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-snap-x py-4 px-1 -mx-1"
      >
        {children}
      </div>
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-md absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-md absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Landing() {
  const { data: stats } = useGetPublicStats({
    query: { queryKey: getGetPublicStatsQueryKey() },
  });

  const { data: communityIssues } = useListIssues(
    { scope: "community" },
    { query: { queryKey: getListIssuesQueryKey({ scope: "community" }) } },
  );

  // Marquee auto-scroll for testimonials
  const marqueeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    let raf = 0;
    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    const tick = () => {
      if (!paused && el) {
        el.scrollLeft += 0.4;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const recentIssues = (communityIssues ?? []).slice(0, 8);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.12),transparent_50%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-sm mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-foreground tracking-wide">
                Live across {stats?.totalReported ?? 0}+ reports today
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6"
            >
              Your City. <span className="text-primary">Your Voice.</span> Your
              Power.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10"
            >
              Report civic issues, verify community reports, and track
              resolutions. Together, we build a better city.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/citizen/auth">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Continue as Citizen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/gov/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl"
                >
                  Login as Official
                  <Shield className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>
                No download needed. Works on any device, even on slow
                connections.
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Ticker */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="text-center px-4 pt-4 md:pt-0">
              <p className="text-4xl font-bold text-primary mb-2">
                {stats?.totalReported?.toLocaleString() || "—"}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Issues Reported
              </p>
            </div>
            <div className="text-center px-4 pt-4 md:pt-0">
              <p className="text-4xl font-bold text-secondary mb-2">
                {stats?.totalVerified?.toLocaleString() || "—"}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Community Verified
              </p>
            </div>
            <div className="text-center px-4 pt-4 md:pt-0">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {stats?.totalResolved?.toLocaleString() || "—"}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Successfully Resolved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — horizontal scroll */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                What can you report?
              </h2>
              <p className="text-muted-foreground">
                Tap a category to start reporting in seconds.
              </p>
            </div>
            <Link href="/citizen/new">
              <Button variant="ghost" className="gap-1 hidden sm:flex">
                Start reporting <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <Scroller ariaLabel="Issue categories">
            {CATEGORIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="shrink-0 w-56"
              >
                <Link href="/citizen/new">
                  <Card className="h-full bg-card border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div
                        className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <c.icon className={`w-6 h-6 ${c.color}`} />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </Scroller>
        </div>
      </section>

      {/* Live community feed */}
      {recentIssues.length > 0 && (
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  Live from your community
                </h2>
                <p className="text-muted-foreground">
                  Real reports happening right now. Confirm what you see.
                </p>
              </div>
              <Link href="/citizen">
                <Button variant="outline" className="hidden sm:flex">
                  View all
                </Button>
              </Link>
            </div>

            <Scroller ariaLabel="Recent community issues">
              {recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/citizen/issues/${issue.id}`}
                  className="shrink-0 w-72"
                >
                  <Card className="h-full bg-card border-border hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden">
                    <div className="h-32 bg-muted relative overflow-hidden">
                      {issue.photoUrl ? (
                        <img
                          src={issue.photoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                      {issue.urgent && (
                        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                          URGENT
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IssueStatusBadge status={issue.status} />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(issue.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <h3 className="font-semibold line-clamp-2 text-foreground mb-2">
                        {issue.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 max-w-[60%] truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{issue.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <ThumbsUp className="w-3 h-3" />
                          {issue.confirmations}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Scroller>
          </div>
        </section>
      )}

      {/* Innovative features — horizontal scroll */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Built for impact
              </h2>
              <p className="text-muted-foreground">
                Smart features that turn complaints into solutions.
              </p>
            </div>
          </div>

          <Scroller ariaLabel="Platform features">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-72"
              >
                <Card className="h-full bg-card border-border hover:shadow-lg transition-all overflow-hidden relative group">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.color} opacity-80`}
                  />
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Scroller>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How CivicReport Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A transparent, community-driven process for civic improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Megaphone className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                1. You Report
              </h3>
              <p className="text-muted-foreground">
                Spot a pothole, broken streetlight, or hazard? Snap a photo and
                report it instantly with precise GPS location.
              </p>

              <div className="hidden md:block absolute top-10 -right-6 text-border">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                2. Community Verifies
              </h3>
              <p className="text-muted-foreground">
                Other citizens confirm the issue. High confirmations boost the
                authenticity score, prioritizing urgent problems.
              </p>

              <div className="hidden md:block absolute top-10 -right-6 text-border">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Building className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                3. Officials Resolve
              </h3>
              <p className="text-muted-foreground">
                Government representatives track verified issues, set deadlines,
                and update status until the problem is fixed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials marquee */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Real voices, real change
          </h2>
          <p className="text-muted-foreground">
            What citizens and officials are saying about CivicReport.
          </p>
        </div>

        <div
          ref={marqueeRef}
          className="flex gap-4 overflow-x-auto no-scrollbar px-4"
          aria-label="Testimonials"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <Card
              key={i}
              className="shrink-0 w-80 bg-card border-border shadow-sm"
            >
              <CardContent className="p-6">
                <Quote className="w-6 h-6 text-primary/40 mb-3" />
                <p className="text-foreground leading-relaxed mb-4 text-sm">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white,transparent_60%)] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TrendingUp className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to transform your city?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of citizens already making a difference. It takes
              less than 30 seconds to file your first report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/citizen/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg h-14 px-8 rounded-xl shadow-xl"
                >
                  Get started — it's free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/heatmap">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 rounded-xl bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore city map
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="font-bold text-foreground">CivicReport</span>
            <span className="text-xs text-muted-foreground ml-2">
              Built for citizens, used by governments.
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/heatmap" className="hover:text-foreground">
              City Map
            </Link>
            <Link href="/citizen/auth" className="hover:text-foreground">
              Citizen Portal
            </Link>
            <Link href="/gov/login" className="hover:text-foreground">
              Official Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
