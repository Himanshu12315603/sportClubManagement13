import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as cafeService from './cafeteria.service';
import { CafeOrderStatus } from './cafeteria.model';

export const createMenuItem = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const item = await cafeService.createMenuItem(req.body);
  sendCreated(res, { item }, 'Menu item created');
});

export const getMenu = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const items = await cafeService.getMenu(req.query.category as string | undefined);
  sendSuccess(res, { items }, 'Menu fetched');
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const item = await cafeService.updateMenuItem(getParam(req), req.body);
  sendSuccess(res, { item }, 'Menu item updated');
});

export const createTable = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const table = await cafeService.createTable(req.body);
  sendCreated(res, { table }, 'Table created');
});

export const getTables = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const tables = await cafeService.getTables();
  sendSuccess(res, { tables }, 'Tables fetched');
});

export const updateTableStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { status } = req.body as { status: string };
  const table = await cafeService.updateTableStatus(getParam(req), status);
  sendSuccess(res, { table }, 'Table status updated');
});

export const createOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const order = await cafeService.createCafeOrder({ ...req.body, createdById: req.user!._id.toString() });
  sendCreated(res, { order }, 'Order created');
});

export const getOrders = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await cafeService.getCafeOrders({
    status: req.query.status as string | undefined,
    tableId: req.query.table as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Cafe orders fetched');
});

export const getOrderById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const order = await cafeService.getCafeOrderById(getParam(req));
  sendSuccess(res, { order }, 'Order fetched');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { status, paymentMethod, paymentReference } = req.body as {
    status: CafeOrderStatus;
    paymentMethod?: string;
    paymentReference?: string;
  };
  const order = await cafeService.updateCafeOrderStatus(
    getParam(req),
    status,
    req.user!._id.toString(),
    paymentMethod,
    paymentReference
  );
  sendSuccess(res, { order }, 'Order status updated');
});
