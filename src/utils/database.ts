import pkg from "pg";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { processStackTrace } from "./stacktrace";
import { ErrorData, RejectionData } from "./types";

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  import('dotenv').then((dotenv) => dotenv.config());
}

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGUSERHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: environment === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Saves error data to the database, processes stack trace details, and generates a unique hash for the error.
 *
 * @param data - The error data containing details like stack trace, method, and context.
 * @returns A promise that resolves to a success flag with query result or error.
 */
export const saveErrorData = async (data: ErrorData) => {
  try {
    // Retrieve project ID and platform.
    const project = await pool.query(
      "SELECT id, platform FROM projects WHERE uuid = $1",
      [data.project_id],
    );
    const projectId = project.rows[0].id ? project.rows[0].id : null;
    if (!projectId) return { success: false, error: "Project not found." };

    const projectPlatform = project.rows[0].platform;
    const error_uuid = uuidv4();

    // Process stack trace and extract source details.
    const { fileName, lineNumber, colNumber, updatedStack, updatedContexts } =
      await processStackTrace(data, projectPlatform);

    const codeContextsJson = JSON.stringify(updatedContexts);

    // Generate a unique hash for the error.
    const hashInput = `${fileName}:${lineNumber}:${colNumber}:${data.error.name}`;
    const errorHash = crypto
      .createHash("sha256")
      .update(hashInput)
      .digest("hex");

    // Generate a unique hash for the ip address.
    const ipHash = crypto
      .createHash("sha256")
      .update(data.ip || "")
      .digest("hex");

    // Insert error data into the database.
    const query = `INSERT INTO error_logs (uuid, name, message, created_at, filename,
    line_number, col_number, project_id, stack_trace, handled, contexts, method, path, ip, os, browser, runtime, error_hash) VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`;

    const result = await pool.query(query, [
      error_uuid,
      data.error.name || "UnknownError",
      data.error.message || "No message provided",
      data.timestamp,
      fileName,
      lineNumber,
      colNumber,
      projectId,
      updatedStack || "No stack trace available",
      data.handled,
      codeContextsJson,
      data.method,
      data.path,
      ipHash,
      data.os,
      data.browser,
      data.runtime,
      errorHash,
    ]);

    return { success: true, result };
  } catch (e) {
    console.error("Error saving error data to PostgreSQL", e);
    return { success: false, error: e };
  }
};

/**
 * Saves rejection data to the database.
 *
 * @param data - The rejection data containing details like value and method.
 * @returns A promise that resolves to a success flag with query result or error.
 */
export const saveRejectionData = async (data: RejectionData) => {
  try {
    // Retrieve project ID.
    const project = await pool.query(
      "SELECT id FROM projects WHERE uuid = $1",
      [data.project_id],
    );
    const projectId = project.rows[0].id ? project.rows[0].id : null;

    if (!projectId) return { success: false, error: "Project not found." };

    const rejection_uuid = uuidv4();

    // Generate a unique hash for the ip address.
    const ipHash = crypto
    .createHash("sha256")
    .update(data.ip || "")
    .digest("hex");

    // Insert rejection data into the database.
    const query = `INSERT INTO rejection_logs (uuid, value, created_at,
    project_id, handled, method, path, ip, os, browser, runtime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;

    const result = await pool.query(query, [
      rejection_uuid,
      data.value,
      data.timestamp,
      projectId,
      data.handled,
      data.method,
      data.path,
      ipHash,
      data.os,
      data.browser,
      data.runtime,
    ]);

    return { success: true, result };
  } catch (e) {
    console.error("Error saving promise data to PostgreSQL", e);
    return { success: false, error: e };
  }
};
