import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  shifts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    icon: v.string(), // "sun" | "sunset" | "moon" | "briefcase"
    color: v.string(), // "amber" | "orange" | "indigo" | "teal" | "rose"
    startTime: v.string(), // HH:MM
    endTime: v.string(), // HH:MM
    isActive: v.boolean(),
    order: v.number(),
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  alarms: defineTable({
    shiftId: v.id("shifts"),
    userId: v.id("users"),
    label: v.string(),
    time: v.string(), // HH:MM
    enabled: v.boolean(),
    days: v.array(v.number()), // 0=Sun,1=Mon,...,6=Sat
    order: v.number(),
  })
    .index("by_shift", ["shiftId"])
    .index("by_user", ["userId"]),

  attendance: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("checkin"), v.literal("checkout")),
    timestamp: v.string(), // ISO 8601 UTC
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    shiftId: v.optional(v.id("shifts")),
    note: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),
});
