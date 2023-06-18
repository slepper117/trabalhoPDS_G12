import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import query from '../database/knex.js';
import cookiesConfig from '../config/cookies.js';
import { Error400, Error401 } from '../classes/errors.js';

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check mandatory properties
    if (!username || !password)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if user exists
    const userExists = await query('users')
      .select('id', 'password')
      .where({ username });

    if (userExists.length === 0)
      throw new Error401(
        'username-password-wrong',
        'The username or password provided are wrong'
      );

    // Check if password is correct
    const checkPassword = await bcrypt.compare(
      password,
      userExists[0].password
    );

    if (!checkPassword)
      throw new Error401(
        'username-password-wrong',
        'The username or password provided are wrong'
      );

    // Creates a token
    const token = jwt.sign(
      {
        id: userExists[0].id,
      },
      process.env.JWT_SECRET
    );

    // Get User
    const getUser = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT ur.id, ur.name FROM pds.user_roles ur WHERE users.id_user_role = ur.id) x) AS role'
        ),
        'username',
        'name',
        'tag',
        'schedule',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT a.id, a.name FROM pds.areas a JOIN pds.users_areas ua ON a.id = ua.id_area WHERE users.id = ua.id_user) x), '[]') AS areas"
        ),
        query.raw(
          `coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT c.id, c.direction, to_char(c.datetime, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS datetime FROM pds.clocks c WHERE users.id = c.id_user LIMIT 4) x), '[]') AS lastClocks`
        ),
        query.raw(
          `coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT b.id, to_char(b.start, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS start, b.description FROM pds.bookings b WHERE users.id = b.id_user AND b.start >= NOW()::timestamp ORDER BY b.start ASC) x), '[]') AS nextBookings`
        )
      )
      .from('users')
      .where('id', userExists[0].id);

    // Sends token as a Cookie
    res.cookie('token', token, cookiesConfig).json(getUser[0]);
  } catch (e) {
    next(e);
  }
};

const logout = (req, res, next) => {
  try {
    // Clears Cookie Token
    res
      .cookie('token', '', {
        ...cookiesConfig,
        expires: new Date(0),
      })
      .send();
  } catch (e) {
    next(e);
  }
};

const auth = async (req, res, next) => {
  const { token } = req.cookies;

  try {
    // Verifies is Token or API Key exists
    if (token) {
      // Validates Token
      jwt.verify(token, process.env.JWT_SECRET);

      // Send 200
      res.send();
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
        .select('secret')
        .from('user_keys')
        .where({ consumer });

      // Checks if secret is valid
      const checkSecret = await bcrypt.compare(secret, getUser[0].secret);
      if (!checkSecret)
        throw new Error401(
          'consumer-secret-wrong',
          'The consumer key or secret key provided are wrong'
        );

      res.send();
    } else {
      throw new Error401(
        'route-protected',
        'Not Authorized to access this route'
      );
    }
  } catch (err) {
    next(err);
  }
};

export { login, logout, auth };
