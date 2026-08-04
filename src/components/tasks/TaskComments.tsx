"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { getUserColor } from "@/lib/userColor";
import { Trash2 } from "lucide-react";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  const mo = Math.floor(d / 30);
  return `${mo} ${mo > 1 ? "meses" : "mês"} atrás`;
}

interface CommentInputProps {
  taskId: Id<"tasks">;
  parentCommentId?: Id<"taskComments">;
  onDone?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentInput({ taskId, parentCommentId, onDone, placeholder, autoFocus }: CommentInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.comments.create);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await create({ taskId, text, parentCommentId });
      setText("");
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder ?? "Adicionar comentário..."}
        autoFocus={autoFocus}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e as never);
        }}
        className="flex-1 px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none"
      />
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="px-3 py-2 text-sm bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        {loading ? "..." : "Enviar"}
      </button>
    </form>
  );
}

interface CommentItemProps {
  comment: {
    _id: Id<"taskComments">;
    userId: Id<"users">;
    text: string;
    createdAt: number;
  };
  taskId: Id<"tasks">;
  myUserId: string | undefined;
  nameMap: Map<string, string>;
  replies: CommentItemProps["comment"][];
  allComments: CommentItemProps["comment"][];
}

function CommentItem({ comment, taskId, myUserId, nameMap, replies, allComments }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const remove = useMutation(api.comments.remove);
  const color = getUserColor(comment.userId as string);
  const name = nameMap.get(comment.userId as string) ?? "Usuário";
  const isOwn = (comment.userId as string) === myUserId;

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        {/* Avatar dot */}
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
          style={{ backgroundColor: color }}
        >
          {name[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-medium text-on-surface">{name}</span>
            <span className="text-[10px] text-on-surface-variant">{relativeTime(comment.createdAt)}</span>
            {isOwn && (
              <button
                onClick={() => remove({ id: comment._id })}
                className="ml-auto p-0.5 text-on-surface-variant/40 hover:text-error transition-colors"
                aria-label="Excluir comentário"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-on-surface whitespace-pre-wrap break-words">{comment.text}</p>
          <button
            onClick={() => setReplying((r) => !r)}
            className="mt-1 text-[10px] text-on-surface-variant hover:text-primary transition-colors"
          >
            {replying ? "Cancelar" : "Responder"}
          </button>

          {replying && (
            <div className="mt-2">
              <CommentInput
                taskId={taskId}
                parentCommentId={comment._id}
                onDone={() => setReplying(false)}
                placeholder={`Responder ${name}...`}
                autoFocus
              />
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 pl-3 border-l-2 border-border space-y-3">
              {replies.map((reply) => {
                const replyReplies = allComments.filter(
                  (c) => (c as { parentCommentId?: string }).parentCommentId === reply._id
                );
                return (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    taskId={taskId}
                    myUserId={myUserId}
                    nameMap={nameMap}
                    replies={replyReplies}
                    allComments={allComments}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskCommentsProps {
  taskId: Id<"tasks">;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const comments = useQuery(api.comments.listByTask, { taskId });
  const members = useQuery(api.userProfiles.listMembers);
  const myProfile = useQuery(api.userProfiles.getMyProfile);

  const nameMap = new Map<string, string>();
  for (const m of members ?? []) nameMap.set(m.userId as string, m.displayName);

  const myUserId = myProfile?.userId as string | undefined;

  const topLevel = (comments ?? []).filter((c) => !c.parentCommentId);
  const allComments = comments ?? [];

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
        Comentários {comments && comments.length > 0 ? `(${comments.length})` : ""}
      </p>

      {topLevel.length === 0 && comments !== undefined && (
        <p className="text-sm text-on-surface-variant italic">Nenhum comentário ainda.</p>
      )}

      <div className="space-y-4">
        {topLevel.map((comment) => {
          const replies = allComments.filter(
            (c) => (c as { parentCommentId?: string }).parentCommentId === comment._id
          );
          return (
            <CommentItem
              key={comment._id}
              comment={comment}
              taskId={taskId}
              myUserId={myUserId}
              nameMap={nameMap}
              replies={replies}
              allComments={allComments}
            />
          );
        })}
      </div>

      <CommentInput taskId={taskId} />
    </div>
  );
}
