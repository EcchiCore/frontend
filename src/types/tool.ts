export interface Tool {
  name: string;
  description: string;
  link: string;
  icon: "Globe" | "Download" | "Smartphone";
  os?: string[];
  pricing?: string | string[];
  author?: string; // ผู้พัฒนา/ผู้สร้าง
  publisher?: string; // ผู้เผยแพร่ (อาจไม่จำเป็น)
  isOfficial?: boolean; // เป็นเครื่องมือในสังกัดเราเพื่อใช้โปรโมต/จัดลำดับก่อน
}