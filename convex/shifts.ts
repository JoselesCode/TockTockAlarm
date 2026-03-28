import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Helper to get the current user
async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ message: "Usuario no autenticado", code: "UNAUTHENTICATED" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) {
    throw new ConvexError({ message: "Usuario no encontrado", code: "NOT_FOUND" });
  }
  return user;
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("shifts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const initDefaultShifts = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    // Check if user already has shifts
    const existing = await ctx.db
      .query("shifts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existing) return null;

    // Default shifts with default alarms
    const defaults = [
      {
        name: "Turno Mañana",
        icon: "sun",
        color: "amber",
        startTime: "05:30",
        endTime: "13:30",
        isActive: false,
        order: 0,
        alarms: [
          { label: "Despertar", time: "04:30", days: [1, 2, 3, 4, 5] },
          { label: "Prepararse", time: "05:00", days: [1, 2, 3, 4, 5] },
          { label: "Salir al trabajo", time: "05:10", days: [1, 2, 3, 4, 5] },
        ],
      },
      {
        name: "Turno Tarde",
        icon: "sunset",
        color: "orange",
        startTime: "13:30",
        endTime: "21:30",
        isActive: false,
        order: 1,
        alarms: [
          { label: "Despertar", time: "12:00", days: [1, 2, 3, 4, 5] },
          { label: "Prepararse", time: "12:45", days: [1, 2, 3, 4, 5] },
          { label: "Salir al trabajo", time: "13:00", days: [1, 2, 3, 4, 5] },
        ],
      },
      {
        name: "Turno Noche",
        icon: "moon",
        color: "indigo",
        startTime: "21:30",
        endTime: "05:30",
        isActive: false,
        order: 2,
        alarms: [
          { label: "Despertar", time: "20:00", days: [0, 1, 2, 3, 4, 5, 6] },
          { label: "Prepararse", time: "20:45", days: [0, 1, 2, 3, 4, 5, 6] },
          { label: "Salir al trabajo", time: "21:00", days: [0, 1, 2, 3, 4, 5, 6] },
        ],
      },
    ];

    for (const s of defaults) {
      const shiftId = await ctx.db.insert("shifts", {
        userId: user._id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
        order: s.order,
        isDefault: true,
      });
      for (let i = 0; i < s.alarms.length; i++) {
        const a = s.alarms[i];
        await ctx.db.insert("alarms", {
          shiftId,
          userId: user._id,
          label: a.label,
          time: a.time,
          enabled: true,
          days: a.days,
          order: i,
        });
      }
    }
    return null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const existing = await ctx.db
      .query("shifts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return await ctx.db.insert("shifts", {
      userId: user._id,
      name: args.name,
      icon: args.icon,
      color: args.color,
      startTime: args.startTime,
      endTime: args.endTime,
      isActive: false,
      order: existing.length,
      isDefault: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("shifts"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const shift = await ctx.db.get(args.id);
    if (!shift || shift.userId !== user._id) {
      throw new ConvexError({ message: "Turno no encontrado", code: "NOT_FOUND" });
    }
    const { id, ...fields } = args;
    const toUpdate: Partial<typeof shift> = {};
    if (fields.name !== undefined) toUpdate.name = fields.name;
    if (fields.icon !== undefined) toUpdate.icon = fields.icon;
    if (fields.color !== undefined) toUpdate.color = fields.color;
    if (fields.startTime !== undefined) toUpdate.startTime = fields.startTime;
    if (fields.endTime !== undefined) toUpdate.endTime = fields.endTime;
    await ctx.db.patch(id, toUpdate);
  },
});

export const setActive = mutation({
  args: { id: v.id("shifts"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    // If activating, deactivate all other shifts first
    if (args.isActive) {
      const allShifts = await ctx.db
        .query("shifts")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const s of allShifts) {
        if (s._id !== args.id && s.isActive) {
          await ctx.db.patch(s._id, { isActive: false });
        }
      }
    }
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("shifts") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const shift = await ctx.db.get(args.id);
    if (!shift || shift.userId !== user._id) {
      throw new ConvexError({ message: "Turno no encontrado", code: "NOT_FOUND" });
    }
    // Delete all alarms in this shift first
    const alarms = await ctx.db
      .query("alarms")
      .withIndex("by_shift", (q) => q.eq("shiftId", args.id))
      .collect();
    for (const alarm of alarms) {
      await ctx.db.delete(alarm._id);
    }
    await ctx.db.delete(args.id);
  },
});
