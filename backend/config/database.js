const dbconfig = {
  client: 'pg',
  connection: `${process.env.CONNECTION_STRING}?ssl=true`,
  searchPath: ['pds'],
};

export default dbconfig;
