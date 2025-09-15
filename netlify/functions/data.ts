import { Pool } from '@neondatabase/serverless';
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { SUPER_ADMIN_EMAIL } from '../../constants';


// Initialize the connection pool.
// When using the Netlify-Neon integration, Netlify automatically provides the DATABASE_URL.
// The @neondatabase/serverless driver is optimized for this serverless environment.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to create a standardized response
const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow requests from any origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
};

const handlers: { [key: string]: (event: HandlerEvent) => Promise<any> } = {
    // --- KEY HANDLERS ---
    'GET_keys': async () => {
        const { rows } = await pool.query('SELECT *, to_char("startDate", \'YYYY-MM-DD\') as "startDate", to_char("endDate", \'YYYY-MM-DD\') as "endDate" FROM license_keys ORDER BY id DESC');
        return createResponse(200, rows);
    },
    'POST_keys': async (event) => {
        const { id, ...keyData } = JSON.parse(event.body || '{}');
        const newId = `key-${Date.now()}`;
        const { rows } = await pool.query(
            'INSERT INTO license_keys (id, "keyValue", "applicationId", "userName", "userContact", "startDate", "endDate", "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, to_char("startDate", \'YYYY-MM-DD\') as "startDate", to_char("endDate", \'YYYY-MM-DD\') as "endDate"',
            [newId, keyData.keyValue, keyData.applicationId, keyData.userName, keyData.userContact, keyData.startDate, keyData.endDate, keyData.isActive]
        );
        return createResponse(201, rows[0]);
    },
    'PUT_keys': async (event) => {
        const { id, ...keyData } = JSON.parse(event.body || '{}');
        const { rows } = await pool.query(
            'UPDATE license_keys SET "keyValue" = $1, "applicationId" = $2, "userName" = $3, "userContact" = $4, "startDate" = $5, "endDate" = $6, "isActive" = $7 WHERE id = $8 RETURNING *, to_char("startDate", \'YYYY-MM-DD\') as "startDate", to_char("endDate", \'YYYY-MM-DD\') as "endDate"',
            [keyData.keyValue, keyData.applicationId, keyData.userName, keyData.userContact, keyData.startDate, keyData.endDate, keyData.isActive, id]
        );
        return createResponse(200, rows[0]);
    },
    'DELETE_keys': async (event) => {
        const { id } = JSON.parse(event.body || '{}');
        await pool.query('DELETE FROM license_keys WHERE id = $1', [id]);
        return createResponse(204, null);
    },
     'POST_toggleKeyStatus': async (event) => {
        const { id } = JSON.parse(event.body || '{}');
        const { rows } = await pool.query('UPDATE license_keys SET "isActive" = NOT "isActive" WHERE id = $1 RETURNING *, to_char("startDate", \'YYYY-MM-DD\') as "startDate", to_char("endDate", \'YYYY-MM-DD\') as "endDate"', [id]);
        return createResponse(200, rows[0]);
    },

    // --- APPLICATION HANDLERS ---
    'GET_applications': async () => {
        const { rows } = await pool.query('SELECT * FROM applications ORDER BY name');
        return createResponse(200, rows);
    },
    'POST_applications': async (event) => {
        const { name } = JSON.parse(event.body || '{}');
        const newId = `app-${Date.now()}`;
        const { rows } = await pool.query('INSERT INTO applications (id, name) VALUES ($1, $2) RETURNING *', [newId, name]);
        return createResponse(201, rows[0]);
    },
    'PUT_applications': async (event) => {
        const { id, name } = JSON.parse(event.body || '{}');
        const { rows } = await pool.query('UPDATE applications SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        return createResponse(200, rows[0]);
    },
    'DELETE_applications': async (event) => {
        const { id } = JSON.parse(event.body || '{}');
        // Check for dependencies before deleting
        const result = await pool.query('SELECT 1 FROM license_keys WHERE "applicationId" = $1 LIMIT 1', [id]);
        if (result.rowCount > 0) {
            return createResponse(400, { message: "Cannot delete: application is in use by one or more keys." });
        }
        await pool.query('DELETE FROM applications WHERE id = $1', [id]);
        return createResponse(204, null);
    },

    // --- USER HANDLERS ---
    'GET_users': async () => {
        const { rows } = await pool.query('SELECT id, email, name, role, permissions FROM users ORDER BY name');
        return createResponse(200, rows);
    },
    'POST_login': async (event) => {
        const { email, password } = JSON.parse(event.body || '{}');
        const { rows } = await pool.query('SELECT id, email, name, role, permissions FROM users WHERE email = $1 AND password = $2', [email.toLowerCase(), password]);
        if (rows.length > 0) {
            return createResponse(200, rows[0]);
        }
        return createResponse(401, { message: "Invalid email or password" });
    },
    'POST_users': async (event) => {
        const { name, email, permissions, password } = JSON.parse(event.body || '{}');
        const lowerEmail = email.toLowerCase();
        
        // Check if user already exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
        if (existing.rowCount > 0) {
            return createResponse(409, { message: "A user with this email already exists." });
        }
        
        const newId = `user-${Date.now()}`;
        const role = lowerEmail === SUPER_ADMIN_EMAIL ? 'superadmin' : 'admin';
        const finalPermissions = role === 'superadmin' ? null : JSON.stringify(permissions);

        const { rows } = await pool.query(
            'INSERT INTO users (id, email, name, role, password, permissions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, role, permissions',
            [newId, lowerEmail, name, role, password, finalPermissions]
        );
        return createResponse(201, rows[0]);
    },
    'PUT_users': async (event) => {
        const { id, name, permissions } = JSON.parse(event.body || '{}');
        const { rows } = await pool.query(
            'UPDATE users SET name = $1, permissions = $2 WHERE id = $3 AND role != \'superadmin\' RETURNING id, email, name, role, permissions',
            [name, JSON.stringify(permissions), id]
        );
        return createResponse(200, rows[0]);
    },
    'DELETE_users': async (event) => {
        const { id } = JSON.parse(event.body || '{}');
        await pool.query('DELETE FROM users WHERE id = $1 AND role != \'superadmin\'', [id]);
        return createResponse(204, null);
    },
    'POST_resetPassword': async (event) => {
        const { id } = JSON.parse(event.body || '{}');
        const newPassword = 'keyguard123'; // Default password
        await pool.query('UPDATE users SET password = $1 WHERE id = $2 AND role != \'superadmin\'', [newPassword, id]);
        return createResponse(204, null);
    }
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Handle preflight requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(204, null);
    }
    
    const resource = event.queryStringParameters?.resource;
    const method = event.httpMethod;
    const handlerKey = `${method}_${resource}`;

    try {
        const handle = handlers[handlerKey];
        if (handle) {
            return await handle(event);
        } else {
            return createResponse(404, { message: `Resource or method not found for key: ${handlerKey}` });
        }
    } catch (error) {
        const err = error as Error & { code?: string };
        console.error("Detailed Handler Error:", err); // Log the full error object for server-side debugging

        let clientMessage = 'An internal server error occurred. Check the function logs on Netlify for more details.';

        // Check for common PG connection error codes or messages.
        if (err.message.includes('timeout') || (err.code && ['ENOTFOUND', 'ECONNREFUSED'].includes(err.code))) {
            clientMessage = 'Database connection timed out. This is often due to a firewall or IP whitelist issue. Please ensure your database allows connections from all IPs (0.0.0.0/0).';
        } else if (err.code === '28P01') {
            clientMessage = 'Database authentication failed. Please double-check your DATABASE_URL environment variable provided by the Neon integration.';
        } else {
            // Use the original error message if it's not a generic one
            clientMessage = err.message || clientMessage;
        }

        return createResponse(500, { message: clientMessage });
    }
};