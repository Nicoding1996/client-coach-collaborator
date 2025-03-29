import Client from '../models/Client.js';
import Session from '../models/Session.js';
import Invoice from '../models/Invoice.js';

export const getCoachSummary = async (req, res) => {
  try {
    const coachId = req.user._id;

    // Fetch the count of clients assigned to the coach
    const clientCount = await Client.countDocuments({ coach: coachId });

    // Fetch the count of upcoming sessions for the coach
    const upcomingSessionsCount = await Session.countDocuments({ coach: coachId, date: { $gte: new Date() } });

    // Calculate invoice summaries
    const totalOutstanding = await Invoice.aggregate([
      { $match: { coach: coachId, status: { $ne: 'Paid' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaidLast30Days = await Invoice.aggregate([
      { $match: { coach: coachId, status: 'Paid', paidDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Fetch the 3 most recent upcoming sessions
    const recentSessions = await Session.find({ coach: coachId, date: { $gte: new Date() } }).sort({ date: 1 }).limit(3);

    // Fetch brief details of ~3 clients with recent activity or low progress
    const recentClients = await Client.find({ coach: coachId }).sort({ lastActivity: -1 }).limit(3);

    // Fetch ~3 upcoming/overdue tasks assigned to the coach
    // Assuming a Task model exists
    const tasks = []; // Replace with actual query if Task model exists

    res.json({
      clientCount,
      upcomingSessionsCount,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      totalPaidLast30Days: totalPaidLast30Days[0]?.total || 0,
      recentSessions,
      recentClients,
      tasks
    });
  } catch (error) {
    console.error('Error fetching coach summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 