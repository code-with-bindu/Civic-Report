/**
 * socket.js — Socket.io event handlers for real-time updates
 */

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join user to a room based on their ID
    socket.on('join', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`📌 User ${userId} joined their room`);
    });

    // Listen for issue verification
    socket.on('issueVerified', (data) => {
      console.log(`✅ Issue verified:`, data.ticketId);
      // Broadcast to all connected clients
      io.emit('issueVerificationUpdated', data);
    });

    // Listen for issue assignment
    socket.on('issueAssigned', (data) => {
      console.log(`📋 Issue assigned:`, data.ticketId);
      // Broadcast to user and officials
      io.to(`user-${data.citizeId}`).emit('issueAssignmentNotification', data);
      io.emit('issueAssignmentUpdated', data);
    });

    // Listen for issue status update
    socket.on('issueStatusUpdated', (data) => {
      console.log(`🔧 Issue status updated:`, data.ticketId);
      // Broadcast to all users
      io.emit('issueStatusChange', data);
    });

    // Listen for new issue creation
    socket.on('issueCreated', (data) => {
      console.log(`🆕 Issue created:`, data.ticketId);
      // Broadcast to all users
      io.emit('newIssueAlert', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });
};

module.exports = setupSocketHandlers;
