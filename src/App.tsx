import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles, Upload, FileSpreadsheet, CheckCircle2, Pencil, RefreshCw, X, Plus, Loader2,
  LayoutTemplate, PanelLeft, Columns2, Square, FlaskConical,
  MousePointer2, Zap, Settings, Send, Wand2, LayoutGrid,
  Download, Trash2, Package, Clock, CheckSquare, ArrowLeft,
  Type, Palette, Megaphone, BookOpen, Cpu, Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ProductInput, GeneratedDraft, InputMode, LayoutTemplateType } from './types';
import { generateMockDrafts, CATEGORIES } from './mockData';
import { generateCopyWithDeepSeek } from './api/deepseek';
import { COPYWRITING_STYLES, type CopywritingStyle } from './api/config';

import {
  generateImageWithDashScope,
  buildImagePrompt as buildDashScopePrompt,
  generatePosterCopy,
  IMAGE_SCENES,
  type ImageScene,
  type GenerateImageResponse as DashScopeImageResponse,
} from './api/dashscope';
import {
  saveToMaterialLibrary, getMaterialLibrary, deleteFromMaterialLibrary,
  saveHistory, getHistory, deleteHistory,
  saveAdopted, getAdopted, deleteAdopted, exportToJSON,
  saveChatSession, getChatHistory, deleteChatSession, clearAllChatHistory,
  type MaterialItem, type HistoryRecord, type AdoptedDraft,
  type ChatSession, type ChatMessage,
} from './storage';

const TEST_DATA = {
  name: '自复位金属按钮开关',
  category: '按钮开关',
  brand: '凯昆',
  material: '铜合金',
  size: '12mm',
  color: '红色',
  targetAudience: '工业自动化设备厂商',
  referenceLinks: ['https://share.temu.com/vwvRajHdQ0A'],
  productImages: [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y4ZmFmYyIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IiNmODc3NzciLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjYwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZmRmNCIvPjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIgcng9IjEwIi8+PHJlY3QgeD0iMTgwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjY2Ii8+PC9zdmc+',
  ],
  referenceImages: [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZjdlZCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWEzNDEyIj7lronquIjmoYg8L3RleHQ+PC9zdmc+',
  ],
};

const LAYOUT_TEMPLATES: { id: LayoutTemplateType; name: string; description: string; icon: React.ReactNode }[] = [
  { id: 'classic', name: '经典上下', description: '大图在上，文案在下', icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 'overlay', name: 'Overlay覆盖', description: '文案覆盖在图片底部', icon: <PanelLeft className="w-4 h-4" /> },
  { id: 'split', name: '左右分栏', description: '图左文右，信息密度高', icon: <Columns2 className="w-4 h-4" /> },
  { id: 'minimal', name: '极简卡片', description: '小图+紧凑文案', icon: <Square className="w-4 h-4" /> },
];

const initialFormState: Omit<ProductInput, 'id' | 'productImages' | 'referenceImages' | 'referenceLinks'> = {
  name: '', category: '', brand: '', material: '', size: '', color: '', targetAudience: '',
  saveToLibrary: false, layoutTemplate: 'classic',
};

type PanelView = 'input' | 'history' | 'chat' | 'adopted' | 'materials' | 'settings';

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [form, setForm] = useState(initialFormState);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [drafts, setDrafts] = useState<GeneratedDraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>('input');
  const [editingDraft, setEditingDraft] = useState<GeneratedDraft | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copyStyle, setCopyStyle] = useState<CopywritingStyle>('professional');
  const [useAI, setUseAI] = useState(false);
  const [, setGenerateError] = useState<string | null>(null);
  const [pendingDrafts, setPendingDrafts] = useState<GeneratedDraft[] | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<import('./api/siliconflow').ImageAnalysisResult | null>(null);

  const [dashScopeImages, setDashScopeImages] = useState<DashScopeImageResponse | null>(null);
  const [isGeneratingDashScope, setIsGeneratingDashScope] = useState(false);
  const [selectedScene, setSelectedScene] = useState<ImageScene>('product');
  const [posterCopy, setPosterCopy] = useState<{ title: string; subtitle: string; cta: string } | null>(null);

  const updateForm = useCallback(<K extends keyof typeof initialFormState>(key: K, value: (typeof initialFormState)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const buildProductInfo = (): Record<string, string> => ({
    name: form.name,
    category: form.category,
    brand: form.brand,
    material: form.material,
    size: form.size,
    color: form.color,
    targetAudience: form.targetAudience,
    referenceLinks: String(referenceLinks.filter((l) => l.trim()).length),
    layoutTemplate: form.layoutTemplate,
  });

  const buildChatSession = (drafts: GeneratedDraft[]): ChatSession => {
    const sessionId = `chat-${Date.now()}`;
    const userMessage: ChatMessage = {
      role: 'user',
      content: `请为商品「${form.name}」生成电商文案。类目：${form.category}，品牌：${form.brand || '无'}，材质：${form.material || '无'}，尺寸：${form.size || '无'}，颜色：${form.color || '无'}，适用人群：${form.targetAudience || '无'}。`,
      timestamp: Date.now(),
    };
    const assistantMessages: ChatMessage[] = drafts.map((d) => ({
      role: 'assistant',
      content: d.title,
      draftImage: d.draftImage,
      sellingPoints: d.sellingPoints,
      tags: (d as any).tags,
      timestamp: Date.now() + Math.random() * 1000,
    }));
    return {
      id: sessionId,
      title: form.name || '未命名商品',
      messages: [userMessage, ...assistantMessages],
      createdAt: Date.now(),
      productInfo: {
        name: form.name,
        category: form.category,
        brand: form.brand,
        material: form.material,
        size: form.size,
        color: form.color,
        targetAudience: form.targetAudience,
      },
    };
  };

  const handleGenerate = async () => {
    if (!form.name.trim()) { setShowPanel(true); setPanelView('input'); return; }
    setIsGenerating(true); setGenerateError(null);

    try {
      let newDrafts: GeneratedDraft[];

      if (useAI) {
        // 使用 DeepSeek API 生成 - 先展示文案供确认
        const baseTimestamp = Date.now();
        const aiResults = await Promise.all(
          Array.from({ length: 3 }, async (_, i) => {
            const draftId = `draft-${baseTimestamp}-${i}`;
            try {
              const result = await generateCopyWithDeepSeek({
                productName: form.name,
                category: form.category,
                brand: form.brand,
                material: form.material,
                size: form.size,
                color: form.color,
                targetAudience: form.targetAudience,
                referenceLinks: referenceLinks.filter(l => l.trim()),
                style: copyStyle,
              });

              const imageIndex = productImages.length > 0 ? i % productImages.length : -1;
              return {
                id: draftId,
                originalInputId: 'input-1',
                draftImage: imageIndex >= 0 ? productImages[imageIndex] : `https://placehold.co/400x400/f8fafc/475569?text=${encodeURIComponent(form.name)}`,
                title: result.title,
                sellingPoints: result.sellingPoints,
                tags: result.tags,
                layoutTemplate: form.layoutTemplate,
              } as GeneratedDraft & { tags: string[] };
            } catch (err) {
              // 单个失败时使用 mock，但强制使用预分配的 ID 避免重复
              const [mockDraft] = generateMockDrafts(draftId, 1, productImages, buildProductInfo());
              return { ...mockDraft, id: draftId };
            }
          })
        );
        // AI 生成结果先进入待确认状态
        setPendingDrafts(aiResults);
        setIsGenerating(false);
        return;
      } else {
        // 使用 Mock 数据 - 直接展示
        await new Promise((r) => setTimeout(r, 2500));
        newDrafts = generateMockDrafts('input-1', 3, productImages, buildProductInfo());
      }

      setDrafts(newDrafts);
      finalizeDrafts(newDrafts);
      saveChatSession(buildChatSession(newDrafts));
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败，请稍后重试';
      setGenerateError(message);
      showToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (draftId: string) => {
    setDrafts((prev) => prev.map((d) => d.id === draftId ? { ...d, title: '重新生成中...', sellingPoints: ['正在分析商品特征...'] } : d));

    if (useAI) {
      try {
        const result = await generateCopyWithDeepSeek({
          productName: form.name,
          category: form.category,
          brand: form.brand,
          material: form.material,
          size: form.size,
          color: form.color,
          targetAudience: form.targetAudience,
          referenceLinks: referenceLinks.filter(l => l.trim()),
          style: copyStyle,
        });

        setDrafts((prev) => prev.map((d) => d.id === draftId ? {
          ...d,
          title: result.title,
          sellingPoints: result.sellingPoints,
          tags: result.tags,
        } : d));
        return;
      } catch {
        showToast('重新生成失败，请稍后重试', 'error');
      }
    }

    await new Promise((r) => setTimeout(r, 1500));
    const [newDraft] = generateMockDrafts(draftId, 1, productImages, buildProductInfo());
    setDrafts((prev) => prev.map((d) => (d.id === draftId ? { ...newDraft, id: draftId } : d)));
  };

  // 确认并保存草稿
  const finalizeDrafts = (draftsToSave: GeneratedDraft[]) => {
    // 保存历史
    saveHistory({
      id: `hist-${Date.now()}`, productName: form.name, category: form.category,
      drafts: draftsToSave, createdAt: Date.now(), layoutTemplate: form.layoutTemplate,
    });
    // 保存素材库
    if (form.saveToLibrary) {
      saveToMaterialLibrary({
        id: `mat-${Date.now()}`, name: form.name, category: form.category,
        brand: form.brand, material: form.material, size: form.size, color: form.color,
        targetAudience: form.targetAudience, productImages, referenceImages, referenceLinks,
        createdAt: Date.now(),
      });
      showToast('已保存到素材库');
    }
  };

  // 确认待审核的 AI 文案
  const confirmPendingDrafts = () => {
    if (!pendingDrafts) return;
    setDrafts(pendingDrafts);
    finalizeDrafts(pendingDrafts);
    saveChatSession(buildChatSession(pendingDrafts));
    setPendingDrafts(null);
  };

  // 放弃待审核的 AI 文案
  const discardPendingDrafts = () => {
    setPendingDrafts(null);
    showToast('已放弃生成的文案');
  };

  const handleAccept = (draft: GeneratedDraft) => {
    const adopted: AdoptedDraft = { ...draft, adoptedAt: Date.now(), productName: form.name || draft.title };
    saveAdopted(adopted);
    showToast('已采纳到已选列表');
  };

  const handleEdit = (draft: GeneratedDraft) => {
    setEditingDraft({ ...draft });
  };

  const saveEdit = () => {
    if (!editingDraft) return;
    setDrafts((prev) => prev.map((d) => (d.id === editingDraft.id ? editingDraft : d)));
    setEditingDraft(null);
    showToast('已保存修改');
  };

  const fillTestData = () => {
    setForm((prev) => ({ ...prev, name: TEST_DATA.name, category: TEST_DATA.category,
      brand: TEST_DATA.brand, material: TEST_DATA.material, size: TEST_DATA.size,
      color: TEST_DATA.color, targetAudience: TEST_DATA.targetAudience, saveToLibrary: true,
    }));
    setProductImages(TEST_DATA.productImages);
    setReferenceImages(TEST_DATA.referenceImages);
    setReferenceLinks(TEST_DATA.referenceLinks);
    setInputMode('manual');
    setShowPanel(true); setPanelView('input');
  };

  // AI 图片分析
  const handleImageAnalysis = async () => {
    if (productImages.length === 0) {
      showToast('请先上传商品图片');
      return;
    }
    setIsAnalyzingImage(true);
    try {
      const { analyzeImageForEcommerce, urlToBase64 } = await import('./api/siliconflow');
      const base64 = await urlToBase64(productImages[0]);
      const result = await analyzeImageForEcommerce(base64);
      setImageAnalysisResult(result);
      showToast('图片分析完成');
    } catch (err) {
      const message = err instanceof Error ? err.message : '图片分析失败，请稍后重试';
      showToast(message, 'error');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // 应用图片分析结果到表单
  const applyImageAnalysis = () => {
    if (!imageAnalysisResult) return;
    setForm((prev) => ({
      ...prev,
      name: imageAnalysisResult.productName || prev.name,
      category: imageAnalysisResult.category || prev.category,
      material: imageAnalysisResult.material || prev.material,
      color: imageAnalysisResult.color || prev.color,
      targetAudience: imageAnalysisResult.targetAudience || prev.targetAudience,
    }));
    showToast('已应用到表单');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      if (json.length > 1) {
        const row = json[1];
        setForm((prev) => ({ ...prev,
          name: row[0] || '', category: row[1] || '', brand: row[2] || '',
          material: row[3] || '', size: row[4] || '', color: row[5] || '', targetAudience: row[6] || '',
        }));
        showToast('Excel 导入成功');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };



  // 使用 DashScope 通义万相生成图片
  const handleGenerateWithDashScope = async () => {
    if (!form.name.trim()) {
      showToast('请先填写商品名称');
      return;
    }
    setIsGeneratingDashScope(true);
    setPosterCopy(null);
    try {
      const prompt = buildDashScopePrompt({
        name: form.name,
        category: form.category,
        brand: form.brand,
        material: form.material,
        color: form.color,
        size: form.size,
        targetAudience: form.targetAudience,
        sellingPoints: imageAnalysisResult?.sellingPoints,
        scene: selectedScene,
      });

      const sceneConfig = IMAGE_SCENES.find((s) => s.id === selectedScene);

      const result = await generateImageWithDashScope({
        prompt,
        n: 1,
        size: sceneConfig?.size ?? '1024x1024',
        scene: selectedScene,
      });

      // 如果是海报场景，同时生成文案
      if (selectedScene === 'poster') {
        try {
          const copy = await generatePosterCopy({
            name: form.name,
            sellingPoints: imageAnalysisResult?.sellingPoints || [form.material, form.size].filter(Boolean) as string[],
          });
          setPosterCopy(copy);
        } catch {
          showToast('海报文案生成失败', 'error');
        }
      }

      setDashScopeImages(result);
      showToast('通义万相生成完成');
    } catch (err) {
      const message = err instanceof Error ? err.message : '图片生成失败，请稍后重试';
      showToast(message, 'error');
    } finally {
      setIsGeneratingDashScope(false);
    }
  };

  // 使用 DashScope 生成的图片
  const useDashScopeImage = (imageUrl: string) => {
    setProductImages((prev) => [...prev, imageUrl]);
    setDashScopeImages(null);
    setPosterCopy(null);
    showToast('已添加到商品图片');
  };

  // const selectedTemplate = LAYOUT_TEMPLATES.find((t) => t.id === form.layoutTemplate);

  return (
    <div className="min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] text-white text-xs px-4 py-2.5 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-slate-800'}`}>
          {toast.type === 'error' && <X className="w-3.5 h-3.5" />}
          {toast.message}
        </div>
      )}

      {/* 顶部导航 */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-strong rounded-2xl px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">图文生成器</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Beta</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <button onClick={fillTestData} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
            <FlaskConical className="w-3 h-3" /> 测试数据
          </button>
        </div>
      </header>

      {/* 左侧工具栏 */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="glass rounded-2xl p-2 flex flex-col gap-1">
          <ToolButton icon={<MousePointer2 className="w-4 h-4" />} label="创建" active={panelView === 'input' && showPanel}
            onClick={() => { setPanelView('input'); setShowPanel(true); }} />
          <ToolButton icon={<Clock className="w-4 h-4" />} label="历史" active={panelView === 'history'}
            onClick={() => { setPanelView('history'); setShowPanel(true); }} />
          <ToolButton icon={<MessageSquare className="w-4 h-4" />} label="对话" active={panelView === 'chat'}
            onClick={() => { setPanelView('chat'); setShowPanel(true); }} />
          <ToolButton icon={<CheckSquare className="w-4 h-4" />} label="已选" active={panelView === 'adopted'}
            onClick={() => { setPanelView('adopted'); setShowPanel(true); }} />
          <ToolButton icon={<Package className="w-4 h-4" />} label="素材" active={panelView === 'materials'}
            onClick={() => { setPanelView('materials'); setShowPanel(true); }} />
          <div className="w-6 h-px bg-slate-200 mx-auto my-1" />
          <ToolButton icon={<Settings className="w-4 h-4" />} label="设置" active={panelView === 'settings'}
            onClick={() => { setPanelView('settings'); setShowPanel(true); }} />
        </div>
      </aside>

      {/* 中央画布 */}
      <main className="min-h-screen flex items-center justify-center p-8 pt-24 pb-32">
        <div className="w-full max-w-5xl">
          {drafts.length === 0 && !isGenerating && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-slate-800">开始创建图文草稿</h1>
                <p className="text-slate-400">输入商品信息，AI 将为你生成可直接上架的图文内容</p>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <QuickStartCard icon={<Zap className="w-5 h-5 text-amber-500" />} title="单品录入" desc="手动输入商品信息"
                  onClick={() => { setPanelView('input'); setShowPanel(true); }} />
                <QuickStartCard icon={<FileSpreadsheet className="w-5 h-5 text-emerald-500" />} title="批量导入" desc="上传 Excel 文件"
                  onClick={() => { setInputMode('batch'); setPanelView('input'); setShowPanel(true); }} />
                <QuickStartCard icon={<Wand2 className="w-5 h-5 text-purple-500" />} title="测试体验" desc="填充示例数据"
                  onClick={fillTestData} />
              </div>
            </div>
          )}

          {isGenerating && <GeneratingVisual />}

          {/* AI 文案待确认面板 */}
          {pendingDrafts && !isGenerating && (
            <div className="space-y-6">
              <div className="glass-strong rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">AI 生成文案 - 请确认</h2>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">待确认</span>
                </div>
                <p className="text-xs text-slate-400">以下文案由 DeepSeek AI 生成，请审核内容是否符合要求</p>

                <div className="space-y-3">
                  {pendingDrafts.map((draft, idx) => (
                    <div key={draft.id} className="glass rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">{idx + 1}</span>
                        <h3 className="text-sm font-medium text-slate-800">方案 {idx + 1}</h3>
                      </div>
                      {/* 图片预览 */}
                      <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        <img src={draft.draftImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">标题</label>
                          <p className="text-sm text-slate-800 font-medium mt-0.5">{draft.title}</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">卖点</label>
                          <div className="space-y-1 mt-0.5">
                            {draft.sellingPoints.map((sp, i) => (
                              <p key={i} className="text-xs text-slate-600">• {sp}</p>
                            ))}
                          </div>
                        </div>
                        {(draft as any).tags && (
                          <div className="flex gap-1.5 flex-wrap">
                            {(draft as any).tags.map((tag: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={discardPendingDrafts} className="flex-1 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    放弃重试
                  </button>
                  <button onClick={confirmPendingDrafts} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> 确认使用
                  </button>
                </div>
              </div>
            </div>
          )}

          {drafts.length > 0 && !isGenerating && !pendingDrafts && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">生成结果</h2>
                <span className="text-xs text-slate-400">共 {drafts.length} 个方案</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {drafts.map((draft) => (
                  <DraftCard key={draft.id} draft={draft} onAccept={handleAccept} onRegenerate={handleRegenerate} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部输入栏 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-lg">
          <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="输入商品名称，或点击左侧工具栏开始创建..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 px-3 py-2" />
          <div className="flex items-center gap-1">
            <button onClick={() => { setPanelView('input'); setShowPanel(true); }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-xl transition-colors">
              <Send className="w-4 h-4" /> 生成
            </button>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      {showPanel && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowPanel(false)} />
          <aside className="fixed right-0 top-0 bottom-0 w-[420px] glass-strong z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-6 space-y-6">
              {/* 面板头部 */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  {panelView === 'input' && '商品信息设置'}
                  {panelView === 'history' && '历史记录'}
                  {panelView === 'chat' && '对话历史'}
                  {panelView === 'adopted' && '已采纳列表'}
                  {panelView === 'materials' && '素材库'}
                  {panelView === 'settings' && '设置'}
                </h3>
                <button onClick={() => setShowPanel(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ====== 输入面板 ====== */}
              {panelView === 'input' && (
                <div className="relative">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button onClick={() => setInputMode('manual')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${inputMode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                      单品录入
                    </button>
                    <button onClick={() => setInputMode('batch')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${inputMode === 'batch' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                      批量导入
                    </button>
                  </div>

                  {inputMode === 'manual' ? (
                    <>
                      {/* AI 生成开关 */}
                      <section className="glass rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-slate-800">AI 智能生成</span>
                          </div>
                          <button
                            onClick={() => setUseAI(!useAI)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${useAI ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useAI ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        {useAI && (
                          <p className="text-[10px] text-slate-400">开启后将调用 DeepSeek API 生成真实文案，需要配置 API Key</p>
                        )}
                      </section>

                      {/* 文案风格选择 */}
                      {useAI && (
                        <section>
                          <label className="text-xs font-medium text-slate-500 mb-2 block">文案风格</label>
                          <div className="grid grid-cols-2 gap-2">
                            {COPYWRITING_STYLES.map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setCopyStyle(style.id)}
                                className={`p-3 rounded-xl border text-left transition-all ${copyStyle === style.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <StyleIcon styleId={style.id} />
                                  <span className={`text-xs font-medium ${copyStyle === style.id ? 'text-indigo-700' : 'text-slate-700'}`}>{style.name}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">{style.description}</p>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* 排版模板 */}
                      <section>
                        <label className="text-xs font-medium text-slate-500 mb-2 block">排版模板</label>
                        <div className="flex gap-2">
                          {LAYOUT_TEMPLATES.map((t) => (
                            <button key={t.id} onClick={() => updateForm('layoutTemplate', t.id)}
                              className={`flex-1 p-2 rounded-xl border text-center transition-all ${form.layoutTemplate === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}>
                              <div className="flex justify-center mb-1">{t.icon}</div>
                              <span className="text-[10px]">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* 基础信息 */}
                      <section className="space-y-3">
                        <label className="text-xs font-medium text-slate-500 block">基础信息</label>
                        <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="商品名称" className="input-base" />
                        <div className="grid grid-cols-2 gap-3">
                          <select value={form.category} onChange={(e) => updateForm('category', e.target.value)} className="input-base appearance-none bg-white">
                            <option value="">选择类目</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="text" value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} placeholder="品牌" className="input-base" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" value={form.material} onChange={(e) => updateForm('material', e.target.value)} placeholder="材质" className="input-base" />
                          <input type="text" value={form.size} onChange={(e) => updateForm('size', e.target.value)} placeholder="尺寸" className="input-base" />
                          <input type="text" value={form.color} onChange={(e) => updateForm('color', e.target.value)} placeholder="颜色" className="input-base" />
                        </div>
                        <input type="text" value={form.targetAudience} onChange={(e) => updateForm('targetAudience', e.target.value)} placeholder="适用人群" className="input-base" />
                      </section>

                      {/* 图片素材 */}
                      <section>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-slate-500">商品图片</label>
                          {productImages.length > 0 && (
                            <button
                              onClick={handleImageAnalysis}
                              disabled={isAnalyzingImage}
                              className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-700 font-medium px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isAnalyzingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              {isAnalyzingImage ? '分析中...' : 'AI 识别'}
                            </button>
                          )}
                        </div>
                        <UploadZone images={productImages} onImagesChange={setProductImages} />
                        {imageAnalysisResult && (
                          <div className="mt-3 glass rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-xs font-medium text-slate-700">AI 识别结果</span>
                            </div>
                            <div className="space-y-1.5">
                              {imageAnalysisResult.productName && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-12 shrink-0">名称</span>
                                  <span className="text-xs text-slate-700">{imageAnalysisResult.productName}</span>
                                </div>
                              )}
                              {imageAnalysisResult.category && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-12 shrink-0">类目</span>
                                  <span className="text-xs text-slate-700">{imageAnalysisResult.category}</span>
                                </div>
                              )}
                              {imageAnalysisResult.material && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-12 shrink-0">材质</span>
                                  <span className="text-xs text-slate-700">{imageAnalysisResult.material}</span>
                                </div>
                              )}
                              {imageAnalysisResult.color && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-12 shrink-0">颜色</span>
                                  <span className="text-xs text-slate-700">{imageAnalysisResult.color}</span>
                                </div>
                              )}
                              {imageAnalysisResult.sellingPoints.length > 0 && (
                                <div>
                                  <span className="text-[10px] text-slate-400">卖点</span>
                                  <div className="mt-1 space-y-0.5">
                                    {imageAnalysisResult.sellingPoints.slice(0, 3).map((sp, i) => (
                                      <p key={i} className="text-[10px] text-slate-600">• {sp}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {imageAnalysisResult.keywords.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {imageAnalysisResult.keywords.slice(0, 5).map((kw, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded-full">{kw}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={applyImageAnalysis}
                              className="w-full py-1.5 text-[10px] text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                            >
                              应用到表单
                            </button>
                          </div>
                        )}
                      </section>

                      {/* AI 生成商品图 - 通义万相 */}
                      <section className="glass rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-600" />
                          <h4 className="text-sm font-medium text-slate-800">AI 生成商品图</h4>
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">通义万相</span>
                        </div>

                        {/* 场景选择 */}
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400">选择场景</label>
                          <div className="grid grid-cols-2 gap-2">
                            {IMAGE_SCENES.map((scene) => (
                              <button
                                key={scene.id}
                                onClick={() => setSelectedScene(scene.id)}
                                className={`text-left p-2 rounded-lg border transition-all ${
                                  selectedScene === scene.id
                                    ? 'border-orange-300 bg-orange-50'
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                              >
                                <div className="text-[10px] font-medium text-slate-700">{scene.name}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{scene.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleGenerateWithDashScope}
                          disabled={isGeneratingDashScope || !form.name.trim()}
                          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 rounded-xl transition-colors"
                        >
                          {isGeneratingDashScope ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                          {isGeneratingDashScope ? '生成中...' : `生成${IMAGE_SCENES.find((s) => s.id === selectedScene)?.name}`}
                        </button>

                        {/* 海报文案展示 */}
                        {posterCopy && (
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 space-y-1">
                            <p className="text-[10px] text-orange-600 font-medium">海报文案</p>
                            <p className="text-sm font-bold text-slate-800">{posterCopy.title}</p>
                            <p className="text-xs text-slate-600">{posterCopy.subtitle}</p>
                            <span className="inline-block px-2 py-0.5 bg-orange-600 text-white text-[10px] rounded-full">{posterCopy.cta}</span>
                          </div>
                        )}

                        {dashScopeImages && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              {dashScopeImages.data.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img.url}
                                    alt={`生成图片 ${idx + 1}`}
                                    className="w-full aspect-square object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => img.url && useDashScopeImage(img.url)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                                  >
                                    <span className="text-white text-xs font-medium">使用此图</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => { setDashScopeImages(null); setPosterCopy(null); }}
                              className="w-full py-1.5 text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              关闭
                            </button>
                          </div>
                        )}
                      </section>

                      {/* 参考素材 */}
                      <section>
                        <label className="text-xs font-medium text-slate-500 mb-2 block">参考素材</label>
                        <UploadZone images={referenceImages} onImagesChange={setReferenceImages} hint="上传参考图片" />
                        <div className="mt-3 space-y-2">
                          {referenceLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" value={link} onChange={(e) => {
                                const newLinks = [...referenceLinks]; newLinks[idx] = e.target.value; setReferenceLinks(newLinks);
                              }} placeholder="参考链接" className="input-base flex-1 text-xs" />
                              {referenceLinks.length > 1 && (
                                <button onClick={() => setReferenceLinks(referenceLinks.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setReferenceLinks([...referenceLinks, ''])} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            <Plus className="w-3.5 h-3.5" /> 添加链接
                          </button>
                        </div>
                      </section>

                      {/* 保存选项 */}
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={form.saveToLibrary} onChange={(e) => updateForm('saveToLibrary', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600" />
                        <span className="text-xs text-slate-500">保存素材到素材库</span>
                      </label>
                    </>
                  ) : (
                    /* 批量导入 */
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">上传 Excel 文件</p>
                        <p className="text-xs text-slate-400 mb-4">支持 .xlsx / .xls 格式</p>
                      </div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        选择文件
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                      </label>
                      <div className="text-left bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-600 mb-2">Excel 格式要求：</p>
                        <p className="text-[10px] text-slate-400">第1行：名称 | 类目 | 品牌 | 材质 | 尺寸 | 颜色 | 适用人群</p>
                        <p className="text-[10px] text-slate-400">第2行起：每行一个商品数据</p>
                      </div>
                    </div>
                  )}

                  <button onClick={handleGenerate} disabled={isGenerating || (inputMode === 'manual' && !form.name.trim())}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]">
                    {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><Sparkles className="w-4 h-4" /> 一键生成图文草稿</>}
                  </button>

                  {/* 生成中遮罩 */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 rounded-lg">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl animate-ping" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-800">AI 正在生成图文草稿</p>
                        <p className="text-xs text-slate-400 mt-1">预计需要 2-3 秒</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ====== 历史记录面板 ====== */}
              {panelView === 'history' && <HistoryPanel />}

              {/* ====== 对话历史面板 ====== */}
              {panelView === 'chat' && <ChatHistoryPanel onLoadSession={(session) => {
                setForm({
                  ...initialFormState,
                  name: session.productInfo.name,
                  category: session.productInfo.category,
                  brand: session.productInfo.brand,
                  material: session.productInfo.material,
                  size: session.productInfo.size,
                  color: session.productInfo.color,
                  targetAudience: session.productInfo.targetAudience,
                });
                setPanelView('input');
                showToast('已加载对话中的商品信息');
              }} />}

              {/* ====== 已采纳面板 ====== */}
              {panelView === 'adopted' && <AdoptedPanel />}

              {/* ====== 素材库面板 ====== */}
              {panelView === 'materials' && <MaterialsPanel onLoadMaterial={(mat) => {
                setForm({ ...initialFormState, name: mat.name, category: mat.category, brand: mat.brand,
                  material: mat.material, size: mat.size, color: mat.color, targetAudience: mat.targetAudience,
                  saveToLibrary: false, layoutTemplate: 'classic' });
                setProductImages(mat.productImages);
                setReferenceImages(mat.referenceImages);
                setReferenceLinks(mat.referenceLinks);
                setPanelView('input');
                showToast('已加载素材');
              }} />}

              {/* ====== 设置面板 ====== */}
              {panelView === 'settings' && (
                <div className="space-y-4">
                  {/* API Key 配置 */}
                  <APIKeySettings />

                  <div className="glass rounded-xl p-4">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">数据管理</h4>
                    <div className="space-y-2">
                      <button onClick={() => { exportToJSON(getHistory(), 'history.json'); showToast('历史记录已导出'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5" /> 导出历史记录
                      </button>
                      <button onClick={() => { exportToJSON(getAdopted(), 'adopted.json'); showToast('已采纳列表已导出'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5" /> 导出已采纳列表
                      </button>
                      <button onClick={() => { localStorage.clear(); showToast('所有数据已清除'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> 清除所有数据
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* 编辑弹窗 */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">微调草稿</h3>
              <button onClick={() => setEditingDraft(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">标题</label>
                <input type="text" value={editingDraft.title} onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })} className="input-base" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">卖点 1</label>
                <textarea value={editingDraft.sellingPoints[0] || ''} onChange={(e) => {
                  const sp = [...editingDraft.sellingPoints]; sp[0] = e.target.value; setEditingDraft({ ...editingDraft, sellingPoints: sp });
                }} rows={2} className="input-base resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">卖点 2</label>
                <textarea value={editingDraft.sellingPoints[1] || ''} onChange={(e) => {
                  const sp = [...editingDraft.sellingPoints]; sp[1] = e.target.value; setEditingDraft({ ...editingDraft, sellingPoints: sp });
                }} rows={2} className="input-base resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingDraft(null)} className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">取消</button>
              <button onClick={saveEdit} className="flex-1 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== 子组件 ========== */

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
      {icon}<span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function QuickStartCard({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass p-5 rounded-2xl text-left hover:shadow-md hover:scale-[1.02] transition-all group">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-400">{desc}</p>
    </button>
  );
}

function UploadZone({ images, onImagesChange, hint = "点击或拖拽上传" }: { images: string[]; onImagesChange: (imgs: string[]) => void; hint?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => { const dataUrl = e.target?.result as string; if (dataUrl) onImagesChange([...images, dataUrl]); };
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      <div onClick={() => fileInputRef.current?.click()} className="border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative w-14 h-14 bg-slate-100 rounded-lg overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={(e) => { e.stopPropagation(); onImagesChange(images.filter((_, idx) => idx !== i)); }}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DraftCard({ draft, onAccept, onRegenerate, onEdit }: { draft: GeneratedDraft & { tags?: string[] }; onAccept: (d: GeneratedDraft) => void; onRegenerate: (id: string) => void; onEdit: (d: GeneratedDraft) => void }) {
  const layout = draft.layoutTemplate || 'classic';
  const cardBase = "glass rounded-2xl overflow-hidden hover:shadow-lg transition-all group";

  const ActionBar = () => (
    <div className="px-3 py-2 flex gap-2">
      <ActionBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="采纳" onClick={() => onAccept(draft)} variant="success" />
      <ActionBtn icon={<Pencil className="w-3.5 h-3.5" />} label="微调" onClick={() => onEdit(draft)} />
      <ActionBtn icon={<RefreshCw className="w-3.5 h-3.5" />} label="重生成" onClick={() => onRegenerate(draft.id)} />
    </div>
  );

  if (layout === 'overlay') {
    return (
      <div className={cardBase}>
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          <img src={draft.draftImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            {(draft as any).tags && <div className="flex gap-1.5 mb-2 flex-wrap">{(draft as any).tags.slice(0, 2).map((tag: string, i: number) => <span key={i} className="px-2 py-0.5 bg-indigo-500/90 text-white text-[10px] font-medium rounded">{tag}</span>)}</div>}
            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">{draft.title}</h4>
          </div>
        </div>
        <ActionBar />
      </div>
    );
  }
  if (layout === 'split') {
    return (
      <div className={cardBase}>
        <div className="flex">
          <div className="w-2/5 aspect-square bg-slate-100 overflow-hidden"><img src={draft.draftImage} alt="" className="w-full h-full object-cover" /></div>
          <div className="w-3/5 p-3 flex flex-col justify-center">
            {(draft as any).tags && <div className="flex gap-1 mb-1.5 flex-wrap">{(draft as any).tags.slice(0, 1).map((tag: string, i: number) => <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-medium rounded">{tag}</span>)}</div>}
            <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{draft.title}</h4>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{draft.sellingPoints[0]}</p>
          </div>
        </div>
        <div className="px-3 py-2 flex gap-2 border-t border-slate-100/50"><ActionBar /></div>
      </div>
    );
  }
  if (layout === 'minimal') {
    return (
      <div className={cardBase}>
        <div className="p-3 flex gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0"><img src={draft.draftImage} alt="" className="w-full h-full object-cover" /></div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{draft.title}</h4>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{draft.sellingPoints[0]}</p>
          </div>
        </div>
        <div className="px-3 pb-3 flex gap-2"><ActionBar /></div>
      </div>
    );
  }
  return (
    <div className={cardBase}>
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img src={draft.draftImage} alt="" className="w-full h-full object-cover" />
        {(draft as any).tags && <div className="absolute top-2 left-2 flex gap-1 flex-wrap">{(draft as any).tags.slice(0, 2).map((tag: string, i: number) => <span key={i} className="px-1.5 py-0.5 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-medium rounded">{tag}</span>)}</div>}
      </div>
      <div className="p-3 space-y-2">
        <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{draft.title}</h4>
        <p className="text-[10px] text-slate-500 line-clamp-2">{draft.sellingPoints[0]}</p>
      </div>
      <div className="px-3 pb-3 flex gap-2"><ActionBar /></div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, variant = 'default' }: { icon: React.ReactNode; label: string; onClick: () => void; variant?: 'default' | 'success' }) {
  const base = 'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all active:scale-95';
  const variants = { default: 'border-slate-200 text-slate-600 hover:bg-slate-50', success: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' };
  return <button onClick={onClick} className={`${base} ${variants[variant]}`}>{icon} {label}</button>;
}

/* ========== 面板组件 ========== */

function ChatHistoryPanel({ onLoadSession }: { onLoadSession: (session: ChatSession) => void }) {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => setChatHistory(getChatHistory()), []);

  if (chatHistory.length === 0) return <EmptyState icon={<MessageSquare className="w-8 h-8" />} text="暂无对话记录" />;

  return (
    <div className="space-y-3">
      {chatHistory.map((session) => (
        <div key={session.id} className="glass rounded-xl overflow-hidden">
          {/* 会话头部 */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{session.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{session.messages.length - 1} 条回复 · {new Date(session.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onLoadSession(session)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="加载商品信息"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setExpandedId(expandedId === session.id ? null : session.id); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                  title="展开/收起"
                >
                  {expandedId === session.id ? <X className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { deleteChatSession(session.id); setChatHistory(getChatHistory()); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 展开的对话内容 */}
          {expandedId === session.id && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-3">
              {session.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {msg.draftImage && (
                      <div className="w-full h-24 bg-slate-200 rounded-lg overflow-hidden mb-2">
                        <img src={msg.draftImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="font-medium">{msg.content}</p>
                    {msg.sellingPoints && msg.sellingPoints.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {msg.sellingPoints.map((sp, i) => (
                          <p key={i} className="opacity-80">• {sp}</p>
                        ))}
                      </div>
                    )}
                    {msg.tags && msg.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {msg.tags.map((tag, i) => (
                          <span key={i} className={`px-1.5 py-0.5 text-[10px] rounded ${
                            msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500'
                          }`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 导出和清空 */}
      <div className="flex gap-2">
        <button
          onClick={() => exportToJSON(getChatHistory(), 'chat-history.json')}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> 导出为 JSON
        </button>
        <button
          onClick={() => { clearAllChatHistory(); setChatHistory([]); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> 清空全部
        </button>
      </div>
    </div>
  );
}

function HistoryPanel() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  useEffect(() => setHistory(getHistory()), []);
  if (history.length === 0) return <EmptyState icon={<Clock className="w-8 h-8" />} text="暂无历史记录" />;
  return (
    <div className="space-y-3">
      {history.map((h) => (
        <div key={h.id} className="glass rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">{h.productName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{h.category} · {h.drafts.length} 个方案 · {new Date(h.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => { deleteHistory(h.id); setHistory(getHistory()); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdoptedPanel() {
  const [adopted, setAdopted] = useState<AdoptedDraft[]>([]);
  useEffect(() => setAdopted(getAdopted()), []);
  if (adopted.length === 0) return <EmptyState icon={<CheckSquare className="w-8 h-8" />} text="暂无已采纳的草稿" />;
  return (
    <div className="space-y-3">
      {adopted.map((a) => (
        <div key={a.id} className="glass rounded-xl p-4 flex gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0"><img src={a.draftImage} alt="" className="w-full h-full object-cover" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 line-clamp-1">{a.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{a.productName} · {new Date(a.adoptedAt).toLocaleDateString()}</p>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{a.sellingPoints[0]}</p>
          </div>
          <button onClick={() => { deleteAdopted(a.id); setAdopted(getAdopted()); }} className="p-1.5 text-slate-400 hover:text-red-500 self-start"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={() => { exportToJSON(getAdopted(), 'adopted-drafts.json'); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
        <Download className="w-3.5 h-3.5" /> 导出全部
      </button>
    </div>
  );
}

function MaterialsPanel({ onLoadMaterial }: { onLoadMaterial: (mat: MaterialItem) => void }) {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  useEffect(() => setMaterials(getMaterialLibrary()), []);
  if (materials.length === 0) return <EmptyState icon={<Package className="w-8 h-8" />} text="素材库为空" />;
  return (
    <div className="space-y-3">
      {materials.map((m) => (
        <div key={m.id} className="glass rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{m.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.category} · {m.brand} · {m.material}</p>
              <div className="flex gap-1 mt-2">
                {m.productImages.slice(0, 3).map((img, i) => (
                  <div key={i} className="w-8 h-8 bg-slate-100 rounded overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onLoadMaterial(m)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><ArrowLeft className="w-3.5 h-3.5" /></button>
              <button onClick={() => { deleteFromMaterialLibrary(m.id); setMaterials(getMaterialLibrary()); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">{icon}</div>
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  );
}

function StyleIcon({ styleId }: { styleId: CopywritingStyle }) {
  const icons: Record<CopywritingStyle, React.ReactNode> = {
    professional: <Cpu className="w-3.5 h-3.5" />,
    marketing: <Megaphone className="w-3.5 h-3.5" />,
    concise: <Type className="w-3.5 h-3.5" />,
    storytelling: <BookOpen className="w-3.5 h-3.5" />,
    technical: <Palette className="w-3.5 h-3.5" />,
  };
  return <span className="text-slate-400">{icons[styleId]}</span>;
}

function APIKeySettings() {
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [siliconflowKey, setSiliconflowKey] = useState(() => localStorage.getItem('siliconflow_api_key') || '');
  const [seedreamKey] = useState(() => localStorage.getItem('seedream_api_key') || '');
  const [dashscopeKey, setDashscopeKey] = useState(() => localStorage.getItem('dashscope_api_key') || '');
  const [showKey, setShowKey] = useState<'deepseek' | 'siliconflow' | 'seedream' | 'dashscope' | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = (type: 'deepseek' | 'siliconflow' | 'seedream' | 'dashscope') => {
    const keyMap = { deepseek: deepseekKey, siliconflow: siliconflowKey, seedream: seedreamKey, dashscope: dashscopeKey };
    const storageMap = { deepseek: 'deepseek_api_key', siliconflow: 'siliconflow_api_key', seedream: 'seedream_api_key', dashscope: 'dashscope_api_key' };
    const key = keyMap[type];
    const storageKey = storageMap[type];
    if (key.trim()) {
      localStorage.setItem(storageKey, key.trim());
    } else {
      localStorage.removeItem(storageKey);
    }
    setSaved(type);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* DeepSeek API */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-medium text-slate-800">DeepSeek API（文案生成）</h4>
          {!!deepseekKey.trim() && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">已配置</span>}
        </div>
        <div className="relative">
          <input
            type={showKey === 'deepseek' ? 'text' : 'password'}
            value={deepseekKey}
            onChange={(e) => setDeepseekKey(e.target.value)}
            placeholder="输入 DeepSeek API Key"
            className="input-base pr-16 text-xs"
          />
          <button
            onClick={() => setShowKey(showKey === 'deepseek' ? null : 'deepseek')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            {showKey === 'deepseek' ? '隐藏' : '显示'}
          </button>
        </div>
        <button
          onClick={() => handleSave('deepseek')}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all ${
            saved === 'deepseek' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {saved === 'deepseek' ? <><CheckCircle2 className="w-3.5 h-3.5" /> 已保存</> : '保存 DeepSeek Key'}
        </button>
      </div>

      {/* SiliconFlow API */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-medium text-slate-800">SiliconFlow API（图生文）</h4>
          {!!siliconflowKey.trim() && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">已配置</span>}
        </div>
        <div className="relative">
          <input
            type={showKey === 'siliconflow' ? 'text' : 'password'}
            value={siliconflowKey}
            onChange={(e) => setSiliconflowKey(e.target.value)}
            placeholder="输入 SiliconFlow API Key"
            className="input-base pr-16 text-xs"
          />
          <button
            onClick={() => setShowKey(showKey === 'siliconflow' ? null : 'siliconflow')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            {showKey === 'siliconflow' ? '隐藏' : '显示'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400">用于上传商品图片后自动识别并生成卖点文案</p>
        <button
          onClick={() => handleSave('siliconflow')}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all ${
            saved === 'siliconflow' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {saved === 'siliconflow' ? <><CheckCircle2 className="w-3.5 h-3.5" /> 已保存</> : '保存 SiliconFlow Key'}
        </button>
      </div>

      {/* DashScope API - 通义万相 */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-medium text-slate-800">DashScope API（通义万相生图）</h4>
          {!!dashscopeKey.trim() && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">已配置</span>}
        </div>
        <div className="relative">
          <input
            type={showKey === 'dashscope' ? 'text' : 'password'}
            value={dashscopeKey}
            onChange={(e) => setDashscopeKey(e.target.value)}
            placeholder="输入 DashScope API Key（阿里云）"
            className="input-base pr-16 text-xs"
          />
          <button
            onClick={() => setShowKey(showKey === 'dashscope' ? null : 'dashscope')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            {showKey === 'dashscope' ? '隐藏' : '显示'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400">用于生成电商海报、抖音首图、Banner 等多种场景图片</p>
        <button
          onClick={() => handleSave('dashscope')}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all ${
            saved === 'dashscope' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {saved === 'dashscope' ? <><CheckCircle2 className="w-3.5 h-3.5" /> 已保存</> : '保存 DashScope Key'}
        </button>
      </div>
    </div>
  );
}

function GeneratingVisual() {
  const steps = [
    { label: '分析商品特征', delay: '0s' },
    { label: '匹配文案模板', delay: '0.3s' },
    { label: '生成主图草稿', delay: '0.6s' },
    { label: '优化卖点文案', delay: '0.9s' },
    { label: '排版渲染中', delay: '1.2s' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="glass-strong rounded-2xl p-8 text-center space-y-6 max-w-sm w-full">
        {/* AI 图标动画 */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-ping" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">AI 正在生成图文草稿</p>
          <p className="text-xs text-slate-400 mt-1">预计需要 2-3 秒</p>
        </div>

        {/* 步骤进度条 */}
        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3" style={{ animationDelay: step.delay }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: step.delay }} />
              <span className="text-xs text-slate-500 flex-1 text-left">{step.label}</span>
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDelay: step.delay }} />
            </div>
          ))}
        </div>

        {/* 进度条 */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

export default App;
