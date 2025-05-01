import React from "react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";

interface ReadonlyMarkdownViewProps {
  content: string;
  placeholder?: string;
  className?: string;
}

export const ReadonlyMarkdownView: React.FC<ReadonlyMarkdownViewProps> = ({
  content,
  placeholder = "No content available",
  className
}) => {
  if (!content) {
    return (
      <div className={cn("text-gray-500 italic text-sm", className)}>
        {placeholder}
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-md", className)}>
      <MarkdownRenderer markdown={content} />
    </div>
  );
};