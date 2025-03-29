import React, { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input, Label, Select, DatePicker, Textarea, Button } from '@/components/ui';
import { authAPI } from '@/lib/authAPI';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

interface CreateInvoiceFormProps {
  onSuccess: () => void;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    issueDate: new Date(),
    dueDate: new Date(),
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
    status: 'Draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await authAPI.getClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, lineItems: newLineItems }));
  };

  const calculateTotalAmount = () => {
    return formData.lineItems.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const totalAmount = calculateTotalAmount();
      await authAPI.createInvoice({ ...formData, amount: totalAmount });
      onSuccess();
    } catch (error) {
      setError('Failed to create invoice.');
      console.error('Create invoice error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create Invoice</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {error && <p className="text-red-500">{error}</p>}
        <Label htmlFor="clientId">Client</Label>
        <Select name="clientId" value={formData.clientId} onChange={handleSelectChange} required>
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </Select>
        <Label htmlFor="issueDate">Issue Date</Label>
        <DatePicker selected={formData.issueDate} onChange={(date) => handleDateChange('issueDate', date)} />
        <Label htmlFor="dueDate">Due Date</Label>
        <DatePicker selected={formData.dueDate} onChange={(date) => handleDateChange('dueDate', date)} />
        <Label htmlFor="lineItems">Line Items</Label>
        {formData.lineItems.map((item, index) => (
          <div key={index} className="flex space-x-2">
            <Input
              name="description"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
            />
            <Input
              type="number"
              name="quantity"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
            />
            <Input
              type="number"
              name="price"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleLineItemChange(index, 'price', Number(e.target.value))}
            />
          </div>
        ))}
        <Button type="button" onClick={() => setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, { description: '', quantity: 1, price: 0 }] }))}>
          Add Line Item
        </Button>
        <Label htmlFor="notes">Notes</Label>
        <Textarea name="notes" value={formData.notes} onChange={handleInputChange} />
        <Label htmlFor="status">Status</Label>
        <Select name="status" value={formData.status} onChange={handleSelectChange}>
          <option value="Draft">Draft</option>
          <option value="Pending">Pending</option>
        </Select>
      </DialogContent>
      <DialogFooter>
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Invoice'}</Button>
      </DialogFooter>
    </form>
  );
};

export default CreateInvoiceForm; 