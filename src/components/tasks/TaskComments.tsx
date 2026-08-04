"use client";
import { useRef, useState } from "react";
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

function renderText(text: string, nameMap: Map<string, string>): React.ReactNode[] {
  const parts = text.split(/(@\[[^\]]+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^@\[([^:]+):([^\]]+)\]$/);
    if (match) {
      const [, uid, fallback] = match;
      const name = nameMap.get(uid) ?? fallback;
      const color = getUserColor(uid);
      return (
        <span key={i} style={{ color }} className="font-medium">
          @{name}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface Member {
  userId: string;
  displayName: string;
}

interface CommentInputProps {
  taskId: Id<"tasks">;
  parentCommentId?: Id<"taskComments">;
  members: Member[];
  onDone?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentInput({ taskId, parentCommentId, members, onDone, placeholder, autoFocus }: CommentInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const create = useMutation(api.comments.create);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const atMatch = before.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1].toLowerCase());
      setMentionStart(cursor - atMatch[0].length);
    } else {
      setMentionQuery(null);
    }
  }

  function selectMention(member: Member) {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const before = text.slice(0, mentionStart);
    const after = text.slice(cursor);
    const mention = `@[${member.userId}:${member.displayName}]`;
    const next = before + mention + " " + after;
    setText(next);
    setMentionQuery(null);
    setTimeout(() => {
      const pos = before.length + mention.length + 1;
      textareaRef.current?.setSelectionRange(pos, pos);
      textareaRef.current?.focus();
    }, 0);
  }

  const filteredMembers =
    mentionQuery !== null
      ? members.filter((m) => m.displayName.toLowerCase().includes(mentionQuery!))
      : [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await create({ taskId, text, parentCommentId });
      setText("");
      setMentionQuery(null);
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end relative">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder={placeholder ?? "Adicionar comentário... (@ para mencionar)"}
          autoFocus={autoFocus}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMentionQuery(null);
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e as never);
          }}
          className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none"
        />
        {filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-full bg-surface-raised border border-border rounded-md shadow-lg z-50 overflow-hidden">
            {filteredMembers.map((m) => (
              <button
                key={m.userId}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectMention(m);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface text-left text-sm transition-colors"
              >
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: getUserColor(m.userId) }}
                >
                  {m.displayName[0]?.toUpperCase()}
                </span>
                <span className="text-on-surface">{m.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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

interface CommentDoc {
  _id: Id<"taskComments">;
  userId: Id<"users">;
  text: string;
  createdAt: number;
  parentCommentId?: Id<"taskComments">;
}

interface CommentItemProps {
  comment: CommentDoc;
  taskId: Id<"tasks">;
  myUserId: string | undefined;
  nameMap: Map<string, string>;
  members: Member[];
  replies: CommentDoc[];
  allComments: CommentDoc[];
}

function CommentItem({ comment, taskId, myUserId, nameMap, members, replies, allComments }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const remove = useMutation(api.comments.remove);
  const color = getUserColor(comment.userId as string);
  const name = nameMap.get(comment.userId as string) ?? "Usuário";
  const isOwn = (comment.userId as string) === myUserId;

  return (
    <div className="flex gap-2.5">
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

        <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
          {renderText(comment.text, nameMap)}
        </p>

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
              members={members}
              onDone={() => setReplying(false)}
              placeholder={`Responder ${name}...`}
              autoFocus
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-border space-y-3">
            {replies.map((reply) => {
              const replyReplies = allComments.filter(
                (c) => c.parentCommentId === reply._id
              );
              return (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  taskId={taskId}
                  myUserId={myUserId}
                  nameMap={nameMap}
                  members={members}
                  replies={replyReplies}
                  allComments={allComments}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskComments({ taskId }: { taskId: Id<"tasks"> }) {
  const comments = useQuery(api.comments.listByTask, { taskId });
  const members = useQuery(api.userProfiles.listMembers);
  const myProfile = useQuery(api.userProfiles.getMyProfile);

  const nameMap = new Map<string, string>();
  const memberList: Member[] = [];
  for (const m of members ?? []) {
    nameMap.set(m.userId as string, m.displayName);
    memberList.push({ userId: m.userId as string, displayName: m.displayName });
  }

  const myUserId = myProfile?.userId as string | undefined;
  const allComments = (comments ?? []) as CommentDoc[];
  const topLevel = allComments.filter((c) => !c.parentCommentId);

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
        Comentários{allComments.length > 0 ? ` (${allComments.length})` : ""}
      </p>

      {topLevel.length === 0 && comments !== undefined && (
        <p className="text-sm text-on-surface-variant italic">Nenhum comentário ainda.</p>
      )}

      <div className="space-y-4">
        {topLevel.map((comment) => {
          const replies = allComments.filter((c) => c.parentCommentId === comment._id);
          return (
            <CommentItem
              key={comment._id}
              comment={comment}
              taskId={taskId}
              myUserId={myUserId}
              nameMap={nameMap}
              members={memberList}
              replies={replies}
              allComments={allComments}
            />
          );
        })}
      </div>

      <CommentInput taskId={taskId} members={memberList} />
    </div>
  );
}
