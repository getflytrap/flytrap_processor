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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRejectionData = exports.saveErrorData = void 0;
// import dotenv from 'dotenv'; // only for local dev
const pg_1 = __importDefault(require("pg"));
const uuid_1 = require("uuid");
const stacktrace_processor_1 = require("./stacktrace_processor");
// dotenv.config(); // only for local dev
const { Pool } = pg_1.default;
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGUSERHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
    ssl: { rejectUnauthorized: false }
});
const saveErrorData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield pool.query('SELECT id FROM projects WHERE uuid = $1', [data.project_id]);
        const projectId = project.rows[0].id ? project.rows[0].id : null;
        if (!projectId)
            return { success: false, error: "Project not found." };
        const error_uuid = (0, uuid_1.v4)();
        console.log('Error stack trace:');
        console.log(data.error.stack);
        console.log('');
        const { fileName, lineNumber, colNumber } = (0, stacktrace_processor_1.extractLineAndColNumbers)(data.error.stack);
        const query = `INSERT INTO error_logs (uuid, name, message, created_at,
    line_number, col_number, project_id, stack_trace, handled) VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
        const result = yield pool.query(query, [
            error_uuid,
            data.error.name || 'UnknownError',
            data.error.message || 'No message provided',
            data.timestamp,
            lineNumber,
            colNumber,
            projectId,
            data.error.stack || 'No stack trace available',
            data.handled,
        ]);
        return { success: true, result };
    }
    catch (e) {
        console.error("Error saving error data to PostgreSQL", e);
        return { success: false, error: e };
    }
});
exports.saveErrorData = saveErrorData;
const saveRejectionData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield pool.query('SELECT id FROM projects WHERE uuid = $1', [data.project_id]);
        const projectId = project.rows[0].id ? project.rows[0].id : null;
        if (!projectId)
            return { success: false, error: "Project not found." };
        const query = `INSERT INTO rejection_logs (value, created_at, 
    project_id, handled) VALUES ($1, $2, $3, $4) RETURNING id`;
        const result = yield pool.query(query, [
            data.value,
            data.timestamp,
            projectId,
            data.handled,
        ]);
        return { success: true, result };
    }
    catch (e) {
        console.error("Error saving promise data to PostgreSQL", e);
        return { success: false, error: e };
    }
});
exports.saveRejectionData = saveRejectionData;
