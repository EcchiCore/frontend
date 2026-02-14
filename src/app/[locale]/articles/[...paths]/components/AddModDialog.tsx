"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

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

    async function onSubmit(data: ModFormValues) {
        setIsSubmitting(true);
        try {
            let finalDownloadLink = data.downloadLink;

            // Handle File Upload if selected
            if (selectedFile) {
                // strict check for .lpack extension if needed, but worker handles validation too
                if (!selectedFile.name.endsWith('.lpack')) {
                    // We could warn here, but maybe the user wants to try anyway?
                    // The worker is strict about WasmLayerPack so it will likely fail 400.
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
                    // Construct absolute URL (or relative if same domain, but it's cdn.chanomhub.com)
                    finalDownloadLink = `https://cdn.chanomhub.com/mod/download/${result.key}`;
                }
            }

            // Transform comma-separated strings to arrays
            const formattedData = {
                ...data,
                downloadLink: finalDownloadLink, // Use the one from upload if available
                articleId: Number(articleId), // Ensure it is a number
                articleVersion: Number(data.articleVersion), // Ensure it is a number
                categories: data.categories ? data.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
                tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
                // categoryIds: [], // TODO: If user wants categoryIds, we need a way to look them up. For now sticking to categories names or omit if not required by error.
                // TODO: Handle image upload if implemented (images field)
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mods/article/${slug}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit mod");
            }

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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add a New Mod</DialogTitle>
                    <DialogDescription>
                        Submit a mod for this game. All submissions are subject to review.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Article/Game version ID
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                        Direct link to the mod file or external download page. (Optional if file uploaded)
                                    </FormDescription>
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
                        </div>

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
