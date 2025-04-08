import { useState, useEffect } from 'react';
import type { SessionType } from '@/pages/coach/Sessions'; // Import the actual type
import { DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { authAPI } from '@/services/api';

// Removed local SessionType definition

// Define props interface for type safety
interface ScheduleSessionFormProps {
  onSuccess: (newSession: SessionType) => void; // Pass the new session object
  onClose: () => void;
}

interface Client {
  _id?: string;
  id?: string; // Allow for potential 'id' property
  name: string;
  avatar?: string; // Add optional avatar property
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
    console.log('handleSubmit called'); // Log: Function start
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Log form data before validation
    console.log('Form Data:', { clientId, sessionDate, startTime, endTime, location, notes });
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
      console.log('Submitting to API...'); // Log: Before API call
      const createdSessionResponse = await authAPI.createSession(sessionData); // API expects Date object
      console.log('Session created successfully:', createdSessionResponse);

      // Find client details
      const client = clients.find(c => (c._id || c.id) === clientId);
      const clientName = client ? client.name : 'Unknown Client';
      // Assuming client data might have an avatar property, otherwise default/omit
      const clientAvatar = client?.avatar || undefined; // Access optional property safely

      // Calculate duration (simple example, might need refinement)
      // This requires parsing times, which can be complex.
      // Let's assume the API response includes duration or handle it later if needed.
      // For now, let's set a placeholder or use a value from response if available.
      const duration = createdSessionResponse.duration || 0; // Assuming response has duration

      // Construct the object matching the imported SessionType for optimistic update
      // Ensure all required fields from the imported SessionType are included
      const newSession: SessionType = {
        _id: createdSessionResponse._id,
        clientName: clientName,
        sessionDate: createdSessionResponse.sessionDate, // Use correct property name
        // The imported SessionType might require 'time' and 'type'.
        // We made them optional in Sessions.tsx, so this should be okay.
        // If not, we'll need to adjust the construction here or the type in Sessions.tsx again.
        time: createdSessionResponse.startTime, // Use startTime as placeholder for time if needed
        // Removed startTime and endTime as they are not in SessionType
        duration: duration,
        type: createdSessionResponse.type || 'Default', // Provide a default type or get from response
        notes: createdSessionResponse.notes,
        clientAvatar: clientAvatar,
      };

      onSuccess(newSession); // Pass the constructed object
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
            onDateChange={setSessionDate} // Revert to direct state setter
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

          {/* Buttons moved inside the form */}
          <div className="flex justify-end gap-2 pt-4">
            {error && <p className="text-red-500 text-sm mr-auto">{error}</p>} {/* Error message moved here */}
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={isSubmitDisabled}>{loading ? 'Scheduling...' : 'Schedule Session'}</Button> {/* Removed form attribute, now implicitly part of form */}
          </div>
        </form>
      </DialogContent>
      {/* DialogFooter removed */}
    </>
  );
};

export default ScheduleSessionForm;