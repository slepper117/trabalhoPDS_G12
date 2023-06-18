import query from '../database/knex.js';
import { Error400, Error404 } from '../classes/errors.js';

/**
 * Function to pass a String to a Middleware
 * @param {string} relation Table were search is going to be made
 * @returns Middleware with given parameter
 */
const checkID = (relation) => async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if ID exists
    if (id) {
      // Check if ID is Number
      const isNum = parseInt(id, 10);
      if (!isNum)
        throw new Error400(
          'param-not-valid',
          "The ID parameter isn't a number"
        );

      // Search in the database
      const getID = await query(relation).select('id').where({ id });

      // Verify result
      if (getID.length === 0)
        throw new Error404(
          'resource-not-found',
          "The indicated 'ID' cannot be found"
        );

      req.id = getID[0].id;
    } else {
      throw new Error400(
        'param-not-provided',
        "The 'ID' parameter isn't provided"
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkID;
