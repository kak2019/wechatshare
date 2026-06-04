"use client";

import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mb-2 mt-3 text-base font-semibold tracking-tight text-stone-900 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-sm font-semibold text-stone-900 first:mt-0">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="mb-1 mt-2 text-sm font-medium text-stone-800 first:mt-0">{children}</h5>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-sm leading-relaxed text-stone-700 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 text-sm text-stone-700 marker:text-amber-600/80">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm text-stone-700 marker:text-amber-700/70">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-[3px] border-amber-300/90 bg-amber-50/60 py-1 pl-3 pr-1 text-sm italic text-stone-600">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-amber-800 underline decoration-amber-400/60 underline-offset-2 hover:text-amber-900"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
  em: ({ children }) => <em className="text-stone-600">{children}</em>,
  hr: () => <hr className="my-3 border-stone-200/80" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-stone-200/70">
      <table className="min-w-full text-left text-xs text-stone-700">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-stone-100/90 text-stone-800">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold first:rounded-tl-lg last:rounded-tr-lg">{children}</th>
  ),
  td: ({ children }) => <td className="border-t border-stone-100 px-3 py-2">{children}</td>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded-xl bg-stone-900/92 px-3 py-2.5 text-[13px] leading-relaxed text-amber-50/95">
          <code className={className}>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-900">
        {children}
      </code>
    );
  },
};

type BubbleMarkdownProps = {
  content: string;
  variant?: "default" | "evidence" | "host" | "minutes";
  streaming?: boolean;
};

export function BubbleMarkdown({ content, variant = "default", streaming }: BubbleMarkdownProps) {
  const trimmed = content.trim();
  if (!trimmed && streaming) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-stone-400">
        正在输入
        <StreamingCursor />
      </span>
    );
  }
  if (!trimmed) return null;

  return (
    <div
      className={[
        "tuanzi-md break-words",
        variant === "minutes" ? "tuanzi-md--minutes" : "",
        variant === "evidence" ? "tuanzi-md--evidence" : "",
      ].join(" ")}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </Markdown>
      {streaming && (
        <span className="mt-1 inline-flex items-center">
          <StreamingCursor />
        </span>
      )}
    </div>
  );
}

export function StreamingCursor() {
  return (
    <span
      className="ml-0.5 inline-block h-[1.1em] w-0.5 rounded-full bg-amber-500 align-middle"
      aria-hidden
      style={{ animation: "tuanzi-cursor 0.85s ease-in-out infinite" }}
    />
  );
}
