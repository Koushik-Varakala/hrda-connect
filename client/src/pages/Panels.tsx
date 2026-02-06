import { Layout } from "@/components/Layout";
import { usePanels } from "@/hooks/use-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Panels() {
  const [district, setDistrict] = useState<string>("all");

  // Fetch all for client-side filtering (simpler for this scale) or use multiple queries
  const { data: panels, isLoading } = usePanels();

  // Unique districts
  const districts = Array.from(new Set(panels?.filter(p => !p.isStateLevel && p.district).map(p => p.district) || [])).sort();

  const statePanel = panels?.filter(p => p.isStateLevel).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const districtPanel = panels?.filter(p => !p.isStateLevel && (district === "all" || p.district === district));

  return (
    <Layout>
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-center mb-4">Leadership Panels</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated doctors leading HRDA at the state and district levels.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="state" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="state">State Body</TabsTrigger>
              <TabsTrigger value="district">District Body</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="state">
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statePanel?.map((member) => (
                  <PanelCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="district">
            <div className="mb-8 max-w-xs mx-auto">
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(d => (
                    <SelectItem key={d} value={d!}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {districtPanel?.map((member) => (
                  <PanelCard key={member.id} member={member} />
                ))}
                {districtPanel?.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground">
                    No members found for this district.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PanelCard({ member }: { member: any }) {
  return (
    <Card className="text-center card-hover border-t-2 border-t-primary/20">
      <CardContent className="pt-8">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-md">
          <AvatarImage src={member.imageUrl || ""} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {member.name[0]}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg mb-1">{member.name}</h3>
        <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
        {!member.isStateLevel && <p className="text-xs text-muted-foreground uppercase tracking-wider">{member.district}</p>}
        {member.phone && <p className="text-sm text-slate-500 mt-2">{member.phone}</p>}
      </CardContent>
    </Card>
  );
}
