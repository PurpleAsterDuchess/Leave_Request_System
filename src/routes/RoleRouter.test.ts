import request from "supertest";
import express, { Router } from "express";
import { RoleRouter } from "./RoleRouter";
import { RoleController } from "../controllers/RoleController";
import { StatusCodes } from "http-status-codes";

const mockRoleController = {
  delete: jest.fn((req, res) =>
    res.status(StatusCodes.OK).json({ id: req.params.id })
  ),
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
  getById: jest.fn((req, res) =>
    res.status(StatusCodes.OK).json({ id: req.params.id })
  ),
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  update: jest.fn((req, res) => res.status(StatusCodes.OK).json(req.body)),
} as unknown as RoleController;

const router = Router();
jest.spyOn(router, "get");
jest.spyOn(router, "post");
jest.spyOn(router, "patch");
jest.spyOn(router, "delete");
jest.spyOn(router, "use");

const app = express();
const helmet = require("helmet");
app.use(helmet());
app.use(express.json());
const roleRouter = new RoleRouter(router, mockRoleController);
app.use("/roles", roleRouter.getRouter());

const BASE_ROLES_URL = "/roles";
describe("RoleRouter tests", () => {
  it("getAll on GET /roles can be called", async () => {
    // Act
    const response = await request(app)
      .get(BASE_ROLES_URL)
      .expect(StatusCodes.OK);

    // Assert
    expect(mockRoleController.getAll).toHaveBeenCalled();
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual([]);
  });

  it("getById route GET /roles/:id can be called", async () => {
    // Arrange
    const id = "1";
    const endPoint = `${BASE_ROLES_URL}/${id}`;

    // Act
    const response = await request(app).get(endPoint);
    let requestedUrl = (mockRoleController.getById as jest.Mock).mock
      .calls[0][0].originalUrl;

    // Assert
    expect(requestedUrl).toBeDefined();
    expect(requestedUrl).toBe(endPoint);
    expect(response.status).toBe(StatusCodes.OK);

    // should possibly be getting id from rolecontroller?
    expect(response.body).toEqual({ id });
  });

  it("Create route POST /roles can be called", async () => {
    // Arrange
    const newRoleData = { name: "manager" };

    // Act
    const response = await request(app)
      .post(BASE_ROLES_URL)
      .send(newRoleData)
      .expect(StatusCodes.CREATED);

    let body = (mockRoleController.create as jest.Mock).mock.calls[0][0].body;

    // Assert
    expect(body).toBeDefined();
    expect(mockRoleController.create).toHaveBeenCalled();
    expect(body).toStrictEqual(newRoleData);
    expect(response.status).toBe(StatusCodes.CREATED);
  });

  it("Update route PATCH /roles can be called", async () => {
    // Arrange
    const updateRoleData = { id: 1, name: "Updated Role" };

    // Act
    const response = await request(app)
      .patch(BASE_ROLES_URL)
      .send(updateRoleData)
      .expect(StatusCodes.OK);
    let body = (mockRoleController.update as jest.Mock).mock.calls[0][0].body;

    // Assert
    expect(body).toBeDefined();
    expect(body).toStrictEqual(updateRoleData);
    expect(mockRoleController.update).toHaveBeenCalled();
    expect(response.status).toBe(StatusCodes.OK);
  });

  it("Delete route DELETE /roles/:id can be called", async () => {
    // Arrange
    const id = "1";
    const endPoint = `${BASE_ROLES_URL}/1`;

    // Act
    const response = await request(app).delete(endPoint).expect(StatusCodes.OK);
    let url = (mockRoleController.delete as jest.Mock).mock.calls[0][0]
      .originalUrl;

    // Assert
    expect(url).toBeDefined();
    expect(mockRoleController.delete).toHaveBeenCalled();
    expect(url).toBe(endPoint);
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ id });
  });
});
