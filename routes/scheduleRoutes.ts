import express from "express";
import { isLoggedInAPI } from "../util/guard";

export const scheduleRoutes = express.Router();

scheduleRoutes.get("/", isLoggedInAPI)