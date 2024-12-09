'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ 
  content, 
  onContentChange 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    }
  });

  return (
    <div className="border rounded p-4">
      <EditorContent editor={editor} />
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bold
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleItalic().run()} 
          className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Italic
        </button>
      </div>
    </div>
  );
};