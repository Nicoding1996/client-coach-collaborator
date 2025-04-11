import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, FileText, Plus, Search, Filter, ArrowUpDown, Download, Eye, CreditCard } from "lucide-react";
import { authAPI } from "@/services/api"; 
// Import DialogHeader and DialogTitle as well
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateInvoiceForm from '@/components/forms/CreateInvoiceForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Remove Client interface if not used elsewhere in this file

// Define ClientUser type for populated clientId field
interface ClientUser {
  _id: string; // User ID
  name: string;
  avatar?: string;
  email?: string; // Include email if populated by backend
}

// Corrected InvoiceType expecting populated clientId
// Define ClientUser type for populated clientId field
interface ClientUser {
  _id: string; // User ID
  name: string;
  avatar?: string;
  email?: string; // Include email if populated by backend
}

// Corrected InvoiceType expecting populated clientId
interface InvoiceType {
  _id: string;
  invoiceNumber?: string;
  clientId: ClientUser | null; // Expect populated User object
  // clientName is removed, use clientId.name
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  lineItems?: { description: string; quantity: number; price: number }[];
  notes: string;
}

const CoachInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]); // Use updated type
  // Remove clients state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<InvoiceType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState(false);
  
  const handleInvoiceCreated = () => {
    setIsDialogOpen(false);
    fetchInvoices();
  };

  // Fetch invoices (backend now populates client)
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Fetch invoices - clientId is now populated by the backend
      const invoicesData = await authAPI.getInvoices();
      console.log("[Fetch] Raw Invoices from API (populated):", invoicesData);

      // Explicitly map and type the incoming data to match InvoiceType
      // Use 'any' for the input `inv` if the exact API response type isn't defined elsewhere,
      // but ensure the output of the map conforms to InvoiceType.
      const processedInvoices: InvoiceType[] = invoicesData.map((inv): InvoiceType => { // Remove : any
          const clientIdPopulated: ClientUser | null = (inv.clientId && typeof inv.clientId === 'object' && inv.clientId._id)
              ? {
                  _id: inv.clientId._id,
                  name: inv.clientId.name || 'Unknown Client', // Fallback name
                  avatar: inv.clientId.avatar,
                  email: inv.clientId.email
              }
              : null; // Set to null if not populated correctly

          // Return an object strictly conforming to InvoiceType
          return {
              _id: inv._id, // Assuming _id always exists
              invoiceNumber: inv.invoiceNumber,
              clientId: clientIdPopulated, // Assign the processed object or null
              issueDate: inv.issueDate,
              dueDate: inv.dueDate,
              amount: inv.amount,
              status: inv.status,
              lineItems: inv.lineItems,
              notes: inv.notes
          };
      // Filter out any potential malformed entries if necessary, though the map should handle defaults
      }).filter(inv => !!inv._id); // Ensure _id is present

      console.log("[Fetch] Processed Invoices for state (safe map):", processedInvoices);
      setInvoices(processedInvoices);

    } catch (error) {
      console.error("Failed to fetch invoices or clients:", error);
      // Add toast notification for user
      // toast.error("Failed to load invoice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);
  
  // Filter invoices based on search query and active tab
  const filteredInvoices = invoices.filter((invoice: InvoiceType) => { // Add type annotation
    // Use optional chaining and provide default empty string for safety
    // Search by invoice number OR client name
    const invoiceNumMatch = invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    // Use populated clientId.name
    const clientNameMatch = invoice.clientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    const matchesSearch = invoiceNumMatch || clientNameMatch;
    
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
  
  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      // Optimistically update the UI
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice: InvoiceType) => // Add type
          invoice._id === invoiceId ? { ...invoice, status: newStatus } : invoice // Correct: uses _id
        )
      );

      // Call the API to update the status
      await authAPI.updateInvoice(invoiceId, { status: newStatus });

      // Show success toast
      console.log('Status updated successfully');
    } catch (error) {
      // Revert the optimistic update
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice: InvoiceType) => // Add type
          invoice._id === invoiceId ? { ...invoice, status: invoice.status } : invoice // Correct: uses _id
        )
      );

      // Show error toast
      console.error('Failed to update status:', error);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setLoadingInvoiceDetails(true);
    try {
      const invoiceData = await authAPI.getInvoiceById(invoiceId);
      setSelectedInvoiceData(invoiceData);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
    } finally {
      setLoadingInvoiceDetails(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {loading ? (
        <p>Loading invoices...</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground mt-1">
                Manage billing and track payments
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {/* Add DialogHeader, render form, add DialogFooter */}
            <DialogContent>
              <DialogHeader>
                 <DialogTitle>Create Invoice</DialogTitle>
                 {/* Optional: Add DialogDescription here */}
              </DialogHeader>
              {/* Render form - remove onClose prop */}
              <CreateInvoiceForm onSuccess={handleInvoiceCreated} />
              {/* Add Footer with buttons */}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                {/* Add loading state if needed */}
                <Button type="submit" form="create-invoice-form">Create Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
                              <TableHead>
                                <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                                  Amount
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </TableHead>
                              <TableHead>
                                <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                                  Status
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </TableHead>
                              <TableHead>
                                <Button variant="ghost" className="p-0 h-auto font-medium flex items-center">
                                  Actions
                                </Button>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* Add type annotation */}
                            {filteredInvoices.map((invoice: InvoiceType) => (
                              // Use _id for the key
                              <TableRow key={invoice._id}>
                                {/* Display invoiceNumber or fallback to _id */}
                                <TableCell>{invoice.invoiceNumber || invoice._id}</TableCell>
                                {/* Display populated client name */}
                                <TableCell>{invoice.clientId?.name || 'Unknown Client'}</TableCell>
                                <TableCell>{invoice.issueDate}</TableCell>
                                <TableCell>{invoice.dueDate}</TableCell>
                                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Select
                                    // Use _id for handleStatusChange
                                    defaultValue={invoice.status}
                                    onValueChange={(newStatus) => handleStatusChange(invoice._id, newStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Draft">Draft</SelectItem>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Paid">Paid</SelectItem>
                                      <SelectItem value="Overdue">Overdue</SelectItem>
                                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {/* Use _id for handleViewInvoice */}
                                  <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice._id)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
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
                              .map((invoice: InvoiceType) => ( // Add type
                                <TableRow key={invoice._id}>
                                  <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                                  <TableCell>{invoice.clientId?.name || 'Unknown Client'}</TableCell>
                                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
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
                              .map((invoice: InvoiceType) => ( // Add type
                                <TableRow key={invoice._id}>
                                  <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                                  <TableCell>{invoice.clientId?.name || 'Unknown Client'}</TableCell>
                                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
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
                              .map((invoice: InvoiceType) => ( // Add type
                                <TableRow key={invoice._id}>
                                  <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                                  <TableCell>{invoice.clientId?.name || 'Unknown Client'}</TableCell>
                                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
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
                              .map((invoice: InvoiceType) => ( // Add type
                                <TableRow key={invoice._id}>
                                  <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                                  <TableCell>{invoice.clientId?.name || 'Unknown Client'}</TableCell>
                                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
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
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
              {loadingInvoiceDetails ? (
                <p>Loading invoice details...</p>
              ) : selectedInvoiceData ? (
                <div>
                  {/* Use invoiceNumber or _id, and clientName */}
                  <h2>Invoice #{selectedInvoiceData.invoiceNumber || selectedInvoiceData._id}</h2>
                  {/* Use populated client name */}
                  <p>Client: {selectedInvoiceData.clientId?.name || 'Unknown Client'}</p>
                  <p>Issue Date: {selectedInvoiceData.issueDate}</p>
                  <p>Due Date: {selectedInvoiceData.dueDate}</p>
                  <p>Status: {selectedInvoiceData.status}</p>
                  <p>Amount: ${selectedInvoiceData.amount.toFixed(2)}</p>
                  {selectedInvoiceData.lineItems && (
                    <div>
                      <h3>Line Items:</h3>
                      <ul>
                        {selectedInvoiceData.lineItems.map((item, index) => (
                          <li key={index}>{item.description} - {item.quantity} x ${item.price.toFixed(2)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p>Notes: {selectedInvoiceData.notes}</p>
                </div>
              ) : (
                <p>No invoice details available.</p>
              )}
            </DialogContent>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default CoachInvoices;
