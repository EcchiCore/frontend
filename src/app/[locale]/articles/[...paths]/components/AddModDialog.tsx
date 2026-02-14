"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Upload, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { createChanomhubClient, type Revision } from "@chanomhub/sdk";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MOD_TYPES = [
    "TRANSLATION",
    "GAMEPLAY_TWEAK",
    "CHEAT_TRAINER",
    "SAVE",
    "GUIDE",
    "RESOURCE",
    "PATCH",
    "OTHER"
] as const;

// Schema for form validation
const modFormSchema = z.object({
    name: z.string().min(2, {
        message: "Mod name must be at least 2 characters.",
    }),
    version: z.string().min(1, {
        message: "Version is required.",
    }),
    articleVersion: z.coerce.number().min(0, {
        message: "Article version must be a positive number.",
    }),
    type: z.enum(MOD_TYPES, {
        required_error: "Please select a mod type.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    downloadLink: z.string().url({
        message: "Please enter a valid URL.",
    }).optional().or(z.literal('')),
    creditTo: z.string().optional(),
    categories: z.string().optional(), // Comma separated for now
    tags: z.string().optional(), // Comma separated for now
    images: z.any().optional(), // File list or similar
});

type ModFormValues = z.infer<typeof modFormSchema>;

interface AddModDialogProps {
    slug: string; // Article slug to attach mod to
    articleId: number;
    onSuccess?: () => void;
}

export function AddModDialog({ slug, articleId, onSuccess }: AddModDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
    const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");

    const form = useForm<ModFormValues>({
        resolver: zodResolver(modFormSchema),
        defaultValues: {
            name: "",
            version: "",
            articleVersion: 0,
            type: "OTHER",
            description: "",
            downloadLink: "",
            creditTo: "",
            categories: "",
            tags: "",
        },
    });

    const token = Cookies.get("token");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Fetch revisions when dialog opens
    useEffect(() => {
        if (open && slug) {
            const fetchRevisions = async () => {
                setIsLoadingRevisions(true);
                try {
                    const sdk = createChanomhubClient({
                        apiUrl: process.env.NEXT_PUBLIC_API_URL,
                    });
                    const result = await sdk.articles.getRevisions(slug);
                    setRevisions(result.items);

                    // Set default to latest version if available
                    if (result.items.length > 0) {
                        const latest = result.items[0];
                        // Check if field value is not set or 0
                        const currentVal = form.getValues("articleVersion");
                        if (!currentVal) {
                            form.setValue("articleVersion", latest.version);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch revisions:", error);
                    toast.error("Failed to load game versions");
                } finally {
                    setIsLoadingRevisions(false);
                }
            };
            fetchRevisions();
        }
    }, [open, slug, form]);

    async function onSubmit(data: ModFormValues) {
        if (activeTab === 'upload' && !selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (activeTab === 'link' && !data.downloadLink) {
            form.setError("downloadLink", { message: "Download link is required" });
            return;
        }

        setIsSubmitting(true);
        try {
            let finalDownloadLink = data.downloadLink;

            // Handle File Upload if selected
            if (activeTab === 'upload' && selectedFile) {
                // strict check for .lpack extension if needed, but worker handles validation too
                if (!selectedFile.name.endsWith('.lpack')) {
                    // We could warn here
                }

                const uploadUrl = "https://mod.chanomhub.workers.dev/upload";
                const response = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/vnd.layerpack",
                    },
                    body: selectedFile
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Failed to upload file to CDN");
                }

                const result = await response.json();
                if (result.key) {
                    // key format: YYYY/MM/DD/seq_name.lpack
                    // download route: GET /download/{key}
                    finalDownloadLink = `https://cdn.chanomhub.com/mod/download/${result.key}`;
                }
            }

            // Transform comma-separated strings to arrays
            const formattedData = {
                ...data,
                downloadLink: finalDownloadLink,
                articleId: Number(articleId), // Ensure it is a number
                articleVersion: Number(data.articleVersion), // Ensure it is a number
                categories: data.categories ? data.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
                tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
            };

            // Create SDK client
            const sdk = createChanomhubClient({
                token,
                apiUrl: process.env.NEXT_PUBLIC_API_URL,
            });

            await sdk.mods.create(slug, formattedData);

            toast.success("Mod submitted successfully!");
            setOpen(false);
            form.reset();
            setSelectedFile(null);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error submitting mod:", error);
            toast.error(error instanceof Error ? error.message : "Failed to submit mod");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Mod
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto text-foreground">
                <DialogHeader>
                    <DialogTitle>Add a New Mod</DialogTitle>
                    <DialogDescription>
                        Submit a mod for this game. All submissions are subject to review.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Section 1: Basic Info */}
                        <div className="space-y-4 border-b pb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mod Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. HD Texture Pack" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="version"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mod Version</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1.0.0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {MOD_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.replace("_", " ")}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="articleVersion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Game Version</FormLabel>
                                            <div className="flex gap-2">
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? String(field.value) : undefined}
                                                    disabled={isLoadingRevisions}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isLoadingRevisions ? "Loading..." : "Select version"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {revisions.map((rev) => (
                                                            <SelectItem key={rev.version} value={String(rev.version)}>
                                                                Version {rev.version}
                                                            </SelectItem>
                                                        ))}
                                                        {revisions.length === 0 && !isLoadingRevisions && (
                                                            <SelectItem value="0">Initial Release (0)</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FormDescription>
                                                Target game version
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section 2: File / Link */}
                        <div className="space-y-4 border-b pb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Mod Files</h3>

                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upload" className="gap-2">
                                        <Upload className="w-4 h-4" /> Upload File
                                    </TabsTrigger>
                                    <TabsTrigger value="link" className="gap-2">
                                        <LinkIcon className="w-4 h-4" /> External Link
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="pt-4">
                                    <FormItem>
                                        <FormLabel>Mod File (.lpack)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept=".lpack"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload a .lpack file. This will auto-generate the download link.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                </TabsContent>
                                <TabsContent value="link" className="pt-4">
                                    <FormField
                                        control={form.control}
                                        name="downloadLink"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Download Link</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Direct link to the mod file or external download page.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Section 3: Metadata */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what this mod does..."
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="creditTo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credits (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Original author name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="categories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categories (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Graphics, Gameplay (comma separated)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="funny, immersive (comma separated)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Link to a preview image for the mod.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Mod
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
