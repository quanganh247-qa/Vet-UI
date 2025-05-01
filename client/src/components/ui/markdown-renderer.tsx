import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

const renderMarkdown = (markdown: string): string => {
  if (!markdown) return "";

  let html = markdown
    // Convert bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Convert italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Convert bullet lists (match across multiple lines)
    .replace(/^[•●] (.+)$/gm, "<li>$1</li>")
    // Convert numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive list items in ul/ol tags
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul class='pl-6 list-disc space-y-1'>$1</ul>")
    // Add paragraph tags to text blocks
    .replace(/^([^<\n].+)$/gm, "<p>$1</p>")
    // Fix nested paragraph tags
    .replace(/<p><li>/g, "<li>")
    .replace(/<\/li><\/p>/g, "</li>")
    // Remove empty paragraphs
    .replace(/<p><\/p>/g, "");

  return html;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
  className
}) => {
  return (
    <div 
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}; 