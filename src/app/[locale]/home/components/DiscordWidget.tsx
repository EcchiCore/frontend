import React from 'react';

const DiscordWidget = () => {
    return (
        <div className="border border-border rounded overflow-hidden bg-card">
            <div className="text-xs font-semibold p-2 px-3 border-b border-border flex items-center space-x-2 text-foreground">
                <div className="w-0.5 h-4 bg-[#5865F2]"></div>
                <span>Discord Community</span>
            </div>
            <iframe
                src="https://discord.com/widget?id=1008312874436939857&theme=dark"
                width="100%"
                height="500"
                allowTransparency={true}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="w-full bg-[#313338]"
            ></iframe>
        </div>
    );
};

export default DiscordWidget;
