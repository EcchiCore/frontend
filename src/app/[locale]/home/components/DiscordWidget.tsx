import React from 'react';

const DiscordWidget = () => {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="text-xs font-bold p-2.5 px-3 border-b border-border flex items-center gap-2 text-foreground">
        <div className="w-0.5 h-4 bg-[#5865F2] rounded-full" />
        <span>Discord Community</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">online</span>
        </div>
      </div>
      <iframe
        src="https://discord.com/widget?id=1008312874436939857&theme=dark"
        width="100%"
        height="280"
        // @ts-expect-error allowtransparency is non-standard
        allowtransparency="true"
        frameBorder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="w-full bg-[#313338] block"
      />
    </div>
  );
};

export default DiscordWidget;
