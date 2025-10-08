import { z } from "zod";
import { cuid, timestamp } from "./common";

export const UserCreate = z.object({
  email: z.string().email(),
});

export const UserUpdate = z.object({
  email: z.string().email().optional(),
});

export const UserEntity = z.object({
  id: cuid,
  email: z.string().email(),
  createdAt: timestamp,
});
export type User = z.infer<typeof UserEntity>;
