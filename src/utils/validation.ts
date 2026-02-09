import { z } from "zod";

const sanitizeString = (val: string) =>
  val.replace(/[<>]/g, "").trim();

export const tenantNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be under 100 characters")
  .transform(sanitizeString);

export const companyNameSchema = z
  .string()
  .trim()
  .max(100, "Company name must be under 100 characters")
  .transform(sanitizeString);

export const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(1000, "Description must be under 1000 characters")
  .transform(sanitizeString);

export const commentSchema = z
  .string()
  .trim()
  .max(1000, "Comment must be under 1000 characters")
  .transform(sanitizeString);

export const unitNumberSchema = z
  .string()
  .trim()
  .min(1, "Unit number is required")
  .max(20, "Unit number must be under 20 characters")
  .transform(sanitizeString);

export const ratingSchema = z
  .number()
  .int()
  .min(1, "Please select a rating")
  .max(5, "Rating must be between 1 and 5");

export const annualRentSchema = z
  .number()
  .positive("Annual rent must be greater than 0")
  .max(100_000_000, "Annual rent seems too high");

export const maintenanceRequestSchema = z.object({
  tenantName: tenantNameSchema,
  companyName: companyNameSchema,
  unitNumber: unitNumberSchema,
  building: z.string().min(1, "Building is required"),
  description: descriptionSchema,
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const feedbackSchema = z.object({
  tenantName: tenantNameSchema,
  companyName: companyNameSchema,
  rating: ratingSchema,
  comment: commentSchema,
});

export const rentCalculatorSchema = z.object({
  tenantName: tenantNameSchema,
  companyName: companyNameSchema,
  contractType: z.string().min(1, "Contract type is required"),
  buildingId: z.string().min(1, "Building is required"),
  unitId: z.string().min(1, "Unit is required"),
  leaseStartDate: z.string().min(1, "Lease start date is required"),
  annualRent: annualRentSchema,
});
