import knex from 'knex';
import dbconfig from '../config/database.js';

const query = knex(dbconfig);

export default query;