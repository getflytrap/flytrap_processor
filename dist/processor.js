"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const database_1 = require("./helpers/database");
const webhook_1 = require("./helpers/webhook");
const handler = async (event) => {
    for (const record of event.Records) {
        const { data } = JSON.parse(record.body);
        try {
            if (data.error) {
                const { success, result } = await (0, database_1.saveErrorData)(data);
                if (success) {
                    (0, webhook_1.sendWebhookNotification)(); // fire-and-forget
                }
                else {
                    console.error('Error saving error data to PostgreSQL');
                }
            }
            else {
                const { success, result } = await (0, database_1.saveRejectionData)(data);
                if (success) {
                    (0, webhook_1.sendWebhookNotification)(); // fire-and-forget
                }
                else {
                    console.error('Error saving rejection data to PostgreSQL');
                }
            }
        }
        catch (e) {
            console.error("Error processing record:", e);
        }
    }
};
exports.handler = handler;
