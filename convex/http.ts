import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function validateSecret(request: Request): boolean {
  const secret = process.env.ASCEND_API_SECRET;
  if (!secret) return false;
  return request.headers.get("Authorization") === `Bearer ${secret}`;
}

http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const body = await request.json();
    const id = await ctx.runMutation(internal.internalApi.createTask, {
      userId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      projectId: body.projectId,
      recurrence: body.recurrence,
    });
    return json({ id }, 201);
  }),
});

http.route({
  path: "/api/tasks/today",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const tasks = await ctx.runQuery(internal.internalApi.listToday, { userId });
    return json(tasks);
  }),
});

http.route({
  path: "/api/tasks/all",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const tasks = await ctx.runQuery(internal.internalApi.listAll, { userId });
    return json(tasks);
  }),
});

http.route({
  path: "/api/tasks/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const tasks = await ctx.runQuery(internal.internalApi.searchTasks, { userId, text: q });
    return json(tasks);
  }),
});

http.route({
  path: "/api/tasks/complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const body = await request.json();
    const result = await ctx.runMutation(internal.internalApi.completeTask, {
      userId,
      taskId: body.taskId,
      occurrenceDate: body.occurrenceDate,
    });
    return json(result);
  }),
});

http.route({
  path: "/api/projects",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!validateSecret(request)) return unauthorized();
    const userId = await ctx.runQuery(internal.internalApi.getOwnerId);
    if (!userId) return new Response("No user", { status: 404 });
    const projects = await ctx.runQuery(internal.internalApi.listProjects, { userId });
    return json(projects);
  }),
});

export default http;
