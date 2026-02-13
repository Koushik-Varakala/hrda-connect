"use client";

import { Layout } from "@/components/Layout";
import { useDepartments } from "@/hooks/use-departments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Palette } from "lucide-react";

export default function Departments() {
    const { data: departments, isLoading } = useDepartments();

    return (
        <Layout>
            <div className="bg-slate-50 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-serif font-bold text-center mb-4">Our Departments</h1>
                    <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                        Fostering growth in academics, sports, and culture.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <Tabs defaultValue="academic" className="w-full">
                    <div className="flex justify-center mb-12">
                        <TabsList className="bg-white border shadow-sm">
                            <TabsTrigger value="academic" className="gap-2"><BookOpen className="w-4 h-4" /> Academic</TabsTrigger>
                            <TabsTrigger value="sports" className="gap-2"><Trophy className="w-4 h-4" /> Sports</TabsTrigger>
                            <TabsTrigger value="culture" className="gap-2"><Palette className="w-4 h-4" /> Cultural</TabsTrigger>
                        </TabsList>
                    </div>

                    {['academic', 'sports', 'culture'].map((type) => (
                        <TabsContent key={type} value={type}>
                            <div className="max-w-4xl mx-auto">
                                {isLoading ? (
                                    <div className="text-center">Loading...</div>
                                ) : (
                                    departments
                                        ?.filter(d => d.type === type)
                                        .map(dept => (
                                            <Card key={dept.id} className="mb-8 overflow-hidden">
                                                {dept.imageUrl && (
                                                    <div className="h-64 w-full overflow-hidden">
                                                        <img src={dept.imageUrl} alt={dept.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <CardHeader>
                                                    <CardTitle className="text-2xl">{dept.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="prose prose-slate max-w-none">
                                                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                                                            {dept.content}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                )}
                                {departments?.filter(d => d.type === type).length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-lg text-muted-foreground">
                                        Content coming soon for {type} wing.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </Layout>
    );
}
