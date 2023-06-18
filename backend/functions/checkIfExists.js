import query from '../database/knex.js';
import { Error404 } from '../classes/errors.js';

/**
 * Function to check if a value exists in a table
 * @param {string} relation Table were verification occurs
 * @param {string} column Column of value to be verified
 * @param {string} value Value to be verified
 * @param {string} name Name of the column to be verified
 * @param {boolean} ignore Ignore System User's if table to be checked is 'users'. Default: `false`
 */
const checkIfExists = async (relation, column, value, name, ignore = false) => {
  let check = [];

  if (relation === 'users' && ignore) {
    check = await query('users')
      .where(column, value)
      .andWhere('status', 'user');
  } else {
    check = await query(relation).where(column, value);
  }

  if (check.length === 0)
    throw new Error404(
      `${name}-not-found`,
      `The indicated '${name}' property cannot be found`
    );
};

export default checkIfExists;
