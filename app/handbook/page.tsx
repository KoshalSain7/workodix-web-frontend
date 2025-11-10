"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handbookApi } from "@/lib/api";
import { BookOpen, FileText, Download } from "lucide-react";

export default function HandbookPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadDocuments();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await handbookApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await handbookApi.getDocuments(selectedCategory);
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">HR Handbook</h1>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No documents found</p>
              <p className="text-sm text-muted-foreground">
                There are no handbook documents available at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {doc.category} • {doc.viewCount} views
                    </span>
                    {doc.fileUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

