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

/**
 * @openapi
 * /companies/me:
 *   get:
 *     summary: Get the logged-in recruiter's own company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The recruiter's company
 *       404:
 *         description: Recruiter does not manage a company
 */
companyRouter.get("/me", requireRole(Role.RECRUITER), companyController.getMyCompany);

/**
 * @openapi
 * /companies/{companyId}:
 *   get:
 *     summary: Get a company by id
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 */
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

/**
 * @openapi
 * /companies/{companyId}:
 *   patch:
 *     summary: Update a company (owning Recruiter or Placement Officer)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company updated
 *       403:
 *         description: Not the owning recruiter
 */
companyRouter.patch(
  "/:companyId",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: companyParamsSchema, body: updateCompanySchema }),
  companyController.update
);

/**
 * @openapi
 * /companies/{companyId}:
 *   delete:
 *     summary: Delete a company (Placement Officer only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company deleted
 */
companyRouter.delete(
  "/:companyId",
  requireRole(Role.PLACEMENT_OFFICER),
  validate({ params: companyParamsSchema }),
  companyController.remove
);
