import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from "@/hooks/use-achievements";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAchievementSchema } from "@shared/schema";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

export default function ManageAchievements() {
  const { data: achievements, isLoading } = useAchievements();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(insertAchievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      imageUrl: "",
      category: "association",
      active: true,
    }
  });

  const onSubmit = (data: any) => {
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

  const openEdit = (item: any) => {
    setEditingItem(item);
    form.reset({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this achievement?")) deleteMutation.mutate(id);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Achievements</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); form.reset(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Achievement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Achievement" : "New Achievement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register("title")} />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">Legal Victory</SelectItem>
                        <SelectItem value="association">Association Activity</SelectItem>
                        <SelectItem value="post_election">Post-Election Reform</SelectItem>
                        <SelectItem value="legacy">Legacy/History</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea {...form.register("description")} />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input {...form.register("imageUrl")} />
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
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : achievements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date ? format(new Date(item.date), 'MMM yyyy') : '-'}</TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
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
