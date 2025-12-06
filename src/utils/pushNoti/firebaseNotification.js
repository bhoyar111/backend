import admin from "./firebase.js";

export const sendPushNotification = async (deviceTokens, notificationData) => {
  const message = {
    notification: notificationData,
    tokens: deviceTokens,
  };
  // console.log(message, "message");
  
  try {
    if (deviceTokens?.length) {
      await admin.messaging().sendEachForMulticast(message);
      console.log("Sending push notification Successfully", message?.notification);
    }
  } catch (error) {
    console.log("Error sending push notification: ", error);
  }
};
