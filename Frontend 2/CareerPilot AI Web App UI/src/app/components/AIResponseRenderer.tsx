/**
 * AIResponseRenderer — renders AI markdown-style responses beautifully.
 * Handles: **bold**, *italic*, # headers, numbered lists, bullet lists,
 * inline text, and ```code blocks``` with a copy button.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Copy, CheckCheck } from "lucide-react";

interface Props {
  text: string;
  animate?: boolean;
}

// ── Code block component ─────────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-gray-700 text-left">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-xs font-mono text-gray-400">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 px-4 py-3 overflow-x-auto text-xs leading-relaxed font-mono">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function parseAndRender(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  // First split on ```code blocks``` so they never get line-parsed
  const segments = text.split(/(```[\s\S]*?```)/g);
  let globalIdx = 0;

  segments.forEach((segment) => {
    const codeMatch = segment.match(/^```(\w*)\n?([\s\S]*)```$/);
    if (codeMatch) {
      nodes.push(
        <CodeBlock key={globalIdx++} lang={codeMatch[1]} code={codeMatch[2]} />
      );
      return;
    }

    // Process normal lines
    const lines = segment.split("\n");
    let listBuffer: string[] = [];
    let numListBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length > 0) {
      nodes.push(
        <ul key={key + "-ul"} className="list-none space-y-1.5 my-2 ml-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
    if (numListBuffer.length > 0) {
      nodes.push(
        <ol key={key + "-ol"} className="list-none space-y-2 my-2 ml-1">
          {numListBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      numListBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(String(globalIdx++));
      nodes.push(<div key={globalIdx++} className="h-2" />);
      return;
    }

    // H1: # or ==
    if (/^#{1}\s/.test(trimmed)) {
      flushList(String(globalIdx++));
      nodes.push(
        <h3 key={globalIdx++} className="text-lg font-bold text-gray-900 mt-4 mb-1 border-b border-gray-100 pb-1">
          {renderInline(trimmed.replace(/^#+\s/, ""))}
        </h3>
      );
      return;
    }

    // H2 / H3
    if (/^#{2,3}\s/.test(trimmed)) {
      flushList(String(globalIdx++));
      nodes.push(
        <h4 key={globalIdx++} className="text-base font-semibold text-gray-800 mt-3 mb-1">
          {renderInline(trimmed.replace(/^#+\s/, ""))}
        </h4>
      );
      return;
    }

    // Numbered list: 1. 2. 3.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList(String(globalIdx) + "-pre");
      numListBuffer.push(numMatch[2]);
      return;
    }

    // Bullet list: - or * or •
    if (/^[-*•]\s+/.test(trimmed)) {
      flushList(String(globalIdx) + "-pre");
      listBuffer.push(trimmed.replace(/^[-*•]\s+/, ""));
      return;
    }

    // Normal paragraph line
    flushList(String(globalIdx++));
    nodes.push(
      <p key={globalIdx++} className="text-sm text-gray-700 leading-relaxed my-0.5">
        {renderInline(trimmed)}
      </p>
    );
  });

    flushList("end-" + globalIdx);
  }); // end segments.forEach

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i} className="italic text-gray-600">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function AIResponseRenderer({ text, animate = true }: Props) {
  const nodes = parseAndRender(text);

  if (!animate) {
    return <div className="space-y-0.5">{nodes}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-0.5"
    >
      {nodes}
    </motion.div>
  );
}
