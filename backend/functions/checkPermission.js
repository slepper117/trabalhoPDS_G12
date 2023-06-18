import query from '../database/knex.js';
import { Error401 } from '../classes/errors.js';

/**
 * Functio to check permission on route
 * @param {number} id User ID
 * @param {string} route Route to be verified
 * @param {string} action Action to be verified
 * @returns Boolean of control
 */
const checkPermission = async (id, route, action) => {
  const getPermission = await query('user_roles')
    .select('permissions', 'control')
    .where('id', query.select('id_user_role').from('users').where({ id }));

  if (!getPermission[0].permissions[route][action]) {
    throw new Error401(
      'route-protected',
      'Not Authorized to access this route'
    );
  }

  return getPermission[0].control;
};

export default checkPermission;
