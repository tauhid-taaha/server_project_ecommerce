import express from "express";
 import {registerController,loginController,testController,orderStatusController,getAllOrdersController,getOrdersController,google,confirmOrderController} from '../controller/authController.js'

 import { requireSignIn ,isAdmin} from "../middlewares/authMiddleware.js";
const router =express.Router()

router.post('/register',registerController)
router.post("/login", loginController);
router.get("/test", requireSignIn,isAdmin, testController);
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
  router.get("/admin-auth", requireSignIn,isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
  });
  router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders",  getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);
router.post("/google-login", google);
router.post("/confirm-order", requireSignIn, confirmOrderController);
export default router