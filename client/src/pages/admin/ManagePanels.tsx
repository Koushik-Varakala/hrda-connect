import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePanels, useCreatePanel, useUpdatePanel, useDeletePanel } from "@/hooks/use-panels";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPanelSchema } from "@shared/schema";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ManagePanels() {
  const { data: panels, isLoading } = usePanels();
  const createMutation = useCreatePanel();
  const updateMutation = useUpdatePanel();
  const deleteMutation = useDeletePanel();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(insertPanelSchema),
    defaultValues: {
      name: "",
      role: "",
      district: "",
      category: "state_executive",
      isStateLevel: false,
      imageUrl: "",
      phone: "",
      active: true,
    }
  });

  const onSubmit = (data: any) => {
    // If state level, district should be null or empty
    if (data.isStateLevel) data.district = null;

    // Auto-set isStateLevel based on category if needed, but keeping manual for flexibility
    if (data.category === 'state_executive' || data.category === 'elected_member') {
      data.isStateLevel = true;
      data.district = null;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data }, {
        onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); form.reset(); }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setIsDialogOpen(false); form.reset(); }
      });
    }
  };

  // ... (keep openEdit, handleDelete)

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Panels</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); form.reset(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Member" : "New Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input {...form.register("name")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input {...form.register("role")} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || "state_executive"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state_executive">State Executive</SelectItem>
                        <SelectItem value="elected_member">Elected Member (Election Panel)</SelectItem>
                        <SelectItem value="district_member">District Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <Controller
                  control={form.control}
                  name="isStateLevel"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <label className="text-sm font-medium">Is State Level? (Overrides Category default)</label>
              </div>

              {!form.watch("isStateLevel") && (
                <div>
                  <label className="text-sm font-medium">District</label>
                  <Input {...form.register("district")} placeholder="e.g. Hyderabad" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input {...form.register("imageUrl")} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register("phone")} />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Update" : "Create"}
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
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : panels?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>
                  <span className="capitalize text-sm text-slate-600">
                    {item.category?.replace('_', ' ') || (item.isStateLevel ? 'State' : 'District')}
                  </span>
                </TableCell>
                <TableCell>{item.district || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
