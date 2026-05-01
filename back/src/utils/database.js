/**
 * Database utility functions
 * Reduces code duplication and provides consistent query patterns
 */

const { pool } = require('../config/database');

/**
 * Execute a SELECT query and return rows
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('[DB Query Error]:', error.message);
    throw error;
  }
}

/**
 * Execute a SELECT query and return single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT query and return insert result
 * @param {string} sql - SQL INSERT query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} { insertId, affectedRows }
 */
async function insert(sql, params = []) {
  try {
    const [result] = await pool.query(sql, params);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error('[DB Insert Error]:', error.message);
    throw error;
  }
}

/**
 * Execute an UPDATE or DELETE query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} { affectedRows, changedRows }
 */
async function execute(sql, params = []) {
  try {
    const [result] = await pool.query(sql, params);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows || result.affectedRows,
    };
  } catch (error) {
    console.error('[DB Execute Error]:', error.message);
    throw error;
  }
}

/**
 * Execute a stored procedure
 * @param {string} procName - Procedure name
 * @param {Array} params - Procedure parameters
 * @returns {Promise<Array>}
 */
async function callProcedure(procName, params = []) {
  try {
    const placeholders = params.map(() => '?').join(',');
    const sql = `CALL ${procName}(${placeholders})`;
    const [result] = await pool.query(sql, params);
    return result;
  } catch (error) {
    console.error('[DB Procedure Error]:', error.message);
    throw error;
  }
}

/**
 * Get paginated results
 * @param {string} tableName - Table name
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {string} whereClause - Optional WHERE clause
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} { data, page, limit, total }
 */
async function paginate(tableName, page = 1, limit = 10, whereClause = '', params = []) {
  const offset = (page - 1) * limit;
  const where = whereClause ? `WHERE ${whereClause}` : '';

  const countSql = `SELECT COUNT(*) AS total FROM ${tableName} ${where}`;
  const dataSql = `SELECT * FROM ${tableName} ${where} LIMIT ? OFFSET ?`;

  const countResult = await queryOne(countSql, params);
  const data = await query(dataSql, [...params, limit, offset]);

  return {
    data,
    page,
    limit,
    total: countResult.total,
    pages: Math.ceil(countResult.total / limit),
  };
}

module.exports = {
  query,
  queryOne,
  insert,
  execute,
  callProcedure,
  paginate,
};
