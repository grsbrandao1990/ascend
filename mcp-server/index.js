import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.ASCEND_CONVEX_URL?.replace(/\/$/, "");
const SECRET = process.env.ASCEND_API_SECRET;

if (!BASE_URL || !SECRET) {
  process.stderr.write("Variáveis ASCEND_CONVEX_URL e ASCEND_API_SECRET são obrigatórias\n");
  process.exit(1);
}

async function api(path, method = "GET", body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

const server = new Server(
  { name: "ascend", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_projects",
      description: "Lista todos os projetos ativos no Ascend com ID, nome e cor",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_today",
      description: "Lista as tarefas de hoje (pendentes e concluídas), incluindo recorrentes",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_all",
      description: "Lista todas as tarefas pendentes (não concluídas)",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "search_tasks",
      description: "Busca tarefas pelo título",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Texto para buscar no título" },
        },
        required: ["query"],
      },
    },
    {
      name: "create_task",
      description: "Cria uma nova tarefa no Ascend",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da tarefa" },
          description: { type: "string", description: "Descrição opcional" },
          dueDate: { type: "string", description: "Data no formato YYYY-MM-DD (opcional)" },
          projectId: { type: "string", description: "ID do projeto — use list_projects para obter (opcional)" },
        },
        required: ["title"],
      },
    },
    {
      name: "complete_task",
      description: "Marca uma tarefa como concluída e concede XP. Use list_today ou search_tasks para obter o _id",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Campo _id da tarefa" },
        },
        required: ["taskId"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    switch (name) {
      case "list_projects":
        return { content: [{ type: "text", text: JSON.stringify(await api("/api/projects"), null, 2) }] };

      case "list_today":
        return { content: [{ type: "text", text: JSON.stringify(await api("/api/tasks/today"), null, 2) }] };

      case "list_all":
        return { content: [{ type: "text", text: JSON.stringify(await api("/api/tasks/all"), null, 2) }] };

      case "search_tasks":
        return {
          content: [{ type: "text", text: JSON.stringify(await api(`/api/tasks/search?q=${encodeURIComponent(args.query)}`), null, 2) }],
        };

      case "create_task": {
        const result = await api("/api/tasks", "POST", {
          title: args.title,
          description: args.description || undefined,
          dueDate: args.dueDate || undefined,
          projectId: args.projectId || undefined,
        });
        return { content: [{ type: "text", text: `Tarefa criada! ID: ${result.id}` }] };
      }

      case "complete_task": {
        const result = await api("/api/tasks/complete", "POST", { taskId: args.taskId });
        const msg = [
          "Tarefa concluída!",
          result.xpAwarded > 0 ? `+${result.xpAwarded} XP` : null,
          result.leveledUp ? `Subiu para nível ${result.newLevel}!` : null,
        ]
          .filter(Boolean)
          .join(" ");
        return { content: [{ type: "text", text: msg }] };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Erro: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
