import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import query from '../database/knex.js';
import checkPermission from '../functions/checkPermission.js';
import { Error401 } from '../classes/errors.js';

/**
 * Function to check authentication
 * @param {string} route Route were the access is done
 * @param {string} action action to be tacken
 * @returns Result of authentication
 */
const checkAuth = (route, action) => async (req, res, next) => {
  const { token } = req.cookies;

  try {
    // Verifies is Token or API Key exists
    if (token) {
      // Validates Token
      const validateUser = jwt.verify(token, process.env.JWT_SECRET);

      // Get Permissions
      const getPermissions = await checkPermission(
        validateUser.id,
        route,
        action
      );

      // Return JSON object with information
      req.user = {
        userID: validateUser.id,
        userControl: getPermissions,
      };
    } else if (
      req.headers.authorization &&
      req.headers.authorization.indexOf('Basic ') === 0
    ) {
      // Removes Basic from string
      const base64Credentials = req.headers.authorization.split(' ')[1];

      // Decodes string into ascii
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii'
      );

      // Destructs array into values
      const [consumer, secret] = credentials.split(':');

      // Get User ID and Secret
      const getUser = await query
        .select('id_user', 'secret')
        .from('user_keys')
        .where({ consumer });

      // Checks if secret is valid
      const checkSecret = await bcrypt.compare(secret, getUser[0].secret);
      if (!checkSecret)
        throw new Error401(
          'consumer-secret-wrong',
          'The consumer key or secret key provided are wrong'
        );

      // Get Permissions
      const getPermissions = await checkPermission(
        getUser[0].id_user,
        route,
        action
      );

      // Return JSON object with information
      req.user = {
        userID: getUser[0].id_user,
        userControl: getPermissions,
      };
    } else {
      throw new Error401(
        'route-protected',
        'Not Authorized to access this route'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkAuth;
