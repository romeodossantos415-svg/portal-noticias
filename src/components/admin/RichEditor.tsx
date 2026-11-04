"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import {
  Video, Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Image as ImageIcon, Undo, Redo, Minus, Strikethrough, Unlink,
} from "lucide-react";
import { MediaPicker } from "./MediaPicker";

export function RichEditor({ name, initial = "", onChange }: { name: string; initial?: string; onChange?: (html: string) => void }) {
  const [html, setHtml] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      Placeholder.configure({ placeholder: "Escreva o texto da matéria…" }),
    ],
    content: initial,
    editorProps: { attributes: { class: "tiptap prose-article !text-base p-4" } },
    onUpdate({ editor }) {
      const h = editor.getHTML();
      setHtml(h);
      onChange?.(h);
    },
  });

  useEffect(() => {
    if (editor && initial && editor.isEmpty) editor.commands.setContent(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return <div className="border rounded-lg min-h-[420px] bg-white" />;

  const B = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title} className={`p-1.5 rounded hover:bg-slate-200 ${active ? "bg-slate-900 text-white hover:bg-slate-700" : ""}`}>
      {children}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (URL):", prev ?? "https://");
    if (url === null) return;
    if (!url) return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const addYoutube = () => {
    const url = window.prompt("URL do vídeo do YouTube:");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  return (
    <div className="border border-slate-300 rounded-lg bg-white">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-lg">
        <B title="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></B>
        <B title="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></B>
        <B title="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></B>
        <span className="w-px bg-slate-200 mx-1" />
        <B title="Subtítulo (H2)" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></B>
        <B title="Subtítulo menor (H3)" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></B>
        <B title="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></B>
        <B title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></B>
        <B title="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></B>
        <B title="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></B>
        <span className="w-px bg-slate-200 mx-1" />
        <B title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 className="h-4 w-4" /></B>
        {editor.isActive("link") && <B title="Remover link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="h-4 w-4" /></B>}
        <B title="Inserir imagem" onClick={() => setPickerOpen(true)}><ImageIcon className="h-4 w-4" /></B>
        <B title="Inserir vídeo do YouTube" onClick={addYoutube}><Video className="h-4 w-4" /></B>
        <span className="w-px bg-slate-200 mx-1" />
        <B title="Desfazer" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></B>
        <B title="Refazer" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></B>
      </div>
      <EditorContent editor={editor} />
      {pickerOpen && (
        <MediaPicker
          onClose={() => setPickerOpen(false)}
          onSelect={(m) => {
            editor.chain().focus().setImage({ src: m.url, alt: m.alt ?? "", title: m.caption ?? undefined }).run();
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
