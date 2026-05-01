import { Badge } from "@/components/ui/badge";
import { IssueStatus } from "@workspace/api-client-react";

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case "verified":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Verified</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
    case "resolved":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
