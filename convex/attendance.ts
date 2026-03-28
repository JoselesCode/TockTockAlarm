import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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

/** Get the most recent attendance record for the current user */
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("attendance")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

/** Paginated history of attendance records */
export const getHistory = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return { page: [], isDone: true, continueCursor: "" };
    return await ctx.db
      .query("attendance")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/** Record a check-in or check-out */
export const record = mutation({
  args: {
    type: v.union(v.literal("checkin"), v.literal("checkout")),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    shiftId: v.optional(v.id("shifts")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const timestamp = new Date().toISOString();
    return await ctx.db.insert("attendance", {
      userId: user._id,
      type: args.type,
      timestamp,
      latitude: args.latitude,
      longitude: args.longitude,
      accuracy: args.accuracy,
      shiftId: args.shiftId,
      note: args.note,
    });
  },
});

/** Delete a specific attendance record */
export const remove = mutation({
  args: { id: v.id("attendance") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== user._id) {
      throw new ConvexError({ message: "Registro no encontrado", code: "NOT_FOUND" });
    }
    await ctx.db.delete(args.id);
  },
});
