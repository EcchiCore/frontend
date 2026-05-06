'use client';

import { Puck, Config } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";

const config: Config = {
  components: {
    Heading: {
      fields: {
        children: { type: "text" },
      },
      render: ({ children }) => <h2 className="text-2xl font-bold my-4 text-white">{children}</h2>,
    },
    Text: {
      fields: {
        children: { type: "textarea" },
      },
      render: ({ children }) => <p className="my-2 text-[#d0d0d0] leading-relaxed">{children}</p>,
    },
    Image: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
      },
      render: ({ src, alt }) => (
        <div className="my-6">
          <img src={src} alt={alt} className="rounded-lg w-full border border-[#333]" />
          {alt && <p className="text-center text-[12px] text-[#666] mt-2 italic">{alt}</p>}
        </div>
      ),
    },
    Divider: {
      render: () => <hr className="my-8 border-[#333]" />,
    },
    Link: {
      fields: {
        href: { type: "text" },
        text: { type: "text" },
      },
      render: ({ href, text }) => (
        <a href={href} className="text-red-500 hover:text-red-400 underline" target="_blank" rel="noopener noreferrer">
          {text || href}
        </a>
      ),
    },
  },
};

export default function PuckEditor({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  return (
    <div className="puck-container bg-[#141414] rounded-[4px] overflow-hidden">
      <Puck
        config={config}
        data={data || { content: [], root: {} }}
        onPublish={(data) => onChange(data)}
      />
      <style jsx global>{`
        .puck-container .Puck {
          --puck-color-grey-1: #0f0f0f;
          --puck-color-grey-2: #1a1a1a;
          --puck-color-grey-3: #2a2a2a;
          --puck-color-grey-4: #333;
          --puck-color-grey-5: #444;
          --puck-color-grey-6: #666;
          --puck-color-grey-7: #888;
          --puck-color-grey-8: #aaa;
          --puck-color-grey-9: #ccc;
          --puck-color-grey-10: #eee;
          --puck-color-white: #fff;
          --puck-color-black: #000;
          --puck-color-primary: #dc2626;
          --puck-color-primary-hover: #ef4444;
        }
      `}</style>
    </div>
  );
}
