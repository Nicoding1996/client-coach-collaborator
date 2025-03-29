import asyncHandler from 'express-async-handler'; // Import asyncHandler
import Client from '../models/Client.js';
import Session from '../models/Session.js';
import Invoice from '../models/Invoice.js';
// import Task from '../models/Task.js'; // Import Task model if/when it exists

// Wrap with asyncHandler for error handling consistency
export const getCoachSummary = asyncHandler(async (req, res) => {
  const coachId = req.user._id;

  // Use Promise.all for concurrent fetching
  const [
    clientCount,
    upcomingSessionsCount,
    totalOutstandingResult,
    totalPaidLast30DaysResult,
    recentSessions,
    recentClients
    // tasks // Add tasks promise here if model exists
  ] = await Promise.all([
    Client.countDocuments({ coachId: coachId }), // Make sure schema uses coachId
    Session.countDocuments({ coachId: coachId, sessionDate: { $gte: new Date() } }), // Use sessionDate
    Invoice.aggregate([ // Ensure coachId field exists in Invoice schema
      { $match: { coachId: coachId, status: { $in: ['Pending', 'Overdue', 'Draft'] } } }, // Check for non-paid statuses
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Invoice.aggregate([ // Ensure paidDate field exists and is updated when status is 'Paid'
      { $match: { coachId: coachId, status: 'Paid', /* paidDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } */ } }, // Add paidDate logic if available
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Session.find({ coachId: coachId, sessionDate: { $gte: new Date() } })
           .sort({ sessionDate: 1 }) // Use sessionDate
           .limit(3)
           .populate('clientId', 'name avatar'), // Populate client name/avatar
    Client.find({ coachId: coachId })
          .sort({ updatedAt: -1 }) // Sort by recent update instead of non-existent lastActivity
          .limit(3)
          .select('name email avatar programProgress') // Select specific fields
    // Task.find({ assignedTo: coachId, status: { $ne: 'Done' } }).sort({ dueDate: 1 }).limit(3) // Example Task query
  ]);

  // Extract results safely
  const totalOutstanding = totalOutstandingResult[0]?.total || 0;
  const totalPaidLast30Days = totalPaidLast30DaysResult[0]?.total || 0; // Adjust if paidDate logic added

  res.json({
    clientCount,
    upcomingSessionsCount,
    totalOutstanding,
    totalPaidLast30Days,
    recentSessions,
    recentClients
    // tasks // Add tasks here if fetched
  });
});

// NO module.exports or block export {} needed here