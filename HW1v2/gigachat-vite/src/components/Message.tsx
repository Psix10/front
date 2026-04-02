import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import graphql from 'highlight.js/lib/languages/graphql';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import markdown from 'highlight.js/lib/languages/markdown';

import { Copy, Check, Bot, User } from 'lucide-react';
import { MessageProps } from '../types';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('java', java);
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Компонент для блока кода с подсветкой
function CodeBlock({ className, children }: { className?: string; children: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const language = className?.replace('language-', '') || '';
  const code = String(children).replace(/\n$/, '');

  useEffect(() => {
    if (codeRef.current && language) {
      try {
        const result = hljs.highlight(code, { language, ignoreIllegals: true });
        codeRef.current.innerHTML = result.value;
      } catch {
        // Fallback: без подсветки
        if (codeRef.current) {
          codeRef.current.textContent = code;
        }
      }
    }
  }, [code, language]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="code-block-wrapper">
      {/* Шапка блока кода */}
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button onClick={handleCopyCode} className="code-block-copy-btn">
          {codeCopied ? (
            <><Check size={12} /> Скопировано</>
          ) : (
            <><Copy size={12} /> Копировать</>
          )}
        </button>
      </div>
      <pre className="code-block-pre">
        <code ref={codeRef} className={className}>
          {code}
        </code>
      </pre>
    </div>
  );
}

interface MessageComponentProps extends MessageProps {
  isStreaming?: boolean;
}

export function Message({ message, variant, isStreaming = false }: MessageComponentProps) {
  const [copied, setCopied] = useState(false);
  const isUser = variant === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback silent */ }
  };

  return (
    <div
      className={`message${isUser ? ' message--user' : ''}`}
      data-testid={`message-${message.id}`}
    >
      {/* Avatar */}
      <div
        className={`message__avatar${isUser ? ' message__avatar--user' : ' message__avatar--assistant'}`}
        aria-hidden="true"
      >
        {isUser ? <User size={15} strokeWidth={2} /> : <Bot size={15} strokeWidth={2} />}
      </div>

      {/* Bubble */}
      <div className={`message__body${isUser ? ' message__body--user' : ' message__body--assistant'}`}>
        {/* Sender name */}
        <span className="message__sender">
          {isUser ? 'Вы' : 'AI-ассистент'}
        </span>

        {/* Bubble content */}
        <div className="message__bubble-wrap">
          <div className={`message__bubble${isUser ? ' message__bubble--user' : ' message__bubble--assistant'}${isStreaming ? ' message__bubble--streaming' : ''}`}>
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="inline-code" {...props}>{children}</code>;
                    }
                    return (
                      <CodeBlock className={className}>
                        {String(children)}
                      </CodeBlock>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {/* Blinking cursor during streaming */}
              {isStreaming && (
                <span className="streaming-cursor" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Copy button — hidden while streaming */}
          {!isStreaming && (
            <button
              onClick={handleCopy}
              className={`message__copy-btn${isUser ? ' message__copy-btn--user' : ' message__copy-btn--assistant'}`}
              title="Скопировать"
              data-testid={`btn-copy-${message.id}`}
            >
              {copied ? (
                <>
                  <Check size={11} />
                  <span>Скопировано</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Копировать</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="message__time">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
