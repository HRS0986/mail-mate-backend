const functions = require("firebase-functions");
const admin = require("firebase-admin");


admin.initializeApp();
const db = admin.firestore();

function sendPushNotification(notificationData) {
    const payload = {
        token: "dCgfKiROQ3e7KyybACO6e8:APA91bGap8tK_4NxaaRfuWHLU1DefGAFO36yAtkoSq0QDhqI3B9qyLKKQcDm95s3SOJuYLha8zXtA-ONSvyss4b_EVcaVoxzkLLKqJh3yw5CF7Yult9USQvgShvkfDV_QsnyLwSDs3LE",
        notification: notificationData
    };
    admin.messaging().send(payload).then((res) => {
        const date = new Date()
        const notification = {
            "Body": notificationData["body"],
            "Title": notificationData["title"],
            "Date": date.toLocaleString(),
            "Type": notificationData["type"]
        };
        db.collection("notifications").add(notification).then(() => {
            return {success: true};
        }).catch(() => {
            return {success: false};
        });
    }).catch((error) => {
        return {success: false};
    });
}


exports.get_messages = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        return db.collection("messages").doc("msg").get().then((querySnapshot) => {
            let msgObject = querySnapshot.data();
            return response.status(200).json(msgObject["Text"]);
        }).catch(err => {
            functions.logger.error(err);
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.get_status = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        return db.collection("status").doc("configuration").get().then((querySnapshot) => {
            return response.status(200).json(querySnapshot.data());
        }).catch(err => {
            functions.logger.error(err);
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.get_fcm_keys = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        return db.collection("DeviceKeys").doc("FCMKeys").get().then((querySnapshot) => {
            const keys = querySnapshot.data()["Keys"]
            const data = {"registration_ids": keys};
            return response.status(200).json(data);
        }).catch(err => {
            functions.logger.error(err);
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_count = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        return db.collection("status").doc("configuration").update({
            LetterCount: request.body["LetterCount"]
        }).then(_ => {
            const notification = {
                "title": "MaleMate",
                "body": "You have new letters!",
                "type": "Info"
            };
            sendPushNotification(notification);
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_full = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(request.body);
        return db.collection("status").doc("configuration").update({
            IsLetterBoxFull: status
        }).then(_ => {
            const notification = {
                "title": "MaleMate - Warning",
                "body": status ? "Your letter box is getting full" : "Your letters are taken from box",
                "type": "Warning"
            };
            sendPushNotification(notification);
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_parcel_contain_status = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(request.body);
        return db.collection("status").doc("configuration").update({
            IsParcelContain: status
        }).then(_ => {
            const notification = {
                "title": status ? "MaleMate" : "MaleMate - Warning",
                "body": status ? "You have new parcel" : "Your parcel is taken from the box",
                "type": status ? "Info" : "Warning"
            };
            sendPushNotification(notification);
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_parcel_locked_status = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(request.body);
        return db.collection("status").doc("configuration").update({
            IsParcelBoxLocked: status
        }).then(querySnapshot => {
            if (!status) {
                const notification = {
                    "title": "MaleMate - Warning",
                    "body": "Parcel box is unlocked",
                    "type": "Warning"
                };
                sendPushNotification(notification);
            }
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_locked_status = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(request.body);
        return db.collection("status").doc("configuration").update({
            IsLetterBoxLocked: status
        }).then(querySnapshot => {
            if (!status) {
                const notification = {
                    "title": "MaleMate - Warning",
                    "body": "Letter box is unlocked",
                    "type": "Warning"
                };
                sendPushNotification(notification);
            }
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.create_notification = functions.https.onRequest((request, response) => {
    if (request.method === "POST") {
        let data = request.body;
        return db.collection("notifications").add(data).then(() => {
            return response.status(200).json(true);
        }).catch((err) => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.send_damage_alert = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        const notification = {
            "body": "Someone is trying to damage the letterbox",
            "title": "Mail Mate - Security Alert",
            "type": "Critical"
        }
        sendPushNotification(notification);
        return response.status(200).json(true);
    } else {
        return response.status(405).json("Method not allowed");
    }
});

exports.send_suspicious_unlock_attempt_alert = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        const notification = {
            "body": "Suspicious unlock attempt detected",
            "title": "Mail Mate - Security Alert",
            "type": "Critical"
        }
        sendPushNotification(notification);
        return response.status(200).json(true);
    } else {
        return response.status(405).json("Method not allowed");
    }
})
