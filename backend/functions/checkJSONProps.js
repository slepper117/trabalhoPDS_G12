import checkIfExists from './checkIfExists.js';
import { Error400 } from '../classes/errors.js';

/**
 * Function to check if a value is a Object and meets the requirements.
 * @param {object} object Object in JSON with ID's
 * @param {string} relation Table were toe be made the verification of ID's
 * @param {string} name Name of the value were to verify
 * @returns An array of numbers with
 */
const checkJSONProps = async (object, relation, name) => {
  // Check if value is a Object
  if (typeof object !== 'object')
    throw new Error400(
      `${name}-json-not-valid`,
      `The indicated '${name}' property isn't a valid JSON Object`
    );

  // Check if JSON as user ID property
  const arrayID = object.map(({ id }) => id);
  if (arrayID.some((i) => i === undefined))
    throw new Error400(
      `${name}-key-not-valid`,
      `The indicated '${name}' property don't have the required key`
    );

  // Check if ID's on Object are duplicated
  const ckeckDuplicate = arrayID.filter(
    (item, index) => arrayID.indexOf(item) !== index
  );
  if (ckeckDuplicate.length !== 0)
    throw new Error400(
      `${name}-values-duplicated`,
      `The '${name}' property has values duplicated`
    );

  // Check if ID's exists
  if (arrayID.length !== 0) {
    await Promise.all(
      arrayID.map(async (value) => {
        await checkIfExists(relation, 'id', value, `${name}-id`, true);
      })
    );
  }

  return arrayID;
};

export default checkJSONProps;
