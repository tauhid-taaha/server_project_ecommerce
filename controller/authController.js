import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Order from "../models/orderModel.js"
import orderModel from "../models/orderModel.js"
import admin from "../middlewares/firebase-admin.js"
import JWT from "jsonwebtoken";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";


export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is Required" });
    }
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};
export const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
  };
  export const testController=(req,res)=>{
    console.log('protected route')
  }
  export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: -1 }); // Correct sort format
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Getting Orders",
        error,
      });
    }
  };
  
  //order status
  export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };
  export const google = async (req, res, next) => {
    try {
      console.log('Request body:', req.body); // Log the incoming request body
      
      const { email, name, photo } = req.body; // Destructure values from the request body
      
      // Validation
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if the user already exists
      const existingUser = await userModel.findOne({ email });
      
      if (existingUser) {
        // If the user exists, create a JWT token and return the user details
        const token = JWT.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
          expiresIn: '7d', // You can adjust the expiry as needed
        });
        
        const { password: hashedPassword, ...rest } = existingUser._doc; // Exclude the password from the response
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry for the cookie
        
        return res
          .cookie('access_token', token, {
            httpOnly: true,
            expires: expiryDate,
          })
          .status(200)
          .json(rest); // Send the user details without the password
      } else {
        // If the user doesn't exist, create a new user
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = '00'; // Since Google login doesn't provide a password, we set it as empty
        const newUser = new userModel({
          name: name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-8),
          email,
          password: hashedPassword, // Empty password for Google login
          profilePicture: photo, // Save the user's profile picture
          // Default values for required fields
          phone: '01721212', // Default value for phone
          address: 'HOUSE 10 UTTARA', // Default value for address
          answer: 'NOOO', // Default value for the security question answer
        });
        
        await newUser.save();
        
        // Create a JWT token for the new user
        const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        const { password: hashedPassword2, ...rest } = newUser._doc; // Exclude password from response
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry for the cookie
  
        return res
          .cookie('access_token', token, {
            httpOnly: true,
            expires: expiryDate,
          })
          .status(200)
          .json(rest); // Return the user details without the password
      }
    } catch (error) {
      console.error(error);
      next(error); // Pass the error to the next middleware
    }
  };
  export const confirmOrderController = async (req, res) => {
    try {
      const { products, payment, buyerId, shippingAddress } = req.body;
  
      // Validation
      if (!products || products.length === 0) {
        return res.status(400).send({ error: "Products are required" });
      }
      if (!payment || !payment.method || !payment.amount) {
        return res.status(400).send({ error: "Payment details are required" });
      }
      if (!buyerId) {
        return res.status(400).send({ error: "Buyer ID is required" });
      }
      if (!shippingAddress) {
        return res.status(400).send({ error: "Shipping address is required" });
      }
  
      // Calculate total price
      let totalPrice = 0;
      for (let productId of products) {
        const product = await productModel.findById(productId);
        if (product) {
          totalPrice += product.price; // You might want to consider quantity as well
        }
      }
  
      const newOrder = new orderModel({
        products,
        payment,
        buyer: buyerId,
        shippingAddress,
        status: "Not Process", // default status
      });
  
      await newOrder.save();
  
      res.status(201).send({
        success: true,
        message: "Order Confirmed Successfully",
        order: newOrder,
        totalPrice,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while confirming the order",
        error,
      });
    }
  };
  