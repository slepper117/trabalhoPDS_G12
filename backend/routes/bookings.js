import express from 'express';
import checkID from '../middleware/checkID.js';
import checkAuth from '../middleware/checkAuth.js';
import * as bookingsController from '../controllers/bookings.js';

const router = express.Router();

router.get('/', checkAuth('bookings', 'list'), bookingsController.list);
router.post('/', checkAuth('bookings', 'create'), bookingsController.create);
router.get(
  '/:id',
  checkAuth('bookings', 'read'),
  checkID('bookings'),
  bookingsController.read
);
router.put(
  '/:id',
  checkAuth('bookings', 'update'),
  checkID('bookings'),
  bookingsController.update
);
router.delete(
  '/:id',
  checkAuth('bookings', 'destroy'),
  checkID('bookings'),
  bookingsController.destroy
);

// Validar a reserva
router.patch(
  '/:id/validate',
  checkAuth('bookings', 'validate'),
  checkID('bookings'),
  bookingsController.validate
);

export default router;
