"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWebhookNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const url = process.env.WEBHOOK_ENDPOINT;
const sendWebhookNotification = async () => {
    if (url) {
        axios_1.default.post(url, { data: 'New error data' });
    }
};
exports.sendWebhookNotification = sendWebhookNotification;
