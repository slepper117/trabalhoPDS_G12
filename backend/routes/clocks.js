import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as clocksController from '../controllers/clocks.js';

const router = express.Router();

router.get('/', checkAuth('clocks', 'list'), clocksController.list);
router.post('/', checkAuth('clocks', 'create'), clocksController.create);
router.get(
  '/:id',
  checkAuth('clocks', 'read'),
  checkID('clocks'),
  clocksController.read
);
router.put(
  '/:id',
  checkAuth('clocks', 'update'),
  checkID('clocks'),
  clocksController.update
);
router.delete(
  '/:id',
  checkAuth('clocks', 'destroy'),
  checkID('clocks'),
  clocksController.destroy
);

export default router;
