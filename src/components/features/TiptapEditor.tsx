"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useTranslations } from "next-intl";

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  const t = useTranslations("TiptapEditor");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("placeholder")
      }),
    ],
    content: value || "<p></p>", // Default to <p></p>
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="border p-4 min-h-[150px]">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
