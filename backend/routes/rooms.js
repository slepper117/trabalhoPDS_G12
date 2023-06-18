import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as roomsController from '../controllers/rooms.js';

const router = express.Router();

router.get('/', checkAuth('rooms', 'list'), roomsController.list);
router.post('/', checkAuth('rooms', 'create'), roomsController.create);
router.get(
  '/:id',
  checkAuth('rooms', 'read'),
  checkID('rooms'),
  roomsController.read
);
router.put(
  '/:id',
  checkAuth('rooms', 'update'),
  checkID('rooms'),
  roomsController.update
);
router.delete(
  '/:id',
  checkAuth('rooms', 'destroy'),
  checkID('rooms'),
  roomsController.destroy
);

export default router;
