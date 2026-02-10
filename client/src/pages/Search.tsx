import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search as SearchIcon, User, AlertCircle, Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { useSearchRegistration, useUpdateRegistration } from "@/hooks/use-registrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Search() {
  const [tgmcId, setTgmcId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results, isLoading } = useSearchRegistration(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tgmcId);
  };

  return (
    <Layout>
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Search & Update TGMC ID</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search for registered doctors in the HRDA database using their Telangana State Medical Council (TGMC) ID.
            You can also update your contact details here.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter TGMC ID (e.g. 12345)"
              value={tgmcId}
              onChange={(e) => setTgmcId(e.target.value)}
              className="h-12 text-lg shadow-sm"
            />
            <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
              {isLoading ? "Searching..." : <><SearchIcon className="w-4 h-4 mr-2" /> Search</>}
            </Button>
          </form>
        </div>

        <div className="max-w-3xl mx-auto">
          {searchTerm && results && results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              {results.map((reg) => (
                <ResultCard key={reg.id} registration={reg} />
              ))}
            </div>
          )}

          {searchTerm && results && results.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>
                No records found matching TGMC ID "{searchTerm}". Please check the ID and try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ResultCard({ registration }: { registration: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: registration.phone,
    email: registration.email || "",
    address: registration.address || ""
  });
  const updateMutation = useUpdateRegistration();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: registration.id,
        ...formData
      });
      setIsEditing(false);
      toast({ title: "Success", description: "Details updated successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update details.", variant: "destructive" });
    }
  };

  if (isEditing) {
    return (
      <Card className="border-l-4 border-l-blue-500 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Edit2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Editing Details</h3>
              <p className="text-muted-foreground">{registration.firstName} {registration.lastName} (TGMC: {registration.tgmcId})</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 p-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary shadow-md">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="bg-slate-100 p-3 rounded-full">
          <User className="w-8 h-8 text-slate-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold">{registration.firstName} {registration.lastName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${registration.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
              {registration.status?.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-2">
            <p className="text-muted-foreground">TGMC ID: <span className="text-foreground font-medium">{registration.tgmcId}</span></p>
            {registration.hrdaId && (
              <p className="text-muted-foreground">HRDA ID: <span className="text-primary font-bold">{registration.hrdaId}</span></p>
            )}
          </div>
          {registration.membershipType && <p className="text-sm text-slate-500 capitalize">{registration.membershipType} Membership</p>}

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-900">Phone:</span> {registration.phone}
            </div>
            <div>
              <span className="font-medium text-slate-900">Email:</span> {registration.email || "-"}
            </div>
            <div className="col-span-2">
              <span className="font-medium text-slate-900">Address:</span> {registration.address || "-"}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </Button>
      </CardContent>
    </Card>
  );
}
