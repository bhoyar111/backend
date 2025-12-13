import Notification from "../models/notification.js";
import User from "../models/users.js";

import { sendEmail } from "../utils/emailSend/sendMail.js";
import { sendPushNotification } from "../utils/pushNoti/firebaseNotification.js";

export const createAndSendNotification = async ({
  io,                 // Pass io explicitly from controller/service
  toEmail,
  recipientRole,
  type,
  recipientId,
  title,
  message,
  metaData = {},
  channels = ["email", "push"],
  createdBy,
  emailTemplateName,
  emailContent = {},
}) => {
  const response = { success: true, errors: [] };

  try {
    // 1. Save in DB
    const notification = await Notification.create({
      recipientId,
      recipientRole,
      type,
      title,
      message,
      metaData,
      createdBy,
      isRead: false,
      isEmailSent: false,
      isPushSent: false,
    });

    const userData = await User.findOne({_id:recipientId});
    // console.log(userData, "userData");
    
    // Handle async notification channels
    const tasks = [];
    if (channels.includes("email") && toEmail) {
      tasks.push(
        sendEmail({
          to: toEmail,
          subject: title,
          template: {
            name: emailTemplateName,
            data: emailContent,
          },
        })
          .then(() => (notification.isEmailSent = true))
          .catch((err) => {
            response.errors.push(`Email: ${err.message}`);
          })
      );
    }

    if (channels.includes("push")) {
      if(userData?.role === 'Patient' && userData?.fcmToken.length > 0){
        const notificationData = { title, body: message };
        // console.log(userData?.fcmToken, "notificationData--");
        tasks.push(
          sendPushNotification(userData?.fcmToken,notificationData)
            .then(() => (notification.isPushSent = true))
            .catch((err) => {
              response.errors.push(`Push: ${err.message}`);
            })
        );
      }
    }

    // Wait for all async tasks
    await Promise.allSettled(tasks);

    // Save updates
    await notification.save();

    response.notification = notification;
    // console.log(`notification`, notification);
    return response;
  } catch (error) {
    console.error("Notification Service Error:", error);
    return { success: false, error: error.message };
  }
};

