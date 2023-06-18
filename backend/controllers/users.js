import bcrypt from 'bcrypt';
import query from '../database/knex.js';
import checkIfExists from '../functions/checkIfExists.js';
import checkJSONProps from '../functions/checkJSONProps.js';
import { Error400, Error401, Error404 } from '../classes/errors.js';

const create = async (req, res, next) => {
  const { role, username, password, name, tag, schedule, areas } = req.body;
  let arrayID = [];

  try {
    // Check mandatory properties
    if (!username || !password || !name || !tag || !schedule)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if username is unique
    const checkUsername = await query('users').where({ username });

    if (checkUsername.length !== 0)
      throw new Error404(
        'username-already-exists',
        "The indicated 'username' already exists."
      );

    // If as areas object, check requirements
    if (areas) arrayID = await checkJSONProps(areas, 'areas', 'area');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    // Creates a new area
    const newUser = await query('users').insert(
      {
        id_user_role: role || 4,
        username,
        password: hash,
        name,
        tag,
        schedule,
      },
      'id'
    );

    // Insert on table users_areas
    if (arrayID.length !== 0) {
      await Promise.all(
        arrayID.map(async (value) => {
          await query('users_areas').insert({
            id_user: newUser[0].id,
            id_area: value,
          });
        })
      );
    }

    const getNewUser = await query
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
      .where('id', newUser[0].id);

    res.json(getNewUser[0]);
  } catch (e) {
    next(e);
  }
};

const read = async (req, res, next) => {
  const { id } = req;
  const { userID, userControl } = req.user;
  let getUser;

  try {
    if (userControl || userID === id) {
      getUser = await query
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
        .where({ id });
    } else {
      getUser = await query
        .select(
          'id',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT ur.id, ur.name FROM pds.user_roles ur WHERE users.id_user_role = ur.id) x) AS role'
          ),
          'username',
          'name',
          'schedule',
          query.raw(
            `coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT b.id, to_char(b.start, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS start, b.description FROM pds.bookings b WHERE users.id = b.id_user AND b.start >= NOW()::timestamp ORDER BY b.start ASC) x), '[]') AS nextBookings`
          )
        )
        .from('users')
        .where({ id });
    }
    res.json(getUser[0]);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { id, body } = req;
  const { userID, userControl } = req.user;
  const { role, password, name, tag, schedule, areas } = req.body;
  let hash;

  try {
    // Check mandatory properties
    if (Object.keys(body).toString().length === 0)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Can not change a user, unless permission given to role
    if (id !== userID && !userControl)
      throw new Error401('cannot-update-user', 'Cannot update others users');

    // Changes only allowed by the admin
    if (userControl) {
      if (role) await checkIfExists('user_roles', 'id', role, 'role');
      if (tag) {
        const checkTag = await query('users').where({ tag });

        if (checkTag.length !== 0)
          throw new Error404(
            'tag-already-exists',
            "The indicated 'tag' already exists."
          );
      }
      if (areas) {
        const arrayID = await checkJSONProps(areas, 'areas', 'area');

        if (arrayID.length !== 0) {
          await query('users_areas').where('id_user', id).del();

          await Promise.all(
            arrayID.map(async (value) => {
              await query('users_areas').insert({
                id_user: id,
                id_area: value,
              });
            })
          );
        }
      }

      await query('users')
        .where({ id })
        .update({ id_user_role: role, tag, schedule });
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      hash = await bcrypt.hash(password, salt);
    }

    if (name || password)
      await query('users').where({ id }).update({ name, password: hash });

    const getUserUpdated = await query
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
      .where({ id });

    res.json(getUserUpdated[0]);
  } catch (e) {
    next(e);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req;

  try {
    const getUserDelete = await query
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
      .where({ id });

    await query('users_areas').where('id_user', id).del();
    await query('users').where({ id }).update({ status: 'deleted' });

    res.json({ deleted: getUserDelete[0] });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  const { orderby, order, status, role } = req.query;
  let roleQuery;

  try {
    // Check if role exists
    if (role) {
      await checkIfExists('user_roles', 'id', role, 'role');
      roleQuery = `AND id_user_role = ${role}`;
    }

    // Listar utilizadores
    const listUsers = await query
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
      .where(query.raw(`status = '${status || 'user'}' ${roleQuery || ''}`))
      .orderBy(orderby || 'id', order || 'ASC');

    if (listUsers.length === 0)
      throw new Error404(
        'users-not-found',
        'No areas were found with the given params'
      );

    res.json(listUsers);
  } catch (e) {
    next(e);
  }
};

export { create, read, update, destroy, list };
