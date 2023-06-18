import query from '../database/knex.js';
import checkUserTag from '../functions/checkUserTag.js';
import { Error401, Error404 } from '../classes/errors.js';
import dateToISOLocal from '../functions/dateToISOLocal.js';

const clockIn = async (req, res, next) => {
  const { userID } = req.user;
  const { tag } = req.body;
  const datetime = new Date();
  const datetimeISO = dateToISOLocal(datetime);

  try {
    const user = await checkUserTag(tag, datetime);

    await query('clocks').insert({
      id_user: user.id,
      direction: 'in',
      datetime: datetimeISO,
      log: userID,
    });

    res.json({
      status: 'authorized',
      name: user.name,
      datetime: datetimeISO,
    });
  } catch (e) {
    next(e);
  }
};

const clockOut = async (req, res, next) => {
  const { userID } = req.user;
  const { tag } = req.body;
  const datetime = new Date();
  const datetimeISO = dateToISOLocal(datetime);

  try {
    const user = await checkUserTag(tag, datetime, true);

    await query('clocks').insert({
      id_user: user.id,
      direction: 'out',
      datetime: datetimeISO,
      log: userID,
    });

    res.json({
      status: 'authorized',
      name: user.name,
      datetime: datetimeISO,
    });
  } catch (e) {
    next(e);
  }
};

const accessArea = async (req, res, next) => {
  const { id } = req;
  const { tag } = req.body;
  const datetime = new Date();
  const datetimeISO = dateToISOLocal(datetime);

  try {
    const user = await checkUserTag(tag, datetime);

    const checkAccessArea = await query('users_areas').where({
      id_user: user.id,
      id_area: id,
    });

    if (checkAccessArea.length === 0)
      throw new Error401(
        'not-authorized',
        "The user dosen't have authorization to access the area"
      );

    res.json({
      status: 'authorized',
      name: user.name,
      datetime: datetimeISO,
    });
  } catch (e) {
    next(e);
  }
};

const accessRoom = async (req, res, next) => {
  const { id } = req;
  const { tag } = req.body;
  const datetime = new Date();
  const datetimeISO = dateToISOLocal(datetime);

  try {
    const user = await checkUserTag(tag, datetime);

    const checkAccessRoom = await query
      .select('validated')
      .from('bookings')
      .where('id_room', id)
      .andWhere('id_user', user.id)
      .andWhere('start', '<=', datetimeISO)
      .andWhere('final', '>=', datetimeISO);

    if (!user.access) {
      if (checkAccessRoom.length === 0)
        throw new Error404(
          'booking-not-found',
          "The user dosen't have a booking for this room."
        );

      if (!checkAccessRoom[0].validated)
        throw new Error401(
          'not-authorized',
          'The booking was not been validated by a supervisor'
        );
    }

    res.json({
      status: 'authorized',
      name: user.name,
      datetime: datetimeISO,
    });
  } catch (e) {
    next(e);
  }
};

export { clockIn, clockOut, accessArea, accessRoom };
