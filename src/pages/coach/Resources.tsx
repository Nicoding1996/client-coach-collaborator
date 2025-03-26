
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, Plus, Search, FolderOpen, Share2, MoreHorizontal, FileUp } from "lucide-react";

// Mocked resources data
const resources = [
  {
    id: "1",
    title: "Leadership Development Guide",
    type: "PDF",
    category: "Guides",
    size: "2.4 MB",
    lastUpdated: "2023-05-15",
    shared: true,
  },
  {
    id: "2",
    title: "Coaching Session Template",
    type: "DOCX",
    category: "Templates",
    size: "1.1 MB",
    lastUpdated: "2023-06-20",
    shared: true,
  },
  {
    id: "3", 
    title: "Goal Setting Worksheet",
    type: "PDF",
    category: "Worksheets",
    size: "0.8 MB",
    lastUpdated: "2023-07-05",
    shared: false,
  },
  {
    id: "4",
    title: "Strength Assessment Tool",
    type: "PDF",
    category: "Assessments",
    size: "1.5 MB",
    lastUpdated: "2023-08-10",
    shared: true,
  },
  {
    id: "5",
    title: "Career Transition Roadmap",
    type: "PPTX",
    category: "Presentations",
    size: "4.2 MB",
    lastUpdated: "2023-09-18",
    shared: false,
  },
  {
    id: "6",
    title: "Client Onboarding Checklist",
    type: "PDF",
    category: "Checklists",
    size: "0.5 MB",
    lastUpdated: "2023-10-24",
    shared: true,
  },
];

// Categories for filtering
const categories = [
  "All",
  "Guides",
  "Templates",
  "Worksheets",
  "Assessments",
  "Presentations",
  "Checklists",
];

const CoachResources = () => {
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filter resources based on search query and category
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    
    if (activeTab === "shared") {
      return matchesSearch && matchesCategory && resource.shared;
    }
    
    return matchesSearch && matchesCategory;
  });
  
  // Function to get icon based on file type
  const getFileIcon = (type: string) => {
    switch(type) {
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Manage and share your coaching documents and materials
          </p>
        </div>
        <Button>
          <FileUp className="mr-2 h-4 w-4" />
          Upload New Resource
        </Button>
      </div>
      
      <Tabs defaultValue="library" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="library">My Library</TabsTrigger>
            <TabsTrigger value="shared">Shared Resources</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pb-4">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        <TabsContent value="library" className="space-y-6">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No resources found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or upload a new resource
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Upload New Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="transition hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      {getFileIcon(resource.type)}
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
                    <CardDescription>
                      Added on {new Date(resource.lastUpdated).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm">
                      <Badge variant="outline">{resource.type}</Badge>
                      <span className="text-muted-foreground">{resource.size}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.shared).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Share2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No shared resources</h3>
                <p className="text-muted-foreground mt-1">
                  You haven't shared any resources with your clients yet
                </p>
                <Button className="mt-4">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Resources
                </Button>
              </div>
            ) : (
              filteredResources
                .filter(r => r.shared)
                .map((resource) => (
                  <Card key={resource.id} className="transition hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        {getFileIcon(resource.type)}
                        <Badge variant="success">Shared</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
                      <CardDescription>
                        Shared on {new Date(resource.lastUpdated).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm">
                        <Badge variant="outline">{resource.type}</Badge>
                        <span className="text-muted-foreground">{resource.size}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.category === "Templates").length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No templates found</h3>
                <p className="text-muted-foreground mt-1">
                  Create reusable templates for your coaching practice
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            ) : (
              filteredResources
                .filter(r => r.category === "Templates")
                .map((resource) => (
                  <Card key={resource.id} className="transition hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        {getFileIcon(resource.type)}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
                      <CardDescription>
                        Updated on {new Date(resource.lastUpdated).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm">
                        <Badge variant="outline">{resource.type}</Badge>
                        <span className="text-muted-foreground">{resource.size}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachResources;
