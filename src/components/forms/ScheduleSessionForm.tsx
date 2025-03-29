import { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker'; // Use hyphenated path
import { authAPI } from '@/services/api';

const ScheduleSessionForm = ({ onSuccess }) => {
  const [clientId, setClientId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [focusTopic, setFocusTopic] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sessionData = {
        clientId,
        sessionDate,
        time,
        duration,
        focusTopic,
      };
      await authAPI.createSession(sessionData);
      onSuccess();
    } catch (error) {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Schedule a Session</DialogTitle>
        <DialogDescription>Fill out the form below to schedule a new session.</DialogDescription>
      </DialogHeader>
      <DialogContent>
        <Label htmlFor="client">Client</Label>
        <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="date">Date</Label>
        <DatePicker selected={sessionDate} onChange={setSessionDate} />

        <Label htmlFor="time">Time</Label>
        <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />

        <Label htmlFor="focusTopic">Focus Topic</Label>
        <Input id="focusTopic" value={focusTopic} onChange={(e) => setFocusTopic(e.target.value)} />
      </DialogContent>
      <DialogFooter>
        <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Session'}</Button>
        {error && <p className="text-red-500">{error}</p>}
      </DialogFooter>
    </form>
  );
};

export default ScheduleSessionForm; 