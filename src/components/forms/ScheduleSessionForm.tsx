import { useState, useEffect } from 'react';
import { differenceInMinutes, parse, format } from 'date-fns'; // Import date-fns functions
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
  onSuccess: (newOrUpdatedSession: SessionType) => void; // Pass the session object
  onClose: () => void;
  initialData?: SessionType | null; // Add optional initialData prop for editing
}

interface Client {
  _id?: string;
  id?: string; // Allow for potential 'id' property
  userId: string; // Add userId (should be required, linked User ID)
  name: string;
  avatar?: string; // Add optional avatar property
}


const ScheduleSessionForm: React.FC<ScheduleSessionFormProps> = ({ onSuccess, onClose, initialData }) => {
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

  // Effect to pre-fill form when editing (initialData changes)
  useEffect(() => {
    if (initialData) {
      // Need to find the clientId from the initialData if it's not directly available
      // Assuming initialData might have clientId directly or nested within client object
      // Rely on the clientId property from the SessionType interface
      const initialClientId = initialData.clientId;
      setClientId(initialClientId || ''); // Set to empty string if clientId is missing/undefined in initialData
      setSessionDate(initialData.sessionDate ? new Date(initialData.sessionDate) : undefined);
      setStartTime(initialData.startTime || '');
      setEndTime(initialData.endTime || '');
      setLocation(initialData.location || '');
      setNotes(initialData.notes || '');
    } else {
      // Reset form if initialData is null/undefined (e.g., switching from edit to add)
      setClientId('');
      setSessionDate(undefined);
      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const isEditing = !!initialData; // Check if we are editing
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
      // Find the full client object from state using the selected clientId (_id of client record)
      const selectedClientObject = clients.find(c => (c._id || c.id) === clientId);

      if (!selectedClientObject) {
        setError("Selected client not found. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const sessionData = {
        // Send the USER ID associated with the selected client record
        clientId: selectedClientObject.userId,
        sessionDate, // Pass Date object directly
        startTime,
        endTime,
        location,
        notes,
      };
      // Add a log to verify
      console.log('[Form Submit] Sending sessionData with USER ID as clientId:', sessionData);
      console.log('Submitting to API...'); // Log: Before API call
      let responseData;
      if (isEditing) {
        console.log('Updating session:', initialData._id, sessionData);
        // Ensure you have an updateSession function in authAPI
        responseData = await authAPI.updateSession(initialData._id, sessionData);
        console.log('Session updated successfully:', responseData);
      } else {
        console.log('Creating session:', sessionData);
        responseData = await authAPI.createSession(sessionData);
        console.log('Session created successfully:', responseData);
      }

      // Find client details based on CURRENT form state clientId
      const client = clients.find(c => (c._id || c.id) === clientId); // Use clientId from state
      const clientName = client ? client.name : 'Unknown Client';
      const clientAvatar = client?.avatar || undefined;

      // Prioritize response data for backend-managed fields, fallback carefully
      const finalSessionDate = responseData.sessionDate || (sessionData.sessionDate ? sessionData.sessionDate.toISOString() : new Date().toISOString()); // Ensure a valid date string
      const finalStartTime = responseData.startTime || sessionData.startTime;
      const finalEndTime = responseData.endTime || sessionData.endTime;
      const finalLocation = responseData.location || sessionData.location;
      // Calculate duration from startTime and endTime state
      let calculatedDuration: number | undefined = undefined;
      if (sessionDate && startTime && endTime) {
        try {
          // Create Date objects using the sessionDate and the time strings
          const startDateTime = parse(`${format(sessionDate, 'yyyy-MM-dd')} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
          const endDateTime = parse(`${format(sessionDate, 'yyyy-MM-dd')} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

          if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
            calculatedDuration = differenceInMinutes(endDateTime, startDateTime);
             // Handle cases where end time is on the next day (optional, depends on requirements)
             if (calculatedDuration < 0) {
               calculatedDuration += 24 * 60; // Add 24 hours in minutes
             }
          }
        } catch (parseError) {
          console.error("Error calculating duration:", parseError);
        }
      }
      const finalDuration = calculatedDuration; // Use calculated duration
      const finalType = responseData.type !== undefined ? responseData.type : (initialData?.type); // Keep optional

      // Ensure selectedClientObject is available here as well
      const resultSession: SessionType = {
        _id: responseData._id || initialData!._id, // Need initialData._id if editing
        // Use the User ID for the optimistic update object as well
        clientId: selectedClientObject.userId,
        clientName: clientName, // This should be correct based on selectedClientObject
        sessionDate: finalSessionDate,
        startTime: finalStartTime,
        endTime: finalEndTime,
        // time: finalStartTime, // Keep time optional or remove if not needed
        duration: finalDuration, // Assign optional duration
        type: finalType,         // Assign optional type
        location: finalLocation,
        notes: notes, // Use notes directly from form state
        clientAvatar: clientAvatar,
      };

      // Log removed
      onSuccess(resultSession); // Pass the constructed object
    } catch (err: unknown) { // Use unknown type for the error
      console.error('Failed to create session:', err);
      // Type guard to safely access error message
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(`Failed to ${isEditing ? 'update' : 'create'} session: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = loading || !clientId || !sessionDate || !startTime || !endTime || !location;

  return (
    <>
      <DialogHeader>
        {/* DialogTitle removed as per request */}
        {/* DialogDescription removed as per request */}
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
            <Button type="submit" disabled={isSubmitDisabled}>{loading ? (initialData ? 'Updating...' : 'Scheduling...') : (initialData ? 'Update Session' : 'Schedule Session')}</Button>
          </div>
        </form>
      </DialogContent>
      {/* DialogFooter removed */}
    </>
  );
};

export default ScheduleSessionForm;