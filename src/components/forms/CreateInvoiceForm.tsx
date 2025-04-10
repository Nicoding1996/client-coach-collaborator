import React, { useState, useEffect } from 'react';
// Removed Dialog parts from imports
// --- CORRECTED IMPORTS ---
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select parts
import { DatePicker } from "@/components/ui/date-picker"; // Assuming date-picker.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// --- CORRECTED IMPORT ---
import { authAPI } from '@/services/api';

// Define Client Type (ensure it matches GET /clients response, including userId)
interface Client {
  _id: string; // Client record ID
  id?: string; // Fallback
  userId: string; // Linked User ID (MUST be returned by GET /clients)
  name: string;
  avatar?: string; // Include avatar if needed/available
}

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

// Removed onClose prop
interface CreateInvoiceFormProps {
  onSuccess: () => void;
}

// Removed onClose from signature
const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]); // Add type for clients
  const [formData, setFormData] = useState({
    clientId: '',
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default due date 14 days from now
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
    status: 'Draft', // Default status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Assuming getClients returns an array like [{ _id: '...', name: '...' }]
        const data: Client[] = await authAPI.getClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        // Maybe set an error state here
      }
    };
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for Shadcn Select component
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for Shadcn DatePicker component
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) { // Handle potential undefined value from DatePicker
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...formData.lineItems];
    // Ensure quantity and price are numbers
    const numericValue = (field === 'quantity' || field === 'price') ? Number(value) : value;
    newLineItems[index] = { ...newLineItems[index], [field]: numericValue };
    setFormData((prev) => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };


  const calculateTotalAmount = () => {
    return formData.lineItems.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return total + (quantity * price);
     }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
        setError('Please select a client.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      // Find the selected client object from the clients state
      // formData.clientId currently holds the Client Record _id from the dropdown
      const selectedClientObject = clients.find(c => (c._id || c.id) === formData.clientId);

      // Ensure the client object and its userId were found
      if (!selectedClientObject || !selectedClientObject.userId) {
          setError('Selected client is invalid or missing required user ID. Please ensure the client list is loaded correctly.');
          setLoading(false);
          return;
      }

      const totalAmount = calculateTotalAmount();
      // Construct payload using the USER ID from the found client object
      const payload = {
        ...formData,
        clientId: selectedClientObject.userId, // <-- Send USER ID
        amount: totalAmount
      };
      console.log('[CreateInvoice] Sending payload with USER ID as clientId:', payload); // Add log
      await authAPI.createInvoice(payload);
      onSuccess(); // Call the success callback passed from parent
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
      console.error('Create invoice error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed duplicate return and comment
    <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{error}</p>}

        {/* Client Select */}
        <div className="space-y-1">
          <Label htmlFor="clientId">Client *</Label>
          <Select
            value={formData.clientId}
            onValueChange={(value) => handleSelectChange(value, 'clientId')}
            required
          >
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                // Use _id if that's the actual ID field from backend
                <SelectItem key={client._id || client.id} value={client._id || client.id || ''}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <Label htmlFor="issueDate">Issue Date</Label>
             {/* Pass props expected by your DatePicker component */}
             <DatePicker date={formData.issueDate} onDateChange={(date) => handleDateChange('issueDate', date)} />
           </div>
           <div className="space-y-1">
             <Label htmlFor="dueDate">Due Date</Label>
             <DatePicker date={formData.dueDate} onDateChange={(date) => handleDateChange('dueDate', date)} />
           </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <Label>Line Items</Label>
          {formData.lineItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                className="flex-grow"
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                className="w-16"
                min="0"
              />
              <Input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                className="w-24"
                min="0"
                step="0.01"
              />
              {/* Only show remove button if more than one item */}
              {formData.lineItems.length > 1 && (
                 <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>X</Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            Add Line Item
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Optional notes..."/>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
           <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => handleSelectChange(value, 'status')}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              {/* Add other statuses if needed on creation */}
            </SelectContent>
          </Select>
        </div>

        {/* Form fields end before DialogContent closes */}
      {/* Form fields end here */}
      {/* Footer buttons are now handled by the parent */}
    </form>
  );
};

export default CreateInvoiceForm;