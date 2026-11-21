import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as productService from './product.service';

export const createCategory = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const cat = await productService.createCategory(req.body);
  sendCreated(res, { category: cat }, 'Category created');
});

export const getCategories = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const categories = await productService.getCategories();
  sendSuccess(res, { categories }, 'Categories fetched');
});

export const createProduct = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, { product }, 'Product created');
});

export const getProducts = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await productService.getProducts({
    search: req.query.search as string | undefined,
    categoryId: req.query.category as string | undefined,
    online: req.query.online === 'true',
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Products fetched');
});

export const getProductById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const product = await productService.getProductById(getParam(req));
  sendSuccess(res, { product }, 'Product fetched');
});

export const updateProduct = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const product = await productService.updateProduct(getParam(req), req.body);
  sendSuccess(res, { product }, 'Product updated');
});

export const adjustStock = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { productId, quantity, type, reference, notes } = req.body as {
    productId: string;
    quantity: number;
    type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';
    reference?: string;
    notes?: string;
  };
  const result = await productService.adjustStock(productId, quantity, type, req.user!._id.toString(), reference, notes);
  sendSuccess(res, result, 'Stock adjusted');
});

// ---- Orders ----
export const createOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const order = await productService.createOrder({ ...req.body, customerId: req.user!._id.toString() });
  sendCreated(res, { order }, 'Order placed successfully');
});

export const getOrders = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await productService.getOrders({
    customerId: req.query.customer as string | undefined,
    status: req.query.status as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Orders fetched');
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await productService.getOrders({ customerId: req.user!._id.toString() });
  sendSuccess(res, result, 'Your orders fetched');
});

export const getOrderById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const order = await productService.getOrderById(getParam(req));
  sendSuccess(res, { order }, 'Order fetched');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { status } = req.body as { status: string };
  const order = await productService.updateOrderStatus(getParam(req), status, req.user!._id.toString());
  sendSuccess(res, { order }, 'Order status updated');
});
