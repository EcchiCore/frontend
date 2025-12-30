// components/mdx/MyComponent.tsx
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 pb-4 border-b-2 border-gradient-to-r border-cyan-400 relative group"
      {...props}
    >
      <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
      <span className="relative">{props.children}</span>
    </h1>
  ),

  h2: (props) => {
    const id = typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : '';
    return (
      <h2
        className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mt-10 mb-6 relative group cursor-pointer"
        id={id}
        {...props}
      >
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-emerald-400 to-cyan-400 group-hover:h-full transition-all duration-300 rounded-full"></span>
        <span className="pl-4">{props.children}</span>
      </h2>
    );
  },

  h3: (props) => {
    const id = typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : '';
    return (
      <h3
        className="text-2xl font-semibold text-violet-300 mt-8 mb-4 relative flex items-center group"
        id={id}
        {...props}
      >
        <span className="w-2 h-2 bg-violet-400 rounded-full mr-3 animate-pulse"></span>
        <span className="group-hover:text-violet-200 transition-colors duration-200">{props.children}</span>
      </h3>
    );
  },

  a: (props) => (
    <a
      className="relative text-cyan-300 hover:text-cyan-100 transition-all duration-300 group inline-block"
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
      <span className="absolute inset-0 bg-cyan-400/10 scale-0 group-hover:scale-100 rounded transition-transform duration-200 blur-sm"></span>
    </a>
  ),

  blockquote: ({ children }) => (
    <div className="relative bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-l-4 border-gradient-to-b border-amber-400 p-6 rounded-r-lg my-6 backdrop-blur-sm shadow-2xl group hover:shadow-amber-400/10 transition-all duration-300">
      <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-20"></div>
      <div className="flex items-start gap-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-amber-400 shrink-0 h-7 w-7 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur animate-pulse"></div>
        </div>
        <div className="text-amber-100 font-medium leading-relaxed flex-1">{children}</div>
      </div>
    </div>
  ),

  pre: ({ children }) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
      <div className="relative bg-[#0a0a0f] border border-slate-700/50 rounded-lg p-6 overflow-x-auto my-8 shadow-2xl backdrop-blur-sm">
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <pre className="mt-6 text-cyan-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {children}
        </pre>
      </div>
    </div>
  ),

  code: (props) => (
    <code
      className="bg-gradient-to-r from-slate-800 to-slate-700 px-2 py-1 rounded-md text-sm font-mono text-pink-300 border border-slate-600/50 shadow-inner relative group"
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
      <span className="absolute inset-0 bg-pink-400/10 opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-200"></span>
    </code>
  ),

  p: (props) => (
    <p className="my-5 leading-loose text-slate-200 text-lg tracking-wide" {...props} />
  ),

  ul: (props) => (
    <ul className="my-6 space-y-3 text-slate-200" {...props} />
  ),

  li: (props) => (
    <li className="flex items-start gap-3 text-slate-200 group">
      <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2.5 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-200"></span>
      <span className="flex-1">{props.children}</span>
    </li>
  ),

  // เพิ่ม components พิเศษ
  table: (props) => (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse bg-slate-900/50 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm" {...props} />
    </div>
  ),

  th: (props) => (
    <th className="bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-300 font-bold px-6 py-4 text-left border-b border-slate-600" {...props} />
  ),

  td: (props) => (
    <td className="px-6 py-4 text-slate-200 border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200" {...props} />
  ),

  hr: (props) => (
    <div className="my-12 relative">
      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" {...props} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
    </div>
  ),

  strong: (props) => (
    <strong className="font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text" {...props} />
  ),

  em: (props) => (
    <em className="italic text-violet-300 font-medium" {...props} />
  ),
}