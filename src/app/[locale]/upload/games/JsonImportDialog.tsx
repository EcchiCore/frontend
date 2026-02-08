'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/store/hooks';
import { updateFormData, GameUploadFormData } from '@/store/features/upload/uploadSlice';
import { toast } from 'sonner';
import { Clipboard, ClipboardPaste } from 'lucide-react';

export function JsonImportDialog() {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const repairMalformedHtml = (html: string): string => {
        if (!html) return html;
        let repaired = html;

        // 1. Decode generic HTML entities using DOMParser
        // This handles &lt;, &gt;, &quot;, &amp;, etc. correctly even if they are mixed.
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(repaired, 'text/html');
            repaired = doc.body.textContent || repaired;
        } catch (e) {
            console.error("DOMParser error", e);
            // Fallback
            repaired = repaired
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
        }

        // 2. Fix the specific double-nested link pattern:
        // Pattern A: <a href="<a href='URL'>...</a>">TEXT</a> (cleanly nested)
        // Pattern B: <a href="<a href='URL'>Title" class="...">Content</a> (broken middle quote)

        // This regex matches:
        // <a ... href=  ---> Start
        // ["']          ---> Open quote of href
        // <a\s+href=["']([^"']+)["']   ---> Inner open tag with URL (Group 1)
        // [^>]*>        ---> End of inner open tag
        // (.*?)         ---> Inner Title/Text (Group 2)
        // ["']          ---> Closing quote of outer href (or intermediate quote)
        // [^>]*>        ---> Rest of outer opening tag
        // (.*?)         ---> Outer content (Group 3)
        // <\/a>         ---> Closing tag (stops at the first one)

        const messyLinkRegex = /<a\s+[^>]*href=["']<a\s+href=["']([^"']+)["'][^>]*>(.*?)["'][^>]*>(.*?)<\/a>/gi;

        repaired = repaired.replace(messyLinkRegex, (match, url, innerTitle, outerContent) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${innerTitle || outerContent || url}</a>`;
        });

        // 3. Simple nested fallback (for the cleanly nested case or variations)
        const nestedLinkRegex = /<a\s+[^>]*href=["']\s*<a\s+href=['"]([^'"]+)['"][^>]*>.*?<\/a>\s*["'][^>]*>(.*?)<\/a>/gi;
        repaired = repaired.replace(nestedLinkRegex, (match, url, text) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });

        return repaired;
    };

    const handleImport = () => {
        try {
            setError(null);
            if (!jsonInput.trim()) {
                setError('Please paste some JSON data.');
                return;
            }

            const parsedData = JSON.parse(jsonInput);

            // Basic validation: Check if 'object'
            if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
                throw new Error('Input must be a valid JSON object.');
            }

            // Sanitization step for body
            if (parsedData.body && typeof parsedData.body === 'string') {
                parsedData.body = repairMalformedHtml(parsedData.body);
            }

            // Dispatch update
            // We cast to any/Partial<GameUploadFormData> to be safe with the dispatch
            dispatch(updateFormData(parsedData as Partial<GameUploadFormData>));

            toast.success('Game data imported successfully!');
            setJsonInput('');
            setOpen(false);
        } catch (e: any) {
            console.error('JSON Import Error:', e);
            setError(e.message || 'Invalid JSON format.');
            toast.error('Failed to import JSON.');
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJsonInput(text);
            setError(null);
            toast.info('Pasted from clipboard');
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            toast.error('Failed to read from clipboard. Please paste manually.');
        }
    };

    const handlePasteSample = () => {
        const sample: Partial<GameUploadFormData> = {
            title: "My Awesome Game",
            creator: "Indie Dev",
            ver: "1.0.0",
            description: "A short description of the game.",
            body: "<p>Detailed HTML content here.</p>",
            engine: "Unity",
            platforms: ["Windows", "Mac"],
            tags: ["Action", "Adventure"],
            categories: ["Indie"],
            downloads: [
                { name: "Mega.nz", url: "https://mega.nz/..." }
            ]
        };
        setJsonInput(JSON.stringify(sample, null, 2));
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <ClipboardPaste className="h-4 w-4" />
                    Paste JSON
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] text-foreground">
                <DialogHeader>
                    <DialogTitle>Import Game Data</DialogTitle>
                    <DialogDescription>
                        Paste the JSON summary generated by your AI tool here.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground border space-y-2">
                        <div>
                            <p className="font-semibold mb-1">💡 For "body" (Full Description):</p>
                            <p>Please use <strong>HTML format</strong>. Supported tags: headers, paragraphs, lists, bold, italic, <strong>images</strong>. Avoid complex styles or inline CSS.</p>
                        </div>
                        <div className="pt-2 border-t border-border mt-2">
                            <p className="font-semibold mb-1">🤖 Using AI? Copy this rule:</p>
                            <div className="flex gap-2 items-center bg-background p-2 rounded border">
                                <code className="flex-1 text-xs whitespace-pre-wrap">
                                    Generate 'body' as valid unescaped HTML. Use &lt;p&gt;, &lt;a&gt;, &lt;img&gt;. Do NOT use entities for tags. Ensure links and images use valid href/src attributes.
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        navigator.clipboard.writeText("Generate the 'body' content as valid, unescaped HTML. Supported tags include <p>, <a>, <b>, <i>, <ul>, <li>, <img>. Do NOT HTML-encode the tags (use <p> NOT &lt;p&gt;). Ensure <a> href and <img> src attributes contain ONLY the valid URL string, without nested tags.");
                                        toast.success("AI Prompt copied!");
                                    }}
                                    title="Copy Prompt"
                                >
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={handlePasteFromClipboard} className="text-xs h-8 gap-1">
                            <Clipboard className="h-3 w-3" />
                            Paste from Clipboard
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Paste JSON here..."
                        className="min-h-[300px] font-mono text-sm"
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            if (error) setError(null);
                        }}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={handlePasteSample} type="button">
                        Load Sample
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} type="button">
                            Cancel
                        </Button>
                        <Button onClick={handleImport} type="button">
                            Import
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
