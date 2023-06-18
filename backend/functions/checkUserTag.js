import query from '../database/knex.js';
import { Error401, Error404 } from '../classes/errors.js';

/**
 * Function to verify if a tag existes anf if user is on schedule
 * @param {string} tag Tag of user
 * @param {date} datetime Value of type Date, with the current date
 * @param {boolean} ignoreSchedule Option to ignore schedule. Default: `false`
 * @returns Array with users values
 */
const checkUserTag = async (tag, datetime, ignoreSchedule = false) => {
  // Get User values
  const getUser = await query
    .select('u.id', 'u.name', 'u.schedule', 'ur.access')
    .from({ u: 'users' })
    .join({ ur: 'user_roles' }, 'u.id_user_role', 'ur.id')
    .where({ tag });

  // If user dosen't exists throw a error
  if (getUser.length === 0)
    throw new Error404(
      'tag-not-found',
      "The tag provided dosen't match with a user"
    );

  // Check if user is on work schesule
  if (
    getUser[0].schedule[datetime.getUTCDay()] === '0' &&
    !getUser[0].access &&
    !ignoreSchedule
  )
    throw new Error401('not-authorized', "The user isn't in work schedule");

  return getUser[0];
};

export default checkUserTag;
