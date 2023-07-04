const functions = require("firebase-functions");
const admin = require("firebase-admin");


admin.initializeApp();
const db = admin.firestore();

const CRITICAL = "Critical";
const WARNING = "Warning";
const INFO = "Info";

async function sendPushNotification(notificationData, notificationType) {
    return db.collection("DeviceKeys").doc("FCMKeys").get().then(snapshot => {
        let tokens = snapshot.data()["Keys"];
        const payload = {
            tokens: tokens,
            notification: notificationData
        }
        const now = new Date();
        const notificationObject = {
            "Title": notificationData["title"],
            "Body": notificationData["body"],
            "Date": now.toLocaleString(),
            "Type": notificationType
        }
        return db.collection("notifications").add(notificationObject).then(() => {
            return admin.messaging().sendEachForMulticast(payload).then((res) => {
                return {success: true, tokens: tokens};
            }).catch((err) => {
                return {success: false, error: err};
            });
        }).catch((err) => {
            return {success: false, error: err};
        });

    });
}

function getFcmTokens() {
    return db.collection("DeviceKeys").doc("FCMKeys").get().then(snapshot => {
        return snapshot.data()["Keys"];
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

exports.send_damage_alert = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        return getFcmTokens().then(data => {
            const notificationObject = {
                "body": "Someone is trying to damage the letterbox",
                "title": "Mail Mate - Security Alert",
            };
            return sendPushNotification(notificationObject, CRITICAL).then(data => {
                return response.status(200).json(data);
            });
        });
    } else {
        return response.status(405).json("Method not allowed");
    }
});

exports.send_suspicious_unlock_attempt_alert = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        const notificationObject = {
            "body": "Suspicious unlock attempt detected",
            "title": "Mail Mate - Security Alert",
        };
        return sendPushNotification(notificationObject, CRITICAL).then(data => {
            return response.status(200).json(data);
        });
    } else {
        return response.status(405).json("Method not allowed");
    }
})

exports.update_letter_count = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        return db.collection("status").doc("configuration").get().then(documentSnapshot => {
            const letter_Count = parseInt(documentSnapshot.data()["LetterCount"]);
            return db.collection("status").doc("configuration").update({
                LetterCount: letter_Count + 1
            }).then(_ => {
                const notificationObject = {
                    "title": "MaleMate",
                    "body": "You have new letters!"
                };
                return sendPushNotification(notificationObject, INFO).then(data => {
                    return response.status(200).json(data);
                });
            }).catch(err => {
                return response.status(500).send(err);
            });
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_full = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(parseInt(request.body["IsLetterBoxFull"]));
        return db.collection("status").doc("configuration").update({
            IsLetterBoxFull: status
        }).then(_ => {
            if (!status) {
                db.collection("status").doc("configuration").update({
                    LetterCount: "0"
                }).then().catch();
            }
            const notificationObject = {
                "title": "MaleMate - Warning",
                "body": status ? "Your letter box is getting full" : "Your letters are taken from box"
            };
            return sendPushNotification(notificationObject, WARNING).then(data => {
                return response.status(200).json(data);
            });
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_parcel_contain_status = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(parseInt(request.body["IsParcelContain"]));
        return db.collection("status").doc("configuration").update({
            IsParcelContain: status
        }).then(_ => {
            const notificationObject = {
                "title": status ? "MaleMate" : "MaleMate - Warning",
                "body": status ? "You have new parcel" : "Your parcel is taken from the box"
            };
            return sendPushNotification(notificationObject, status ? INFO : WARNING).then(data => {
                return response.status(200).json(data);
            });
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_parcel_locked_status = functions.https.onRequest((request, response) => {
    if (request.method === "PUT") {
        const status = Boolean(parseInt(request.body["IsParcelBoxLocked"]));
        return db.collection("status").doc("configuration").update({
            IsParcelBoxLocked: status
        }).then(querySnapshot => {
            if (!status) {
                const notificationObject = {
                    "title": "MaleMate - Warning",
                    "body": "Parcel box is unlocked"
                };
                return sendPushNotification(notificationObject, WARNING).then(data => {
                    return response.status(200).json(data);
                });
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
        const status = Boolean(parseInt(request.body["IsLetterBoxLocked"]));
        return db.collection("status").doc("configuration").update({
            IsLetterBoxLocked: status
        }).then(querySnapshot => {
            if (!status) {
                const notificationObject = {
                    "title": "MaleMate - Warning",
                    "body": "Letter box is unlocked"
                };
                return sendPushNotification(notificationObject, WARNING).then(data => {
                    return response.status(200).json(data);
                });
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
