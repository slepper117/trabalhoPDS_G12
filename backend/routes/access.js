import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as accessController from '../controllers/access.js';

const router = express.Router();

router.post(
  '/clockIn',
  checkAuth('access', 'clockIn'),
  accessController.clockIn
);
router.post(
  '/clockOut',
  checkAuth('access', 'clockOut'),
  accessController.clockOut
);
router.post(
  '/area/:id',
  checkAuth('access', 'area'),
  checkID('areas'),
  accessController.accessArea
);
router.post(
  '/room/:id',
  checkAuth('access', 'room'),
  checkID('rooms'),
  accessController.accessRoom
);

export default router;
