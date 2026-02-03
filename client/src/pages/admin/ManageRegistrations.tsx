import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegistrationsList, useUpdateRegistration } from "@/hooks/use-registrations";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Pencil } from "lucide-react";

export default function ManageRegistrations() {
  const { data: registrations, isLoading } = useRegistrationsList();
  const updateMutation = useUpdateRegistration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      tgmcId: "",
      status: "",
    }
  });

  const onSubmit = (data: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data }, {
        onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); form.reset(); }
      });
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Registrations</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Registration</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input {...form.register("firstName")} placeholder="First Name" />
                <Input {...form.register("lastName")} placeholder="Last Name" />
              </div>
              <Input {...form.register("email")} placeholder="Email" />
              <Input {...form.register("phone")} placeholder="Phone" />
              <Input {...form.register("tgmcId")} placeholder="TGMC ID" />
              
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_verification">Pending Verification</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                Update Registration
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>TGMC ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : registrations?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.firstName} {item.lastName}</TableCell>
                <TableCell>{item.tgmcId || '-'}</TableCell>
                <TableCell>
                  <div className="text-sm">{item.phone}</div>
                  <div className="text-xs text-muted-foreground">{item.email}</div>
                </TableCell>
                <TableCell>
                   <span className={`px-2 py-1 rounded text-xs capitalize ${
                      item.status === 'verified' ? 'bg-green-100 text-green-700' : 
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                   }`}>
                     {item.status?.replace('_', ' ')}
                   </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
