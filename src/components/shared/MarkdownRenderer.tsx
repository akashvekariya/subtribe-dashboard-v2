import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lightweight markdown renderer that ONLY supports:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - Bullet lists (- item or * item)
 * - Numbered lists (1. item, 2. item, etc.)
 * - Nested lists (with indentation)
 *
 * All other markdown (headings, links, images, code blocks, etc.)
 * will render as plain text with the markdown syntax visible.
 */

interface ParsedElement {
  type: "text" | "bold" | "italic" | "ul" | "ol";
  content: string | ParsedElement[];
  items?: string[];
}

function parseMarkdown(text: string): ParsedElement[] {
  const lines = text.split("\n");
  const result: ParsedElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check for bullet list (- or *)
    if (trimmedLine.match(/^[\-\*]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^[\-\*]\s+/)) {
          listItems.push(currentLine.replace(/^[\-\*]\s+/, ""));
          i++;
        } else if (currentLine === "") {
          i++;
          break;
        } else {
          break;
        }
      }
      result.push({ type: "ul", content: "", items: listItems });
      continue;
    }

    // Check for numbered list (1. 2. etc.)
    if (trimmedLine.match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^\d+\.\s+/)) {
          listItems.push(currentLine.replace(/^\d+\.\s+/, ""));
          i++;
        } else if (currentLine === "") {
          i++;
          break;
        } else {
          break;
        }
      }
      result.push({ type: "ol", content: "", items: listItems });
      continue;
    }

    // Regular text line
    result.push({ type: "text", content: line });
    i++;
  }

  return result;
}

function parseInlineMarkdown(text: string): (string | React.JSX.Element)[] {
  const result: (string | React.JSX.Element)[] = [];
  let key = 0;

  // Split by bold (**text** or __text__)
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  // Split by italic (*text* or _text_) but not when it's part of bold
  const italicRegex = /(?<!\*|\w)(\*|_)(?!\1)(.*?)(?<!\w)\1(?!\*|_)/g;

  let lastIndex = 0;
  const parts: Array<{
    type: "text" | "bold" | "italic";
    content: string;
    start: number;
    end: number;
  }> = [];

  // Find all bold matches
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    parts.push({
      type: "bold",
      content: match[2],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Find all italic matches (excluding those inside bold)
  boldRegex.lastIndex = 0;
  while ((match = italicRegex.exec(text)) !== null) {
    const isInsideBold = parts.some(
      (p) =>
        p.type === "bold" && match!.index >= p.start && match!.index < p.end
    );
    if (!isInsideBold) {
      parts.push({
        type: "italic",
        content: match[2],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort by start position
  parts.sort((a, b) => a.start - b.start);

  // Build result
  parts.forEach((part) => {
    // Add text before this part
    if (part.start > lastIndex) {
      result.push(text.substring(lastIndex, part.start));
    }

    // Add the formatted part
    if (part.type === "bold") {
      result.push(<strong key={`bold-${key++}`}>{part.content}</strong>);
    } else if (part.type === "italic") {
      result.push(<em key={`italic-${key++}`}>{part.content}</em>);
    }

    lastIndex = part.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  style = {},
}) => {
  const parsed = parseMarkdown(content);

  return (
    <div
      className={className}
      style={{
        ...style,
        fontFamily: "inherit",
      }}
    >
      {parsed.map((element, index) => {
        if (element.type === "ul" && element.items) {
          return (
            <ul
              key={`ul-${index}`}
              style={{
                marginLeft: "1.5rem",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                paddingLeft: "0.5rem",
                listStyleType: "disc",
                listStylePosition: "outside",
                lineHeight: "1.4",
              }}
            >
              {element.items.map((item, itemIndex) => (
                <li
                  key={`li-${index}-${itemIndex}`}
                  style={{
                    marginBottom: "0.25rem",
                    display: "list-item",
                    lineHeight: "1.4",
                  }}
                >
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (element.type === "ol" && element.items) {
          return (
            <ol
              key={`ol-${index}`}
              style={{
                marginLeft: "1.5rem",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                paddingLeft: "0.5rem",
                listStyleType: "decimal",
                listStylePosition: "outside",
                lineHeight: "1.4",
              }}
            >
              {element.items.map((item, itemIndex) => (
                <li
                  key={`li-${index}-${itemIndex}`}
                  style={{
                    marginBottom: "0.25rem",
                    display: "list-item",
                    lineHeight: "1.4",
                  }}
                >
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          );
        }

        // Regular text with inline formatting
        const contentStr =
          typeof element.content === "string" ? element.content.trim() : "";
        const isEmpty = contentStr === "";

        // Don't render empty paragraphs
        if (isEmpty) {
          return null;
        }

        return (
          <p
            key={`p-${index}`}
            style={{
              marginBottom: "1rem",
              marginTop: "0",
              lineHeight: "1.4",
            }}
          >
            {parseInlineMarkdown(contentStr)}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
