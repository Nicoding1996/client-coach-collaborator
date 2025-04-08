import { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { authAPI } from '@/services/api';

// Define props interface for type safety
interface ScheduleSessionFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface Client {
  _id?: string;
  id?: string; // Allow for potential 'id' property
  name: string;
}


const ScheduleSessionForm: React.FC<ScheduleSessionFormProps> = ({ onSuccess, onClose }) => {
  const [clientId, setClientId] = useState('');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data: Client[] = await authAPI.getClients();
        setClients(data);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
        setError('Failed to load client list.'); // Inform user
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure sessionDate is defined before proceeding
    if (!clientId || !sessionDate || !startTime || !endTime || !location) {
       setError("Please fill in all required fields.");
       setLoading(false);
       return;
    }

    try {
      const sessionData = {
       clientId,
       sessionDate, // Pass Date object directly
       startTime,
       endTime,
       location,
       notes,
      };
      console.log('Submitting sessionData:', sessionData);
      await authAPI.createSession(sessionData); // API expects Date object
      console.log('Session created successfully');
      onSuccess();
    } catch (err: unknown) { // Use unknown type for the error
      console.error('Failed to create session:', err);
      // Type guard to safely access error message
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(`Failed to create session: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = loading || !clientId || !sessionDate || !startTime || !endTime || !location;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule a Session</DialogTitle>
        <DialogDescription>Fill out the form below to schedule a new session.</DialogDescription>
      </DialogHeader>
      <DialogContent className="grid gap-4 py-4"> {/* Apply grid to DialogContent */}
        {/* Date Picker - Moved outside form */}
        <div>
          <Label htmlFor="date">Date</Label>
          <DatePicker
            date={sessionDate}
            onDateChange={(newDate) => {
              console.log('DatePicker onDateChange triggered with:', newDate); // Log the date change
              setSessionDate(newDate);
            }}
          />
        </div>
        <form id="schedule-session-form" onSubmit={handleSubmit} className="grid gap-4"> {/* Remove py-4 from form */}
          {/* Client Selection */}
          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  .filter((client) => (client._id || client.id))
                  .map((client) => {
                    const currentClientId = client._id || client.id;
                    return (
                      <SelectItem key={currentClientId} value={currentClientId!}>{client.name}</SelectItem>
                    );
                })}
              </SelectContent>
            </Select>
          </div>


          {/* Start Time */}
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>

          {/* End Time */}
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Online, Office" required/>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional session notes" />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" form="schedule-session-form" disabled={isSubmitDisabled}>{loading ? 'Scheduling...' : 'Schedule Session'}</Button>
      </DialogFooter>
    </>
  );
};

export default ScheduleSessionForm;