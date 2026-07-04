const prisma = require('../utils/prisma');

/**
 * Create an audit log entry.
 * Call this from route handlers after a business event occurs.
 *
 * @param {Object} opts
 * @param {number}  opts.userId       - ID of the acting user (may be null for system events)
 * @param {string}  opts.action       - "create" | "update" | "delete" | "login" | "logout" | "refund" | "restore"
 * @param {string}  opts.entity       - "product" | "sale" | "purchase" | "user" | "customer" | "supplier" | "expense" | "inventory"
 * @param {number}  [opts.entityId]   - ID of the affected record
 * @param {string}  [opts.description]- Human-readable summary
 * @param {object}  [opts.metadata]   - Optional JSON-serializable extra data (before/after, diff, etc.)
 * @param {string}  [opts.ip]         - Request IP
 */
async function createAuditLog({ userId, action, entity, entityId, description, metadata, ip }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        description: description ? String(description).slice(0, 500) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip: ip || null,
      },
    });
  } catch (err) {
    // Audit logging must never break the request — log to console and move on
    console.error('[AuditLog] Failed to write:', err.message);
  }
}

/**
 * Express middleware that attaches `req.audit` — a thin wrapper
 * so route handlers can write audit entries without importing prisma.
 */
function auditMiddleware(req, res, next) {
  req.audit = (opts) => createAuditLog({
    ...opts,
    userId: req.user?.id,
    ip: req.ip || req.connection?.remoteAddress,
  });
  next();
}

module.exports = { createAuditLog, auditMiddleware };
