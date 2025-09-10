import React from "react";
import { DocumentTextIcon, CodeBracketIcon, CloudArrowDownIcon, DocumentIcon } from "@heroicons/react/24/outline";

export const getFileIcon = (name: string = "") => {
  const lowerCaseName = name.toLowerCase();
  const iconClass = "w-6 h-6";
  
  if (lowerCaseName.endsWith(".pdf"))
    return React.createElement(DocumentTextIcon, { className: `${iconClass} text-red-500` });
  
  if (
    [".js", ".ts", ".py", ".java", ".cs", ".html", ".css"].some((ext) =>
      lowerCaseName.endsWith(ext)
    )
  )
    return React.createElement(CodeBracketIcon, { className: `${iconClass} text-emerald-500` });
  
  if ([".zip", ".rar", ".7z"].some((ext) => lowerCaseName.endsWith(ext)))
    return React.createElement(CloudArrowDownIcon, { className: `${iconClass} text-amber-500` });
  
  return React.createElement(DocumentIcon, { className: `${iconClass} text-blue-500` });
};

export const getFileSize = (size?: number) => {
  if (!size) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let fileSize = size;
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }
  return `${fileSize.toFixed(1)} ${units[index]}`;
};
