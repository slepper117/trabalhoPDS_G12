import query from '../database/knex.js';
import checkJSONProps from '../functions/checkJSONProps.js';
import { Error400, Error404 } from '../classes/errors.js';

const create = async (req, res, next) => {
  const { name, authorized } = req.body;
  let arrayID = [];

  try {
    // Check mandatory properties
    if (!name)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // If as authorized object, check requirements
    if (authorized)
      arrayID = await checkJSONProps(authorized, 'users', 'authorized');

    // Creates a new area
    const newArea = await query('areas').insert({ name }, 'id');

    // Insert on table users_areas
    if (arrayID.length !== 0) {
      await Promise.all(
        arrayID.map(async (value) => {
          await query('users_areas').insert({
            id_user: value,
            id_area: newArea[0].id,
          });
        })
      );
    }

    // Get the newly created area, with authorized
    const getNewArea = await query
      .select(
        'id',
        'name',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT u.id, u.name FROM pds.users_areas ua JOIN pds.users u ON u.id = ua.id_user WHERE ua.id_area = areas.id)x),'[]') AS authorized"
        )
      )
      .from('areas')
      .where('id', newArea[0].id);

    res.json(getNewArea[0]);
  } catch (e) {
    next(e);
  }
};

const read = async (req, res, next) => {
  const { id } = req;

  try {
    // Get the area based on id
    const getArea = await query
      .select(
        'id',
        'name',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT u.id, u.name FROM pds.users_areas ua JOIN pds.users u ON u.id = ua.id_user WHERE ua.id_area = areas.id)x),'[]') AS authorized"
        )
      )
      .from('areas')
      .where({ id });

    res.json(getArea[0]);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  const { id } = req;
  const { name, authorized } = req.body;
  let arrayID;

  try {
    // Check mandatory properties
    if (!name && !authorized)
      throw new Error400(
        'mandatory-props-are-missing',
        'Check if the mandatory properties are missing'
      );

    // If as name updates field
    if (name) await query('areas').where({ id }).update({ name });

    // If authorized object, check requirements
    if (authorized) {
      // Check requirements
      arrayID = await checkJSONProps(authorized, 'users', 'authorized');

      // If array validated as items
      if (arrayID.length !== 0) {
        // Deletes old associations in table users_areas
        await query('users_areas').where('id_area', id).del();

        // Creates new associations
        await Promise.all(
          arrayID.map(async (value) => {
            await query('users_areas').insert({
              id_user: value,
              id_area: id,
            });
          })
        );
      }
    }

    // Get the newly updated area
    const getAreaUpdated = await query
      .select(
        'areas.id',
        'areas.name',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT u.id, u.name FROM pds.users_areas ua JOIN pds.users u ON u.id = ua.id_user WHERE ua.id_area = areas.id)x),'[]') AS authorized"
        )
      )
      .from('areas')
      .where({ id });

    res.json(getAreaUpdated[0]);
  } catch (e) {
    next(e);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req;
  const { force } = req.query;

  try {
    // Get area to delete
    const getArea = await query
      .select(
        'id',
        'name',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT u.id, u.name FROM pds.users_areas ua JOIN pds.users u ON u.id = ua.id_user WHERE ua.id_area = areas.id)x),'[]') AS authorized"
        )
      )
      .from('areas')
      .where({ id });

    // If area has users authorized
    if (getArea[0].authorized.length !== 0) {
      // Check if forces equals true
      if (force === 'true')
        // Deletes associations in table users_areas
        await query('users_areas').where('id_area', id).del();
      else throw new Error400('cannot-delete-area', 'Area as users associated');
    }

    // Deletes area
    await query('areas').where({ id }).del();

    res.json({ deleted: getArea[0] });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  const { orderby, order } = req.query;

  try {
    // Get Array with areas
    const listAreas = await query
      .select(
        'id',
        'name',
        query.raw(
          "coalesce((SELECT array_to_json(array_agg(row_to_json(x))) FROM (SELECT u.id, u.name FROM pds.users_areas ua JOIN pds.users u ON u.id = ua.id_user WHERE ua.id_area = areas.id)x),'[]') AS authorized"
        )
      )
      .from('areas')
      .orderBy(orderby || 'id', order || 'DESC');

    // If there are no information, throw error
    if (listAreas.length === 0)
      throw new Error404(
        'areas-not-found',
        'No areas were found with the given params'
      );

    res.json(listAreas);
  } catch (e) {
    next(e);
  }
};

export { create, read, update, destroy, list };
