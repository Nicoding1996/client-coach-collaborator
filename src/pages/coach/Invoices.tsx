
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, FileText, Plus, Search, Filter, ArrowUpDown, Download, Eye, CreditCard } from "lucide-react";

// Mocked invoices data
const invoices = [
  {
    id: "INV-001",
    client: "Emma Wilson",
    amount: 350.00,
    date: "2023-05-10",
    dueDate: "2023-05-24",
    status: "paid",
    items: [
      { description: "Coaching Session (60 min)", qty: 2, rate: 150, amount: 300 },
      { description: "Assessment Materials", qty: 1, rate: 50, amount: 50 }
    ]
  },
  {
    id: "INV-002",
    client: "David Chen",
    amount: 450.00,
    date: "2023-06-05",
    dueDate: "2023-06-19",
    status: "paid",
    items: [
      { description: "Coaching Session (90 min)", qty: 3, rate: 150, amount: 450 }
    ]
  },
  {
    id: "INV-003",
    client: "Sophie Martin",
    amount: 275.00,
    date: "2023-07-12",
    dueDate: "2023-07-26",
    status: "pending",
    items: [
      { description: "Coaching Session (60 min)", qty: 1, rate: 150, amount: 150 },
      { description: "Career Development Materials", qty: 1, rate: 125, amount: 125 }
    ]
  },
  {
    id: "INV-004",
    client: "Michael Johnson",
    amount: 600.00,
    date: "2023-08-03",
    dueDate: "2023-08-17",
    status: "overdue",
    items: [
      { description: "Executive Coaching Package", qty: 1, rate: 600, amount: 600 }
    ]
  },
  {
    id: "INV-005",
    client: "Lisa Brown",
    amount: 200.00,
    date: "2023-09-21",
    dueDate: "2023-10-05",
    status: "draft",
    items: [
      { description: "Coaching Session (60 min)", qty: 1, rate: 150, amount: 150 },
      { description: "Leadership Assessment", qty: 1, rate: 50, amount: 50 }
    ]
  }
];

const CoachInvoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter invoices based on search query and active tab
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") {
      return matchesSearch;
    } else {
      return matchesSearch && invoice.status === activeTab;
    }
  });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage billing and track payments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        
          <TabsContent value="all" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>Overview of your invoicing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                    <h3 className="text-2xl font-bold mt-1">$875.00</h3>
                    <p className="text-xs text-muted-foreground mt-1">3 invoices</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <h3 className="text-2xl font-bold mt-1 text-destructive">$600.00</h3>
                    <p className="text-xs text-muted-foreground mt-1">1 invoice</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Paid (Last 30 days)</p>
                    <h3 className="text-2xl font-bold mt-1 text-green-600">$800.00</h3>
                    <p className="text-xs text-muted-foreground mt-1">2 invoices</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Draft</p>
                    <h3 className="text-2xl font-bold mt-1">$200.00</h3>
                    <p className="text-xs text-muted-foreground mt-1">1 invoice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Invoices</CardTitle>
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No invoices found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search or create a new invoice
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">
                            <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                              Invoice
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                              Client
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                              Amount
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                              Date
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                              Due Date
                              <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.client}</TableCell>
                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                                {invoice.status === "pending" && (
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500">
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="draft" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {filteredInvoices.filter(i => i.status === "draft").length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No draft invoices</h3>
                    <p className="text-muted-foreground mt-1">
                      Create a draft invoice to get started
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Draft
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices
                          .filter(i => i.status === "draft")
                          .map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.id}</TableCell>
                              <TableCell>{invoice.client}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {filteredInvoices.filter(i => i.status === "pending").length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No pending invoices</h3>
                    <p className="text-muted-foreground mt-1">
                      All invoices have been paid or are in draft status
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices
                          .filter(i => i.status === "pending")
                          .map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.id}</TableCell>
                              <TableCell>{invoice.client}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="paid" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {filteredInvoices.filter(i => i.status === "paid").length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No paid invoices</h3>
                    <p className="text-muted-foreground mt-1">
                      No payments have been recorded yet
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices
                          .filter(i => i.status === "paid")
                          .map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.id}</TableCell>
                              <TableCell>{invoice.client}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {filteredInvoices.filter(i => i.status === "overdue").length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No overdue invoices</h3>
                    <p className="text-muted-foreground mt-1">
                      All invoices are paid or within due date
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices
                          .filter(i => i.status === "overdue")
                          .map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.id}</TableCell>
                              <TableCell>{invoice.client}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachInvoices;
