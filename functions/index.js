const functions = require("firebase-functions");
const admin = require("firebase-admin");


admin.initializeApp();
const db = admin.firestore();

exports.get_messages = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        functions.logger.info("Get messages", {structuredData: true});
        return db.collection("messages").get().then((querySnapshot) => {
            let messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc.data());
            });
            return response.status(200).json(messages);
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
        functions.logger.info("Get status", {structuredData: true});
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

exports.get_letter_box_password = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        functions.logger.info("Get letter box password", {structuredData: true});
        return db.collection("security").doc("letter-pw").get().then((querySnapshot) => {
            return response.status(200).json(querySnapshot.data());
        }).catch(err => {
            functions.logger.error(err);
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.get_parcel_box_password = functions.https.onRequest((request, response) => {
    if (request.method === "GET") {
        functions.logger.info("Get parcel box password", {structuredData: true});
        return db.collection("security").doc("parcel-pw").get().then((querySnapshot) => {
            return response.status(200).json(querySnapshot.data());
        }).catch(err => {
            functions.logger.error(err);
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_box_password = functions.https.onRequest((request, response) => {
    if (request.method === "PATCH") {
        functions.logger.info("Update letter box password", {structuredData: true});
        return db.collection("security").doc("letter-pw").set({
            Hash: request.body
        }).then(querySnapshot => {
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_parcel_box_password = functions.https.onRequest((request, response) => {
    if (request.method === "PATCH") {
        functions.logger.info("Update parcel box password", {structuredData: true});
        return db.collection("security").doc("parcel-pw").set({
            Hash: request.body
        }).then(querySnapshot => {
            return response.status(200).json(true);
            ;
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

exports.update_letter_count = functions.https.onRequest((request, response) => {
    if (request.method === "PATCH") {
        functions.logger.info("Update letter count", {structuredData: true});
        return db.collection("status").doc("configuration").update({
            LetterCount: request.body
        }).then(querySnapshot => {
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }

});

exports.update_letter_full = functions.https.onRequest((request, response) => {
    if (request.method === "PATCH") {
        functions.logger.info("Update letter full", {structuredData: true});
        return db.collection("status").doc("configuration").update({
            IsLetterBoxFull: request.body
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
    if (request.method === "PATCH") {
        functions.logger.info("Update parcel contain status", {structuredData: true});
        return db.collection("status").doc("configuration").update({
            IsParcelContain: request.body
        }).then(querySnapshot => {
            return response.status(200).json(true);
        }).catch(err => {
            return response.status(500).send(err);
        });
    } else {
        return response.status(405).send("Method not allowed");
    }
});

