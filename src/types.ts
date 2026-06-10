export interface ProductInput {
  id: string;
  name: string;
  category: string;
  brand: string;
  material: string;
  size: string;
  color: string;
  targetAudience: string;
  productImages: string[];
  referenceImages: string[];
  referenceLinks: string[];
  saveToLibrary: boolean;
  layoutTemplate: LayoutTemplateType;
}

export interface GeneratedDraft {
  id: string;
  originalInputId: string;
  draftImage: string;
  title: string;
  sellingPoints: string[];
  layoutTemplate: LayoutTemplateType;
}

export type InputMode = 'manual' | 'batch';

export type LayoutTemplateType =
  | 'classic'      // 经典上下布局：大图在上，文案在下
  | 'overlay'      //  overlay 布局：文案覆盖在图片底部
  | 'split'        // 左右分栏：图左文右
  | 'minimal';     // 极简卡片：小图+紧凑文案

export interface LayoutTemplate {
  id: LayoutTemplateType;
  name: string;
  description: string;
  preview: string; // CSS class 或描述性标识
}
