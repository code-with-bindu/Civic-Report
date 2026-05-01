import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateIssue,
  useListOfficials,
  getListOfficialsQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Camera,
  Loader2,
  ShieldCheck,
  LocateFixed,
  AlertOctagon,
} from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  "Pothole",
  "Water Logging",
  "Streetlight",
  "Graffiti",
  "Garbage",
  "Safety",
  "Other",
];

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export default function NewIssue() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [address, setAddress] = useState("");
  const [constituency, setConstituency] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [locStatus, setLocStatus] = useState<LocationStatus>("idle");
  const [locError, setLocError] = useState<string>("");

  const createIssue = useCreateIssue();
  const { data: officials } = useListOfficials({
    query: { queryKey: getListOfficialsQueryKey() },
  });

  const uniqueConstituencies = Array.from(
    new Set(officials?.map((o) => o.constituency) || []),
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("unavailable");
      setLocError("Geolocation is not supported on this device.");
      return;
    }

    setLocStatus("requesting");
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          if (data.display_name) {
            setAddress(data.display_name);
          }
          const a = data.address ?? {};
          const detectedCity =
            a.city ||
            a.town ||
            a.village ||
            a.county ||
            a.suburb ||
            a.state_district ||
            "";
          if (detectedCity) setCity(detectedCity);
          if (a.state) setStateName(a.state);
        } catch (e) {
          console.error("Reverse geocode failed", e);
        }
        setLocStatus("granted");
      },
      (err) => {
        setLocStatus("denied");
        if (err.code === err.PERMISSION_DENIED) {
          setLocError(
            "You denied location access. Please enable it in your browser settings to report an issue.",
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocError(
            "Your location could not be determined. Please try again outdoors or with GPS enabled.",
          );
        } else {
          setLocError(err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  // Auto-prompt geolocation on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationVerified =
    locStatus === "granted" && lat !== undefined && lng !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationVerified) {
      toast({
        title: "Location required",
        description:
          "We need to verify your location before you can report an issue.",
        variant: "destructive",
      });
      return;
    }
    if (!title || !category || !address) {
      toast({
        title: "Missing fields",
        description: "Title, category, and address are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await createIssue.mutateAsync({
        data: {
          title,
          description,
          category,
          address,
          constituency,
          city,
          state: stateName,
          lat: lat!,
          lng: lng!,
          photoUrl,
          urgent,
          anonymous,
        },
      });
      toast({ title: "Issue reported successfully!" });
      setLocation(`/citizen/issues/${res.id}`);
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ----- LOCATION GATE -----
  if (!locationVerified) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 shadow-lg overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                {locStatus === "requesting" ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : locStatus === "denied" || locStatus === "unavailable" ? (
                  <AlertOctagon className="w-10 h-10 text-destructive" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-primary" />
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                {locStatus === "requesting"
                  ? "Verifying your location…"
                  : locStatus === "denied" || locStatus === "unavailable"
                    ? "Location access required"
                    : "Verify your location to report"}
              </h1>

              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {locStatus === "requesting"
                  ? "Hold tight while we securely check where you are. This helps us route your report to the right authority."
                  : locStatus === "denied" || locStatus === "unavailable"
                    ? locError
                    : "To prevent fake reports, CivicReport only accepts issues filed from the location where the problem exists. We'll use your GPS to confirm where you're reporting from."}
              </p>

              {(locStatus === "denied" || locStatus === "unavailable") && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm rounded-lg p-4 mb-6 text-left">
                  <p className="font-semibold mb-1">How to enable:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Click the lock or location icon in your browser's address
                      bar
                    </li>
                    <li>Set "Location" to Allow for this site</li>
                    <li>Refresh this page and try again</li>
                  </ol>
                </div>
              )}

              <Button
                size="lg"
                onClick={requestLocation}
                disabled={locStatus === "requesting"}
                className="w-full sm:w-auto h-12 px-8 rounded-xl"
              >
                {locStatus === "requesting" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting…
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-4 h-4 mr-2" />
                    {locStatus === "idle"
                      ? "Verify my location"
                      : "Try again"}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
                Your precise location is only used to validate this report. It
                isn't shared with other citizens.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Help us identify and fix problems in your community.
        </p>
      </div>

      {/* Verified location banner */}
      <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Location verified
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {address || `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={requestLocation}
        >
          <LocateFixed className="w-4 h-4 mr-1" /> Recheck
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Photo */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <Label className="text-base font-semibold mb-4 block">
                Photo Evidence
              </Label>
              <div className="flex flex-col items-center justify-center w-full">
                {photoUrl ? (
                  <div className="relative w-full rounded-xl overflow-hidden bg-muted aspect-video">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setPhotoUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        category === c
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="desc" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="desc"
                  placeholder="Provide more details to help officials locate and fix the problem..."
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <Label className="text-base font-semibold block">Location</Label>

              <div className="space-y-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address or landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="constituency">Constituency (Optional)</Label>
                <Select value={constituency} onValueChange={setConstituency}>
                  <SelectTrigger id="constituency">
                    <SelectValue placeholder="Select constituency" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueConstituencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                GPS: {lat?.toFixed(5)}, {lng?.toFixed(5)}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card
            className={`border-border/50 shadow-sm transition-colors ${urgent ? "border-destructive/30 bg-destructive/5" : ""}`}
          >
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    className={`text-base font-semibold ${urgent ? "text-destructive" : ""}`}
                  >
                    Mark as Urgent
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Is this an immediate safety hazard?
                  </p>
                </div>
                <Switch
                  checked={urgent}
                  onCheckedChange={setUrgent}
                  className={
                    urgent ? "data-[state=checked]:bg-destructive" : ""
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    Report Anonymously
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your name will be hidden from the public
                  </p>
                </div>
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20"
            disabled={createIssue.isPending}
          >
            {createIssue.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
