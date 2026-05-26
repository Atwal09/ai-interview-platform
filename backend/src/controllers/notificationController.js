'use strict';

const Notification = require('../models/Notification');
const logger = require('../config/logger');

/** GET /api/notifications */
async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.user.id };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    res.json({ success: true, data: { notifications, total, unreadCount } });
  } catch (err) { next(err); }
}

/** PATCH /api/notifications/:id/read */
async function markRead(req, res, next) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
}

/** PATCH /api/notifications/read-all */
async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}

/** DELETE /api/notifications/:id */
async function deleteNotification(req, res, next) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
