import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, User, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useSearchRegistration } from "@/hooks/use-registrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Search() {
  const [tgmcId, setTgmcId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: results, isLoading, isError } = useSearchRegistration(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tgmcId);
  };

  return (
    <Layout>
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Verify TGMC ID</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search for registered doctors in the HRDA database using their Telangana State Medical Council (TGMC) ID.
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
                <Card key={reg.id} className="border-l-4 border-l-primary shadow-md">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-full">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold">{reg.firstName} {reg.lastName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          reg.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reg.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-1">TGMC ID: <span className="text-foreground font-medium">{reg.tgmcId}</span></p>
                      {reg.membershipType && <p className="text-sm text-slate-500 capitalize">{reg.membershipType} Membership</p>}
                    </div>
                  </CardContent>
                </Card>
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
