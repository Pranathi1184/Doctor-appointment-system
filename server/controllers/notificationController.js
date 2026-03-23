import Notification from "../models/Notification.js";

export async function getMyNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return res.json({ notifications });
}

export async function markMyNotificationsRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
  return res.json({ message: "Notifications marked as read" });
}
