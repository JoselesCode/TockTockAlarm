import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

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

export const getByShift = query({
  args: { shiftId: v.id("shifts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("alarms")
      .withIndex("by_shift", (q) => q.eq("shiftId", args.shiftId))
      .collect();
  },
});

export const create = mutation({
  args: {
    shiftId: v.id("shifts"),
    label: v.string(),
    time: v.string(),
    days: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const shift = await ctx.db.get(args.shiftId);
    if (!shift || shift.userId !== user._id) {
      throw new ConvexError({ message: "Turno no encontrado", code: "NOT_FOUND" });
    }
    const existing = await ctx.db
      .query("alarms")
      .withIndex("by_shift", (q) => q.eq("shiftId", args.shiftId))
      .collect();
    return await ctx.db.insert("alarms", {
      shiftId: args.shiftId,
      userId: user._id,
      label: args.label,
      time: args.time,
      enabled: true,
      days: args.days,
      order: existing.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("alarms"),
    label: v.optional(v.string()),
    time: v.optional(v.string()),
    days: v.optional(v.array(v.number())),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const alarm = await ctx.db.get(args.id);
    if (!alarm || alarm.userId !== user._id) {
      throw new ConvexError({ message: "Alarma no encontrada", code: "NOT_FOUND" });
    }
    const { id, ...fields } = args;
    const toUpdate: Partial<typeof alarm> = {};
    if (fields.label !== undefined) toUpdate.label = fields.label;
    if (fields.time !== undefined) toUpdate.time = fields.time;
    if (fields.days !== undefined) toUpdate.days = fields.days;
    if (fields.enabled !== undefined) toUpdate.enabled = fields.enabled;
    await ctx.db.patch(id, toUpdate);
  },
});

export const remove = mutation({
  args: { id: v.id("alarms") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const alarm = await ctx.db.get(args.id);
    if (!alarm || alarm.userId !== user._id) {
      throw new ConvexError({ message: "Alarma no encontrada", code: "NOT_FOUND" });
    }
    await ctx.db.delete(args.id);
  },
});
