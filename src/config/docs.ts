
import { Download, Rocket, Settings, HelpCircle, Book, FileText } from "lucide-react";

export const iconMap = {
    download: Download,
    rocket: Rocket,
    settings: Settings,
    help: HelpCircle,
    book: Book,
    file: FileText,
} as const;

export type IconName = keyof typeof iconMap;

export interface DocItem {
    slug: string;
    title: string;
    description: string;
    iconName: IconName;
    badge?: string;
}

export interface ProductConfig {
    name: string;
    description: string;
    icon: string; // Path to icon image or identifier
    color: string;
    docs: DocItem[];
}

export const products: Record<string, ProductConfig> = {
    chanox2: {
        name: "ChanoX2",
        description: "Game library manager และ launcher สำหรับนักเล่นเกม",
        icon: "/chanox2/icon.png",
        color: "cyan",
        docs: [
            {
                slug: "installation",
                title: "การติดตั้ง",
                description: "วิธีติดตั้ง ChanoX2 บน Windows, macOS และ Linux",
                iconName: "download",
                badge: "เริ่มต้นที่นี่",
            },
            {
                slug: "getting-started",
                title: "เริ่มต้นใช้งาน",
                description: "เรียนรู้พื้นฐานและเริ่มใช้งาน ChanoX2",
                iconName: "rocket",
            },
            {
                slug: "configuration",
                title: "การตั้งค่า",
                description: "ปรับแต่งการทำงานให้เหมาะกับคุณ",
                iconName: "settings",
            },
            {
                slug: "troubleshooting",
                title: "แก้ไขปัญหา",
                description: "คำตอบสำหรับปัญหาที่พบบ่อย",
                iconName: "help",
            },
        ],
    },
};

export const contentMeta: Record<string, Record<string, { title: string; description: string }>> = {
    chanox2: {
        installation: {
            title: "การติดตั้ง ChanoX2",
            description: "วิธีติดตั้ง ChanoX2 บน Windows, macOS และ Linux",
        },
        "getting-started": {
            title: "เริ่มต้นใช้งาน ChanoX2",
            description: "เรียนรู้พื้นฐานการใช้งาน ChanoX2",
        },
        configuration: {
            title: "การตั้งค่า ChanoX2",
            description: "ปรับแต่งการทำงานของ ChanoX2",
        },
        troubleshooting: {
            title: "แก้ไขปัญหา ChanoX2",
            description: "คำตอบสำหรับปัญหาที่พบบ่อย",
        },
    },
};
