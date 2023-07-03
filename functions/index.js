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
        return {success: true};
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
                "body": "You have new letters!"
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
        return db.collection("status").doc("configuration").update({
            IsLetterBoxFull: Boolean(request.body)
        }).then(querySnapshot => {
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
        return db.collection("status").doc("configuration").update({
            IsParcelContain: Boolean(request.body)
        }).then(querySnapshot => {
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
        return db.collection("status").doc("configuration").update({
            IsParcelBoxLocked: Boolean(request.body)
        }).then(querySnapshot => {
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
        return db.collection("status").doc("configuration").update({
            IsLetterBoxLocked: Boolean(request.body)
        }).then(querySnapshot => {
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
