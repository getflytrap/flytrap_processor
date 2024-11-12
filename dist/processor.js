"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const database_1 = require("./helpers/database");
const webhook_1 = require("./helpers/webhook");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    for (const record of event.Records) {
        const { data } = JSON.parse(record.body);
        try {
            if (data.error) {
                const { success, result } = yield (0, database_1.saveErrorData)(data);
                if (success) {
                    (0, webhook_1.sendWebhookNotification)(); // fire-and-forget
                }
                else {
                    console.error('Error saving error data to PostgreSQL');
                }
            }
            else {
                const { success, result } = yield (0, database_1.saveRejectionData)(data);
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
});
exports.handler = handler;
