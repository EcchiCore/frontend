import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, ImageIcon } from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  insertImageIntoEditor: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  editor, 
  insertImageIntoEditor 
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-3 bg-base-100 border-b border-base-300">
      {[
        { action: () => editor.chain().focus().toggleBold().run(), icon: Bold, active: editor.isActive('bold') },
        { action: () => editor.chain().focus().toggleItalic().run(), icon: Italic, active: editor.isActive('italic') },
        { action: () => editor.chain().focus().toggleStrike().run(), icon: Strikethrough, active: editor.isActive('strike') },
        { action: () => editor.chain().focus().toggleBulletList().run(), icon: List, active: editor.isActive('bulletList') },
        { action: () => editor.chain().focus().toggleOrderedList().run(), icon: ListOrdered, active: editor.isActive('orderedList') },
        { action: () => editor.chain().focus().toggleBlockquote().run(), icon: Quote, active: editor.isActive('blockquote') },
        { action: () => editor.chain().focus().toggleCode().run(), icon: Code, active: editor.isActive('code') },
        { action: insertImageIntoEditor, icon: ImageIcon, active: false }
      ].map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.action}
          className={`btn btn-sm btn-square ${btn.active ? 'btn-primary' : 'btn-ghost text-base-content'}`}
          type="button"
        >
          <btn.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default EditorToolbar;