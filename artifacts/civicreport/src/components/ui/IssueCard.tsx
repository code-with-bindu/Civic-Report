import { Link } from "wouter";
import { Issue } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, AlertTriangle, MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IssueStatusBadge } from "./IssueStatusBadge";
import { motion } from "framer-motion";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-lg transition-all bg-white group cursor-pointer">
        <Link href={`/citizen/issues/${issue.id}`} className="flex-1 flex flex-col">
          {issue.photoUrl ? (
            <div className="h-48 w-full overflow-hidden bg-muted relative">
              <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {issue.urgent && (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-destructive/20 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 w-full bg-muted flex items-center justify-center relative">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
              {issue.urgent && (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-destructive/20 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </div>
              )}
            </div>
          )}
          
          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <IssueStatusBadge status={issue.status} />
              <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                {issue.category}
              </span>
            </div>
            
            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">{issue.title}</h3>
            
            <div className="mt-auto space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{issue.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-primary">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{issue.confirmations}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}
