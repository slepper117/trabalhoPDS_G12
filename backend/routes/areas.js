import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as areasController from '../controllers/areas.js';

const router = express.Router();

router.get('/', checkAuth('areas', 'list'), areasController.list);
router.post('/', checkAuth('areas', 'create'), areasController.create);
router.get(
  '/:id',
  checkAuth('areas', 'read'),
  checkID('areas'),
  areasController.read
);
router.put(
  '/:id',
  checkAuth('areas', 'update'),
  checkID('areas'),
  areasController.update
);
router.delete(
  '/:id',
  checkAuth('areas', 'destroy'),
  checkID('areas'),
  areasController.destroy
);

export default router;
