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
import { Pencil, Trash2, Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

export default function ManageAchievements() {
  const { data: achievements, isLoading } = useAchievements();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(insertAchievementSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().split('T')[0],
      category: "association",
      active: true,
    }
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (data.date) formData.append("date", data.date);
    formData.append("category", data.category);
    formData.append("active", String(data.active));

    if (file) {
      formData.append("image", file);
    } else if (editingItem && data.imageUrl) {
      formData.append("imageUrl", data.imageUrl);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData }, {
        onSuccess: () => { handleClose(); }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { handleClose(); }
      });
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFile(null);
    setPreviewUrl(null);
    form.reset();
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setPreviewUrl(item.imageUrl);
    form.reset({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
    });
    setIsDialogOpen(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("imageUrl", "/uploads/placeholder");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this achievement?")) deleteMutation.mutate(id);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'association': return 'Association';
      case 'legal': return 'Legal Victory';
      case 'post_election': return 'Post Election';
      case 'legacy': return 'Legacy';
      default: return cat;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Achievements</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Achievement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Achievement" : "New Achievement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register("title")} placeholder="Title" />
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
                        <SelectItem value="association">Association Achievement</SelectItem>
                        <SelectItem value="legal">Legal Victory</SelectItem>
                        <SelectItem value="post_election">Post Election</SelectItem>
                        <SelectItem value="legacy">Legacy (Election Victory)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea {...form.register("description")} placeholder="Details..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>

                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {previewUrl ? (
                    <div className="relative w-full">
                      <img src={previewUrl} alt="Preview" className="h-40 w-full object-contain rounded-md" />
                      <div className="text-center mt-2">
                        <p className="text-sm text-emerald-600 font-medium">
                          {file ? "New Image Selected" : "Current Image"}
                        </p>
                        <p className="text-xs text-muted-foreground">Tap to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Tap to upload image</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
                <input type="hidden" {...form.register("imageUrl")} />
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <Input type="date" {...form.register("date")} />
              </div>

              <div className="flex items-center gap-2 py-2">
                <Controller
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <label className="text-sm font-medium">Active (Visible)</label>
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
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : achievements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-10 w-auto object-contain rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                <TableCell><span className="capitalize">{getCategoryLabel(item.category)}</span></TableCell>
                <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {item.active ? 'Active' : 'Hidden'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {achievements?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground p-8">No achievements found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
