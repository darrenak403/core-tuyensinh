import { AdmissionYearsService } from "@services/admission-years.service";
import type { Context } from "hono";

const admissionYearsService = new AdmissionYearsService();

export const getAdmissionYearsHandler = async (c: Context) => {
  const data = await admissionYearsService.findAll();
  return c.json({ data }, 200);
};

export const createAdmissionYearHandler = async (c: Context) => {
  const data = await c.req.json();
  try {
    const year = await admissionYearsService.create(data);
    return c.json({ data: year }, 201);
  } catch (error: any) {
    return c.json(
      {
        error: error.message.includes("đã tồn tại") ? "CONFLICT" : "VALIDATION_ERROR",
        message: error.message,
      },
      error.message.includes("đã tồn tại") ? 409 : 400
    );
  }
};

export const updateAdmissionYearHandler = async (c: Context) => {
  const year = Number(c.req.param("year"));
  const data = await c.req.json();
  try {
    const updated = await admissionYearsService.update(year, data);
    return c.json({ data: updated }, 200);
  } catch (error: any) {
    return c.json(
      {
        error: error.message.includes("không tồn tại") ? "NOT_FOUND" : "VALIDATION_ERROR",
        message: error.message,
      },
      error.message.includes("không tồn tại") ? 404 : 400
    );
  }
};

export const deleteAdmissionYearHandler = async (c: Context) => {
  const year = Number(c.req.param("year"));
  try {
    await admissionYearsService.delete(year);
    return c.json({ message: "Admission year deleted successfully" }, 200);
  } catch (error: any) {
    if (error.message.includes("không tồn tại")) {
      return c.json({ error: "NOT_FOUND", message: error.message }, 404);
    }
    return c.json({ error: "VALIDATION_ERROR", message: error.message }, 400);
  }
};
