import Router from "express";
const productRouter = Router();

import { getAllPoducts, getProductByQuery, getProductById } from "../controllers/productController.js";

// this route is accessible by all users
productRouter
  .get("/allProducts", getAllPoducts)
  .get("/aProduct", getProductByQuery)
  .get("/aProduct/:id", getProductById)


export default productRouter;
