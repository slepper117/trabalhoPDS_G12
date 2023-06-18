import query from '../database/knex.js';
import checkIfExists from '../functions/checkIfExists.js';
import { Error400, Error401, Error404 } from '../classes/errors.js';

const create = async (req, res, next) => {
  const { userID, userControl } = req.user;
  const { room, start, final, description } = req.body;
  let { user } = req.body;

  try {
    // Set user default
    if (!user) user = userID;

    // Can not create a booking for other user, unless permission given to role
    if (user !== userID && !userControl)
      throw new Error401(
        'user-not-authorized',
        'Can not create a booking for other user'
      );

    // Check mandatory properties
    if (!room || !start || !final || !description)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if date final is bigger than start
    if (start > final)
      throw new Error400(
        'start-final-incompatible',
        'The date set as start is bigger than the final'
      );

    // Check if properties provided exists
    if (user) await checkIfExists('users', 'id', user, 'user', true);
    await checkIfExists('rooms', 'id', room, 'room');

    // Check if there is no other booking validated in the same range
    const checkAvailabilaty = await query('bookings')
      .where('id_room', room)
      .andWhere('validated', 'true')
      .andWhere('start', '<=', start)
      .andWhere('final', '>=', final);

    if (checkAvailabilaty.length !== 0)
      throw new Error400(
        'booking-overlap',
        'Already exists a validated booking assigned to the same date range, in the same room'
      );

    // Creates a new booking
    const newBooking = await query('bookings').insert(
      {
        id_user: user || userID,
        id_room: room,
        start,
        final,
        description,
      },
      [
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated',
      ]
    );

    res.json(newBooking[0]);
  } catch (e) {
    next(e);
  }
};

const read = async (req, res, next) => {
  const { id } = req;

  try {
    const getBooking = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated'
      )
      .from('bookings')
      .where({ id });

    res.json(getBooking[0]);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { id, body } = req;
  const { userID, userControl } = req.user;
  const { user, room, start, final, description } = req.body;

  try {
    // Get bookings values
    const getBooking = await query('bookings').where({ id });

    // If true cannot change
    if (getBooking[0].validated)
      throw new Error400(
        'cannot-edit-booking',
        'Booking as been validated and cannot be updated'
      );

    // Can not change a booking of other user, unless permission given to role
    if (getBooking[0].id_user !== userID && !userControl)
      throw new Error401(
        'not-booking-owner',
        "Cannot update, because the user isn't the owner of the booking"
      );

    // If body of request empty, dosen't update
    if (Object.keys(body).length === 0)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Check if properties provided exists
    if (user) await checkIfExists('users', 'id', user, 'user', true);
    if (room) await checkIfExists('rooms', 'id', room, 'room');

    // The owner of the booking cannot change is ownership, unless permission given to role
    if (user && !userControl)
      throw new Error401(
        'not-authorized-ownership',
        "The user cannot change the booking's ownership"
      );

    // Check if date final is bigger than start
    if (start || final) {
      if (
        (start && !final && start > getBooking[0].final.toISOString()) ||
        (!start && final && getBooking[0].start.toISOString() > final) ||
        (start && final && start > final)
      )
        throw new Error400(
          'start-final-incompatible',
          'The date set as start is bigger than the final'
        );
    }
    // Check if there is no other booking validated in the same range, with the new parameters
    const checkAvailabilaty = await query('bookings')
      .where('id_room', room || getBooking[0].id_room)
      .andWhere('validated', 'true')
      .andWhere('start', '<=', start || getBooking[0].start)
      .andWhere('final', '>=', final || getBooking[0].final);

    if (checkAvailabilaty.length !== 0)
      throw new Error400(
        'booking-overlap',
        'Already exists a validated booking assigned to the same date range'
      );

    // Updates the booking
    const updateBooking = await query('bookings')
      .where({ id })
      .update({ id_user: user, id_room: room, start, final, description }, [
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated',
      ]);

    res.json(updateBooking[0]);
  } catch (e) {
    next(e);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req;
  const { force } = req.query;
  const { userID, userControl } = req.user;

  try {
    const getBooking = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated'
      )
      .from('bookings')
      .where({ id });

    // Cannot delete a booking of other user, unless permission given to role
    if (getBooking[0].user.id !== userID && !userControl)
      throw new Error401(
        'not-booking-owner',
        "The user isn't the owner of the booking"
      );

    // Prevents the deletion of a validated booking
    if (getBooking[0].validated && (!userControl || force !== 'true'))
      throw new Error400(
        'cannot-delete-booking',
        'Booking as been validated and cannot be deleted'
      );

    await query('bookings').where({ id }).del();

    res.json({ deleted: getBooking[0] });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  const { orderby, order } = req.query;

  try {
    // List Bookings
    const listBookings = await query
      .select(
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated'
      )
      .from('bookings')
      .orderBy(orderby || 'id', order || 'DESC');

    // If there is now data, throw error
    if (listBookings.length === 0)
      throw new Error404(
        'bookings-not-found',
        'No bookings were found with the given params'
      );

    res.json(listBookings);
  } catch (e) {
    next(e);
  }
};

const validate = async (req, res, next) => {
  const { id, body } = req;

  try {
    // Check mandatory properties
    if (!body.validated)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Get Booking values
    const checkBooking = await query('bookings').where({ id });

    // Check if there is no other booking validated in the same range
    const checkAvailabilaty = await query('bookings')
      .where('id_room', checkBooking[0].id_room)
      .andWhere('validated', 'true')
      .andWhere('start', '<=', checkBooking[0].start)
      .andWhere('final', '>=', checkBooking[0].final);

    if (checkAvailabilaty.length !== 0)
      throw new Error400(
        'can-not-validate',
        'Already exists a booking assign to the date range'
      );

    // Updates the validated property
    const updateBooking = await query('bookings')
      .where({ id })
      .update({ validated: body.validated }, [
        'id',
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT u.id, u.name FROM pds.users u WHERE bookings.id_user = u.id) x) AS user'
        ),
        query.raw(
          '(SELECT row_to_json(x) FROM (SELECT r.id, r.name FROM pds.rooms r WHERE bookings.id_room = r.id) x) AS room'
        ),
        'start',
        'final',
        query.raw('AGE(final, start) AS duration'),
        'description',
        'validated',
      ]);

    res.json(updateBooking[0]);
  } catch (e) {
    next(e);
  }
};

export { create, read, update, destroy, list, validate };
