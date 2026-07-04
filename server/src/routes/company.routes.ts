import { Router } from "express";
import { Role } from "@prisma/client";
import { companyController } from "../controllers/company.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  companyParamsSchema,
  createCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
} from "../validators/company.validator";

export const companyRouter = Router();

companyRouter.use(requireAuth);

/**
 * @openapi
 * /companies:
 *   get:
 *     summary: List companies (search/paginate)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of companies
 */
companyRouter.get("/", validate({ query: listCompaniesQuerySchema }), companyController.list);

companyRouter.get(
  "/:companyId",
  validate({ params: companyParamsSchema }),
  companyController.getById
);

/**
 * @openapi
 * /companies:
 *   post:
 *     summary: Create a company (Recruiter or Placement Officer)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Company created
 */
companyRouter.post(
  "/",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ body: createCompanySchema }),
  companyController.create
);

companyRouter.patch(
  "/:companyId",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: companyParamsSchema, body: updateCompanySchema }),
  companyController.update
);

companyRouter.delete(
  "/:companyId",
  requireRole(Role.PLACEMENT_OFFICER),
  validate({ params: companyParamsSchema }),
  companyController.remove
);
