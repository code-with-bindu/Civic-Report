import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useListIssues, getListIssuesQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { IssueStatusBadge } from "@/components/ui/IssueStatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const defaultCenter: [number, number] = [40.7128, -74.0060]; // Default to NYC, usually it should focus based on issues

const CATEGORIES = ["All", "Pothole", "Water Logging", "Streetlight", "Graffiti", "Garbage", "Safety", "Other"];
const STATUSES = ["All", "Pending", "Verified", "In Progress", "Resolved", "Rejected"];

export default function Heatmap() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: issues, isLoading } = useListIssues(
    { 
      scope: 'all',
      category: categoryFilter !== "All" ? categoryFilter : undefined,
      status: statusFilter !== "All" ? statusFilter.toLowerCase().replace(" ", "_") : undefined
    },
    { 
      query: { 
        queryKey: getListIssuesQueryKey({ 
          scope: 'all',
          category: categoryFilter !== "All" ? categoryFilter : undefined,
          status: statusFilter !== "All" ? statusFilter.toLowerCase().replace(" ", "_") : undefined
        })
      } 
    }
  );

  const issuesWithCoords = issues?.filter(i => i.lat && i.lng) || [];
  const center = issuesWithCoords.length > 0 
    ? [issuesWithCoords[0].lat!, issuesWithCoords[0].lng!] as [number, number]
    : defaultCenter;

  const getMarkerColor = (status: string, urgent: boolean) => {
    if (status === 'resolved') return '#16a34a'; // green-600
    if (urgent) return '#dc2626'; // red-600
    if (status === 'in_progress') return '#2563eb'; // blue-600
    if (status === 'verified') return '#ca8a04'; // yellow-600
    return '#d97706'; // amber-600 (pending)
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="bg-white border-b p-4 shadow-sm z-10 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            City Heatmap
          </h1>
          <p className="text-sm text-muted-foreground">View reports across the city</p>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 relative bg-muted/20">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
        <MapContainer center={center} zoom={12} className="w-full h-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issuesWithCoords.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat!, issue.lng!]}
              icon={createCustomIcon(getMarkerColor(issue.status, issue.urgent))}
            >
              <Popup className="rounded-xl overflow-hidden shadow-xl p-0">
                <div className="w-[240px] flex flex-col m-0 p-0 overflow-hidden">
                  {issue.photoUrl ? (
                    <div className="h-32 w-full bg-muted">
                      <img src={issue.photoUrl} alt="Issue" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-4 bg-primary" />
                  )}
                  <div className="p-4 bg-white flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <IssueStatusBadge status={issue.status} />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded-full">
                        {issue.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-base leading-tight mt-1">{issue.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{issue.address}</p>
                    <Link href={`/citizen/issues/${issue.id}`}>
                      <Button size="sm" className="w-full mt-2" variant="secondary">View Details</Button>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
