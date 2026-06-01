import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  // If no text, return empty
  if (!text) return null;

  // Let's first parse the text into blocks of "normal text" vs "code blocks"
  const tokens: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      tokens.push({ type: 'text', content: textBefore });
    }
    
    tokens.push({
      type: 'code',
      language: match[1] || 'plaintext',
      content: match[2].trim()
    });
    
    lastIndex = regex.lastIndex;
  }

  const textAfter = text.substring(lastIndex);
  if (textAfter) {
    tokens.push({ type: 'text', content: textAfter });
  }

  return (
    <div className="space-y-4">
      {tokens.map((token, index) => {
        if (token.type === 'code') {
          return (
            <CodeBlock 
              key={index} 
              code={token.content} 
              language={token.language || 'plaintext'} 
            />
          );
        } else {
          return (
            <TextBlocks key={index} text={token.content} />
          );
        }
      })}
    </div>
  );
}

interface CodeBlockProps {
  key?: React.Key;
  code: string;
  language: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="mt-4 bg-[#1e293b] rounded-xl overflow-hidden border border-slate-700/50 group/code">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <span className="text-xs font-mono text-slate-400 font-semibold">{language.toLowerCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-slate-700/50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-indigo-200 overflow-x-auto custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface TextBlocksProps {
  key?: React.Key;
  text: string;
}

function TextBlocks({ text }: TextBlocksProps) {
  // Split block by double-newline into paragraphs/lists
  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // Check if it's a list (starting with - or * or 1. or number.)
        const lines = trimmedBlock.split('\n');
        const isUnorderedList = lines.every(line => /^\s*[-*+]\s+/.test(line));
        const isOrderedList = lines.every(line => /^\s*\d+[\.\)]\s+/.test(line));

        if (isUnorderedList) {
          return (
            <ul key={blockIdx} className="list-disc pl-5 space-y-1.5 text-slate-700 leading-relaxed md:pl-6">
              {lines.map((line, lineIdx) => {
                const cleanedText = line.replace(/^\s*[-*+]\s+/, '');
                return (
                  <li key={lineIdx}>
                    <InlineFormatter text={cleanedText} />
                  </li>
                );
              })}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={blockIdx} className="list-decimal pl-5 space-y-1.5 text-slate-700 leading-relaxed md:pl-6">
              {lines.map((line, lineIdx) => {
                const cleanedText = line.replace(/^\s*\d+[\.\)]\s+/, '');
                return (
                  <li key={lineIdx}>
                    <InlineFormatter text={cleanedText} />
                  </li>
                );
              })}
            </ol>
          );
        }

        // Just a standard paragraph. Wait, if there are single-newlines in a paragraph, we render them as line breaks.
        return (
          <p key={blockIdx} className="text-slate-700 leading-relaxed break-words last:mb-0">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                <InlineFormatter text={line} />
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function InlineFormatter({ text }: { text: string }) {
  if (!text) return null;

  // Render bold elements (`**bold**`) and inline code (`` `code` ``)
  // Let's build a regex tokenized inline parser
  const parts: React.ReactNode[] = [];
  const inlineRegex = /(\*\*([\s\S]*?)\*\*|`([\s\S]*?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }

    if (match[0].startsWith('**')) {
      // Bold Text
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900">
          {match[2]}
        </strong>
      );
    } else {
      // Inline Code
      parts.push(
        <code 
          key={match.index} 
          className="bg-slate-100 text-indigo-700 font-mono text-sm px-1.5 py-0.5 rounded border border-slate-200/50"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = inlineRegex.lastIndex;
  }

  const textAfter = text.substring(lastIndex);
  if (textAfter) {
    parts.push(textAfter);
  }

  return <>{parts.length > 0 ? parts : text}</>;
}
