import query from '../database/knex.js';
import { Error400, Error404 } from '../classes/errors.js';

const create = async (req, res, next) => {
  const { name } = req.body;

  try {
    // Check mandatory properties
    if (!name)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Creates a new room
    const newRoom = await query('rooms').insert({ name }, 'id');

    // Get the newly created room, with count
    const getNewRoom = await query
      .select('r.id', 'r.name', query.raw('count(b.id)::INTEGER AS bookings'))
      .from({ r: 'rooms' })
      .leftJoin({ b: 'bookings' }, 'r.id', 'b.id_room')
      .where('r.id', newRoom[0].id)
      .groupBy('r.id');

    res.json(getNewRoom[0]);
  } catch (e) {
    next(e);
  }
};

const read = async (req, res, next) => {
  const { id } = req;

  try {
    // Get the room based on id
    const getRoom = await query
      .select('r.id', 'r.name', query.raw('count(b.id)::INTEGER AS bookings'))
      .from({ r: 'rooms' })
      .leftJoin({ b: 'bookings' }, 'r.id', 'b.id_room')
      .where('r.id', id)
      .groupBy('r.id');

    res.json(getRoom[0]);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { id } = req;
  const { name } = req.body;

  try {
    // Check mandatory properties
    if (!name)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // Updates room
    const updateRoom = await query('rooms')
      .where({ id })
      .update({ name }, 'id');

    // Get the newly updated room
    const getUpdatedRoom = await query
      .select('r.id', 'r.name', query.raw('count(b.id)::INTEGER AS bookings'))
      .from({ r: 'rooms' })
      .leftJoin({ b: 'bookings' }, 'r.id', 'b.id_room')
      .where('r.id', updateRoom[0].id)
      .groupBy('r.id');

    res.json(getUpdatedRoom[0]);
  } catch (e) {
    next(e);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req;
  const { force } = req.query;

  try {
    // Get room to delete
    const getDelRoom = await query
      .select('r.id', 'r.name', query.raw('count(b.id)::INTEGER AS bookings'))
      .from({ r: 'rooms' })
      .leftJoin({ b: 'bookings' }, 'r.id', 'b.id_room')
      .where('r.id', id)
      .groupBy('r.id');

    // If room has bookings
    if (getDelRoom[0].bookings !== 0) {
      // Check if forces equals true
      if (force === 'true')
        // Deletes bookings
        await query('bookings').where({ id_room: id }).del();
      else
        throw new Error400(
          'cannot-delete-rooms',
          'Rooms as bookings associated'
        );
    }

    // Delete room
    await query('rooms').where({ id }).del();

    res.json({ deleted: getDelRoom[0] });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  const { orderby, order } = req.query;

  try {
    // List Rooms
    const listRooms = await query
      .select('r.id', 'r.name', query.raw('count(b.id)::INTEGER AS bookings'))
      .from({ r: 'rooms' })
      .leftJoin({ b: 'bookings' }, 'r.id', 'b.id_room')
      .groupBy('r.id')
      .orderBy(orderby || 'bookings', order || 'DESC');

    // If there are no information, throw error
    if (listRooms.length === 0)
      throw new Error404(
        'rooms-not-found',
        'No rooms were found with the given params'
      );

    res.json(listRooms);
  } catch (e) {
    next(e);
  }
};

export { create, read, update, destroy, list };
