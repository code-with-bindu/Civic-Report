import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginGovernment, useListOfficials, getListOfficialsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function GovLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [officialId, setOfficialId] = useState("");

  const loginMut = useLoginGovernment();
  const { data: officials, isLoading } = useListOfficials({ query: { queryKey: getListOfficialsQueryKey() } });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMut.mutateAsync({ data: { name, officialId } });
      login(res.token, res.user);
      setLocation("/gov");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
  };

  const autofill = (n: string, id: string) => {
    setName(n);
    setOfficialId(id);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-muted/30">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="border-primary/20 shadow-xl shadow-primary/5">
            <CardHeader className="space-y-1 pb-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Official Login</CardTitle>
              <CardDescription>Secure access for government officials and MLAs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officialId">Official ID</Label>
                  <Input id="officialId" required value={officialId} onChange={(e) => setOfficialId(e.target.value)} placeholder="e.g. MLA-12345" />
                </div>
                <Button type="submit" className="w-full mt-4" size="lg" disabled={loginMut.isPending}>
                  {loginMut.isPending ? "Authenticating..." : "Access Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Helper Panel */}
      <div className="hidden lg:flex lg:w-1/3 bg-white border-l p-8 flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Registered Officials
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            For demo purposes, you can use these credentials to access the government dashboard.
          </p>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg"></div>)}
              </div>
            ) : officials?.map((off, idx) => (
              <Card key={idx} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => autofill(off.name, off.officialId)}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{off.name}</p>
                    <p className="text-xs text-muted-foreground">{off.constituency}</p>
                  </div>
                  <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                    {off.officialId}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
