import Notification from "../models/Notification.js";

export async function createNotifications(userIds, message, type = "warning") {
  const uniqueUserIds = Array.from(new Set((userIds || []).map((id) => String(id)).filter(Boolean)));
  if (uniqueUserIds.length === 0) return [];

  return Notification.insertMany(
    uniqueUserIds.map((userId) => ({
      userId,
      message,
      type
    }))
  );
}
