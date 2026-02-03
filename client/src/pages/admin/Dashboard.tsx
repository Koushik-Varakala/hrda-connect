import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegistrationsList } from "@/hooks/use-registrations";
import { Users, FileCheck, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: registrations } = useRegistrationsList();

  const totalMembers = registrations?.length || 0;
  const verifiedMembers = registrations?.filter(r => r.status === 'verified').length || 0;
  const pendingMembers = registrations?.filter(r => r.status === 'pending_verification').length || 0;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Registrations" 
          value={totalMembers} 
          icon={Users} 
          className="bg-blue-50 border-blue-100 text-blue-900"
        />
        <StatsCard 
          title="Verified Members" 
          value={verifiedMembers} 
          icon={FileCheck}
          className="bg-green-50 border-green-100 text-green-900" 
        />
        <StatsCard 
          title="Pending Verification" 
          value={pendingMembers} 
          icon={Activity}
          className="bg-yellow-50 border-yellow-100 text-yellow-900" 
        />
        <StatsCard 
          title="Total Revenue" 
          value={`₹${totalMembers * 1015}`} 
          icon={DollarSign}
          className="bg-indigo-50 border-indigo-100 text-indigo-900" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {registrations?.slice(0, 5).map(reg => (
                 <div key={reg.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                   <div>
                     <p className="font-medium">{reg.firstName} {reg.lastName}</p>
                     <p className="text-xs text-muted-foreground">{reg.email}</p>
                   </div>
                   <div className={`text-xs px-2 py-1 rounded capitalize ${
                      reg.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {reg.status?.replace('_', ' ')}
                   </div>
                 </div>
               ))}
               {!registrations?.length && <p className="text-muted-foreground text-sm">No recent data.</p>}
             </div>
          </CardContent>
        </Card>
        
        {/* Placeholder for future analytics chart */}
        <Card>
          <CardHeader>
             <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Status</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>API Status</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Sync</span>
                <span className="text-muted-foreground">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon: Icon, className }: any) {
  return (
    <Card className={`border shadow-sm ${className}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-white/50 rounded-full">
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
