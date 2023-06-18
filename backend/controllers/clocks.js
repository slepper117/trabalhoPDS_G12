import query from '../database/knex.js';
import checkIfExists from '../functions/checkIfExists.js';
import { Error400, Error404 } from '../classes/errors.js';

const create = async (req, res, next) => {
  const { userID } = req.user;
  const { user, direction, datetime } = req.body;

  try {
    // Check mandatory properties
    if (!user || !direction || !datetime)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if properties provided exists
    await checkIfExists('users', 'id', user, 'user', true);

    // Creates a new clockIn or clockOut
    const newClock = await query('clocks').insert(
      {
        id_user: user,
        direction,
        datetime,
        log: userID,
      },
      [
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
        ),
        'direction',
        'datetime',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
        ),
      ]
    );

    res.json(newClock[0]);
  } catch (e) {
    next(e);
  }
};

const read = async (req, res, next) => {
  const { id } = req;

  try {
    const getClock = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
        ),
        'direction',
        'datetime',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
        )
      )
      .from('clocks')
      .where({ id });

    res.json(getClock[0]);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { id, body } = req;
  const { userID } = req.user;
  const { user, direction, datetime } = req.body;

  try {
    // If body of request empty, dosen't update
    if (Object.keys(body).length === 0)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if properties provided exists
    if (user) await checkIfExists('users', 'id', user, 'user', true);

    // Updates the clockIn or clockOut
    const updateClock = await query('clocks')
      .where({ id })
      .update(
        {
          id_user: user,
          direction,
          datetime,
          log: userID,
        },
        [
          'id',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
          ),
          'direction',
          'datetime',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
          ),
        ]
      );

    res.json(updateClock[0]);
  } catch (e) {
    next(e);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req;

  try {
    const getClock = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
        ),
        'direction',
        'datetime',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
        )
      )
      .from('clocks')
      .where({ id });

    await query('clocks').where({ id }).del();

    res.json({ deleted: getClock[0] });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  const { userID, userControl } = req.user;
  const { orderby, order } = req.query;
  let listClocks = [];

  try {
    if (!userControl)
      listClocks = await query
        .select(
          'id',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
          ),
          'direction',
          'datetime',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
          )
        )
        .from('clocks')
        .where('id_user', userID)
        .orderBy(orderby || 'datetime', order || 'asc');
    else
      listClocks = await query
        .select(
          'id',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.id_user = u.id) x) AS user'
          ),
          'direction',
          'datetime',
          query.raw(
            '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE clocks.log = u.id) x) AS log'
          )
        )
        .from('clocks')
        .orderBy(orderby || 'datetime', order || 'asc');

    if (listClocks.length === 0)
      throw new Error404(
        'clocks-not-found',
        'No clocks were found with the given params'
      );

    res.json(listClocks);
  } catch (e) {
    next(e);
  }
};

export { create, read, update, destroy, list };
