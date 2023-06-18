import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as usersController from '../controllers/users.js';

const router = express.Router();

router.get('/', checkAuth('users', 'list'), usersController.list);
router.post('/', checkAuth('users', 'create'), usersController.create);
router.get(
  '/:id',
  checkAuth('users', 'read'),
  checkID('users'),
  usersController.read
);
router.put(
  '/:id',
  checkAuth('users', 'update'),
  checkID('users'),
  usersController.update
);
router.delete(
  '/:id',
  checkAuth('users', 'destroy'),
  checkID('users'),
  usersController.destroy
);

export default router;
