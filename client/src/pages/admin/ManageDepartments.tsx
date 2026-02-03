import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useDepartments, useUpdateDepartment } from "@/hooks/use-departments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ManageDepartments() {
  const { data: departments, isLoading } = useDepartments();
  const updateMutation = useUpdateDepartment();
  const { toast } = useToast();

  const handleUpdate = (id: number, content: string, title: string, imageUrl: string) => {
    updateMutation.mutate({ id, content, title, imageUrl });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Manage Departments</h1>
      <div className="space-y-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          departments?.map((dept) => (
            <DepartmentEditor 
              key={dept.id} 
              dept={dept} 
              onSave={handleUpdate} 
              isSaving={updateMutation.isPending}
            />
          ))
        )}
      </div>
    </AdminLayout>
  );
}

function DepartmentEditor({ dept, onSave, isSaving }: { dept: any, onSave: any, isSaving: boolean }) {
  const [content, setContent] = useState(dept.content);
  const [title, setTitle] = useState(dept.title);
  const [imageUrl, setImageUrl] = useState(dept.imageUrl || "");

  const hasChanges = content !== dept.content || title !== dept.title || imageUrl !== (dept.imageUrl || "");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="capitalize">{dept.type} Department</CardTitle>
          <Button 
            onClick={() => onSave(dept.id, content, title, imageUrl)}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
           <label className="text-sm font-medium">Title</label>
           <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
           <label className="text-sm font-medium">Image URL</label>
           <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
           <label className="text-sm font-medium">Content</label>
           <Textarea 
             value={content} 
             onChange={e => setContent(e.target.value)} 
             className="min-h-[200px] font-mono text-sm" 
           />
        </div>
      </CardContent>
    </Card>
  );
}
