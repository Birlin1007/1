import type { GeneratedDraft } from './types';
import { MOCK_PRODUCT_TASKS } from './mockData';
import type { ProductTask } from './mockData';

// ========== localStorage 工具 ==========

const STORAGE_KEYS = {
  MATERIAL_LIBRARY: 'ecommerce_material_library',
  HISTORY: 'ecommerce_history',
  ADOPTED: 'ecommerce_adopted',
  CHAT_HISTORY: 'ecommerce_chat_history',
  PRODUCT_TASKS: 'ecommerce_product_tasks',
};

// 素材库
export interface MaterialItem {
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
  createdAt: number;
}

export function saveToMaterialLibrary(item: MaterialItem): void {
  const existing = getMaterialLibrary();
  const filtered = existing.filter((e) => e.name !== item.name);
  filtered.unshift(item);
  localStorage.setItem(STORAGE_KEYS.MATERIAL_LIBRARY, JSON.stringify(filtered.slice(0, 50)));
}

export function getMaterialLibrary(): MaterialItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATERIAL_LIBRARY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteFromMaterialLibrary(id: string): void {
  const existing = getMaterialLibrary();
  localStorage.setItem(
    STORAGE_KEYS.MATERIAL_LIBRARY,
    JSON.stringify(existing.filter((e) => e.id !== id))
  );
}

// 历史记录
export interface HistoryRecord {
  id: string;
  productName: string;
  category: string;
  drafts: GeneratedDraft[];
  createdAt: number;
  layoutTemplate: string;
}

export function saveHistory(record: HistoryRecord): void {
  const existing = getHistory();
  existing.unshift(record);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(existing.slice(0, 30)));
}

export function getHistory(): HistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteHistory(id: string): void {
  const existing = getHistory();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(existing.filter((e) => e.id !== id)));
}

// 已采纳
export interface AdoptedDraft extends GeneratedDraft {
  adoptedAt: number;
  productName: string;
}

export function saveAdopted(draft: AdoptedDraft): void {
  const existing = getAdopted();
  existing.unshift(draft);
  localStorage.setItem(STORAGE_KEYS.ADOPTED, JSON.stringify(existing.slice(0, 100)));
}

export function getAdopted(): AdoptedDraft[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADOPTED);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteAdopted(id: string): void {
  const existing = getAdopted();
  localStorage.setItem(STORAGE_KEYS.ADOPTED, JSON.stringify(existing.filter((e) => e.id !== id)));
}

// 对话历史
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  draftImage?: string;
  sellingPoints?: string[];
  tags?: string[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  productInfo: {
    name: string;
    category: string;
    brand: string;
    material: string;
    size: string;
    color: string;
    targetAudience: string;
  };
}

export function saveChatSession(session: ChatSession): void {
  const existing = getChatHistory();
  const filtered = existing.filter((e) => e.id !== session.id);
  filtered.unshift(session);
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(filtered.slice(0, 50)));
}

export function getChatHistory(): ChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteChatSession(id: string): void {
  const existing = getChatHistory();
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(existing.filter((e) => e.id !== id)));
}

export function clearAllChatHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

// ========== 商品任务（ProductTask）存储 ==========

export function getProductTasks(): ProductTask[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCT_TASKS);
    if (data) {
      return JSON.parse(data);
    }
    // localStorage 为空时，使用 Mock 数据初始化
    localStorage.setItem(STORAGE_KEYS.PRODUCT_TASKS, JSON.stringify(MOCK_PRODUCT_TASKS));
    return MOCK_PRODUCT_TASKS;
  } catch {
    return MOCK_PRODUCT_TASKS;
  }
}

export function addProductTask(task: ProductTask): void {
  const existing = getProductTasks();
  existing.unshift(task);
  localStorage.setItem(STORAGE_KEYS.PRODUCT_TASKS, JSON.stringify(existing));
}

export function deleteProductTask(taskId: string): void {
  const existing = getProductTasks();
  localStorage.setItem(
    STORAGE_KEYS.PRODUCT_TASKS,
    JSON.stringify(existing.filter((e) => e.taskId !== taskId))
  );
}

export function updateProductTask(taskId: string, updates: Partial<ProductTask>): void {
  const existing = getProductTasks();
  localStorage.setItem(
    STORAGE_KEYS.PRODUCT_TASKS,
    JSON.stringify(
      existing.map((e) => (e.taskId === taskId ? { ...e, ...updates } : e))
    )
  );
}

// 导出 JSON
export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
