import React, { useState, useEffect, useMemo } from "react"; // Import useEffect, useMemo
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, Filter, CreditCard, Plus, Eye, ArrowUpDown } from "lucide-react"; // Consolidate Lucide imports
import { authAPI } from "@/services/api"; // Import API service
import { useWebSocket } from "@/contexts/WebSocketContext"; // Import WebSocket hook
import { toast } from 'sonner'; // Import toast for WS notifications
// Remove duplicate import

// Define InvoiceType and related types
interface CoachUser { // For populated coachId
  _id: string;
  name: string;
  avatar?: string;
}

interface InvoiceType {
  _id: string;
  invoiceNumber?: string;
  coachId: CoachUser | null; // Expect populated Coach object
  clientId: string; // Client's own User ID (string)
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string; // e.g., 'Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled'
  lineItems?: { description: string; quantity: number; price: number }[];
  notes: string;
}

// Removed Mock Data

const ClientInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]); // Use InvoiceType
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { socket } = useWebSocket(); // Get socket

  // Fetch Invoices Effect
  useEffect(() => {
    const fetchClientInvoices = async () => {
      setLoading(true);
      try {
        // Clients fetch their own invoices, API handles filtering
        const data = await authAPI.getInvoices();
        console.log('[Client Invoices] API Response:', data);
        // Assuming backend populates coachId correctly
        setInvoices(data as InvoiceType[]); // Use type assertion if confident
      } catch (error) {
        console.error("Failed to fetch client invoices:", error);
        // toast.error("Failed to load your invoices.");
      } finally {
        setLoading(false);
      }
    };
    fetchClientInvoices();
  }, []); // Run only on mount

  // WebSocket Listeners Effect
  useEffect(() => {
    if (socket) {
      console.log('[WS Client Invoices] Setting up listeners...');

      const handleInvoiceCreated = (newInvoice: InvoiceType) => {
        console.log('[WS Client Invoices] Invoice Created:', newInvoice);
        setInvoices(prev => [...prev, newInvoice]);
        toast.info(`New invoice #${newInvoice.invoiceNumber || newInvoice._id} received.`);
      };

      const handleInvoiceUpdated = (updatedInvoice: InvoiceType) => {
        console.log('[WS Client Invoices] Invoice Updated:', updatedInvoice);
        setInvoices(prev => prev.map(inv => inv._id === updatedInvoice._id ? updatedInvoice : inv));
        toast.info(`Invoice #${updatedInvoice.invoiceNumber || updatedInvoice._id} updated.`);
      };

      const handleInvoiceDeleted = (data: { invoiceId: string }) => {
        console.log('[WS Client Invoices] Invoice Deleted:', data.invoiceId);
        setInvoices(prev => prev.filter(inv => inv._id !== data.invoiceId));
        toast.info(`An invoice was deleted.`);
      };

      // Replace with actual backend event names if different
      socket.on('invoice_created', handleInvoiceCreated);
      socket.on('invoice_updated', handleInvoiceUpdated);
      socket.on('invoice_deleted', handleInvoiceDeleted);

      return () => {
        console.log('[WS Client Invoices] Cleaning up listeners...');
        socket.off('invoice_created', handleInvoiceCreated);
        socket.off('invoice_updated', handleInvoiceUpdated);
        socket.off('invoice_deleted', handleInvoiceDeleted);
      };
    } else {
      console.log('[WS Client Invoices] Socket not available yet.');
    }
  }, [socket]);

  // Filter invoices based on search query (useMemo for efficiency)
  const filteredInvoices = useMemo(() => {
      return invoices.filter((invoice) => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        // Use optional chaining and check populated coachId.name
        return (
          (invoice.invoiceNumber?.toLowerCase() || '').includes(lowerCaseQuery) ||
          (invoice.coachId?.name?.toLowerCase() || '').includes(lowerCaseQuery) ||
          (invoice.notes?.toLowerCase() || '').includes(lowerCaseQuery) || // Added notes search
          (invoice.lineItems?.some(item => item.description?.toLowerCase().includes(lowerCaseQuery)) || false) // Added line item search
        );
      });
  }, [invoices, searchQuery]);
  
  // Calculate summaries using useMemo
  const { paidInvoices, unpaidInvoices, totalPaid, totalUnpaid } = useMemo(() => {
    const paid = filteredInvoices.filter(inv => inv.status?.toLowerCase() === "paid");
    // Define unpaid more broadly (e.g., Pending, Overdue)
    const unpaid = filteredInvoices.filter(inv => inv.status?.toLowerCase() !== "paid" && inv.status?.toLowerCase() !== "cancelled" && inv.status?.toLowerCase() !== "draft");
    const paidTotal = paid.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const unpaidTotal = unpaid.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    return { paidInvoices: paid, unpaidInvoices: unpaid, totalPaid: paidTotal, totalUnpaid: unpaidTotal };
  }, [filteredInvoices]);
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {loading ? (
         <p>Loading invoices...</p>
      ) : (
        // Ensure the content is wrapped correctly in a fragment or div
        <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your coaching invoices
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paid Invoices</CardTitle>
            <CardDescription>Total amount paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Unpaid Invoices</CardTitle>
            <CardDescription>Total amount due</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUnpaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice: InvoiceType) => ( // Add type
                      // Use _id for key
                      <TableRow key={invoice._id}>
                        {/* Use invoiceNumber or _id */}
                        <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                        {/* Use issueDate */}
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        {/* Use notes or line item description */}
                        <TableCell>{invoice.notes || invoice.lineItems?.[0]?.description || 'N/A'}</TableCell>
                        {/* Use populated coach name */}
                        <TableCell>{invoice.coachId?.name || 'N/A'}</TableCell>
                        <TableCell>${(invoice.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {/* Use status for badge variant logic */}
                          <Badge variant={invoice.status?.toLowerCase() === "paid" ? "success" : invoice.status?.toLowerCase() === "overdue" ? "destructive" : "outline"}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unpaid">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No unpaid invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    unpaidInvoices.map((invoice: InvoiceType) => ( // Add type
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.notes || invoice.lineItems?.[0]?.description || 'N/A'}</TableCell>
                        <TableCell>{invoice.coachId?.name || 'N/A'}</TableCell>
                        <TableCell>${(invoice.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {/* Use status, Badge variant might need adjustment */}
                          <Badge variant={invoice.status?.toLowerCase() === "overdue" ? "destructive" : "outline"}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No paid invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paidInvoices.map((invoice: InvoiceType) => ( // Add type
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.notes || invoice.lineItems?.[0]?.description || 'N/A'}</TableCell>
                        <TableCell>{invoice.coachId?.name || 'N/A'}</TableCell>
                        <TableCell>${(invoice.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="success">{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </> // Close the fragment for the non-loading state
      )} {/* Close loading check */}
    </div>
  );
};

export default ClientInvoices;
