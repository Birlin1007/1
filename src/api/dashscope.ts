// 阿里云 DashScope 通义千问 API 配置
// 支持两种配置方式（优先级从高到低）：
// 1. 在应用设置面板中输入（存储在 localStorage）
// 2. 环境变量 VITE_DASHSCOPE_API_KEY

function getApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('dashscope_api_key');
    if (localKey) return localKey;
  }
  return import.meta.env.VITE_DASHSCOPE_API_KEY || '';
}

export const DASHSCOPE_CONFIG = {
  // 开发环境使用 Vite 代理，生产环境使用直接地址
  // 图片生成使用原生异步接口 /api/v1
  imageBaseURL: import.meta.env.DEV ? '/api/dashscope-img' : 'https://dashscope.aliyuncs.com/api/v1',
  // 对话使用兼容模式 /compatible-mode/v1
  chatBaseURL: import.meta.env.DEV ? '/api/dashscope-chat' : 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // 文生图模型（异步调用）
  imageModel: 'wanx2.1-t2i-plus',
  // 对话模型
  chatModel: 'qwen-plus',
  get apiKey() { return getApiKey(); },
  timeout: 120000,
} as const;

// 电商图片生成场景类型
export type ImageScene =
  | 'product'      // 商品主图
  | 'poster'       // 营销海报
  | 'douyin'       // 抖音电商首图
  | 'detail'       // 详情页长图
  | 'banner'       // 店铺 Banner
  | 'coupon'       // 优惠券/促销图
  | 'live'         // 直播封面
  | 'comparison';  // 对比图

export interface ImageSceneConfig {
  id: ImageScene;
  name: string;
  description: string;
  size: string;
  aspectRatio: string;
  stylePrompt: string;
}

// 各场景的默认配置
export const IMAGE_SCENES: ImageSceneConfig[] = [
  {
    id: 'product',
    name: '商品主图',
    description: '白底/浅色背景，产品居中，适合电商平台',
    size: '1024*1024',
    aspectRatio: '1:1',
    stylePrompt: '电商产品主图，白底或浅色纯色背景，产品居中展示，专业摄影灯光，高清细节，无水印，无文字',
  },
  {
    id: 'poster',
    name: '营销海报',
    description: '促销海报，适合活动推广',
    size: '1024*1536',
    aspectRatio: '2:3',
    stylePrompt: '电商促销海报，渐变背景，产品展示，促销氛围，现代设计，适合社交媒体分享',
  },
  {
    id: 'douyin',
    name: '抖音电商首图',
    description: '竖版首图，适合抖音/快手',
    size: '1080*1920',
    aspectRatio: '9:16',
    stylePrompt: '抖音电商首图，竖版构图，产品突出，吸睛配色，适合短视频平台，有购买欲望的视觉设计',
  },
  {
    id: 'detail',
    name: '详情页长图',
    description: '产品详情展示，多卖点呈现',
    size: '1024*2048',
    aspectRatio: '1:2',
    stylePrompt: '电商详情页设计，产品多角度展示，参数说明区域，卖点图标，简洁现代风格，适合长图浏览',
  },
  {
    id: 'banner',
    name: '店铺 Banner',
    description: '店铺首页横幅广告',
    size: '1920*600',
    aspectRatio: '16:5',
    stylePrompt: '电商店铺Banner，宽幅构图，品牌氛围，产品展示，适合网页顶部横幅，专业商业设计',
  },
  {
    id: 'coupon',
    name: '优惠券/促销图',
    description: '限时优惠、满减活动图',
    size: '1024*1024',
    aspectRatio: '1:1',
    stylePrompt: '电商促销优惠券设计，红色/橙色促销色系，价格标签，限时氛围，适合活动推广',
  },
  {
    id: 'live',
    name: '直播封面',
    description: '直播间封面，吸引点击',
    size: '1280*720',
    aspectRatio: '16:9',
    stylePrompt: '电商直播封面，主播形象或产品展示，醒目标题区域，高点击率设计，适合直播平台',
  },
  {
    id: 'comparison',
    name: '对比图',
    description: '产品前后对比、竞品对比',
    size: '1024*1024',
    aspectRatio: '1:1',
    stylePrompt: '产品对比图，左右分栏，前后对比，参数标注，清晰直观，适合展示产品优势',
  },
];

export interface GenerateImageRequest {
  /** 用于生成图像的提示词 */
  prompt: string;
  /** 生成图像数量，默认 1 */
  n?: number;
  /** 图像尺寸 */
  size?: string;
  /** 场景类型 */
  scene?: ImageScene;
}

export interface GenerateImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

// 异步任务响应
interface AsyncTaskResponse {
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
  };
  request_id: string;
}

// 查询任务结果响应
interface TaskResultResponse {
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    results?: Array<{
      url: string;
    }>;
    message?: string;
  };
  request_id: string;
}

/**
 * 调用 DashScope 通义万相生图 API（异步模式）
 * 流程：1. 创建任务 -> 2. 轮询查询结果
 */
export async function generateImageWithDashScope(
  params: GenerateImageRequest
): Promise<GenerateImageResponse> {
  const apiKey = DASHSCOPE_CONFIG.apiKey;

  if (!apiKey) {
    throw new Error('未配置 DashScope API Key，请在设置中配置');
  }

  // 根据场景添加风格提示词
  const sceneConfig = params.scene ? IMAGE_SCENES.find(s => s.id === params.scene) : undefined;
  const finalPrompt = sceneConfig
    ? `${sceneConfig.stylePrompt}。${params.prompt}`
    : params.prompt;

  // 步骤1：创建异步任务
  const createTaskBody = {
    model: DASHSCOPE_CONFIG.imageModel,
    input: {
      prompt: finalPrompt,
    },
    parameters: {
      n: params.n ?? 1,
      size: params.size ?? '1024*1024',
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DASHSCOPE_CONFIG.timeout);

  try {
    // 创建任务
    const createResponse = await fetch(`${DASHSCOPE_CONFIG.imageBaseURL}/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(createTaskBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `创建任务失败: ${createResponse.status}`);
    }

    const taskData: AsyncTaskResponse = await createResponse.json();
    const taskId = taskData.output.task_id;

    // 步骤2：轮询查询任务结果（最多轮询30次，每次间隔2秒）
    const maxRetries = 30;
    const pollInterval = 2000;

    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const pollResponse = await fetch(`${DASHSCOPE_CONFIG.imageBaseURL}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!pollResponse.ok) {
        continue; // 轮询失败继续下一次
      }

      const resultData: TaskResultResponse = await pollResponse.json();
      const status = resultData.output.task_status;

      if (status === 'SUCCEEDED') {
        const urls = resultData.output.results?.map(r => r.url) || [];
        return {
          created: Date.now(),
          data: urls.map(url => ({ url })),
        };
      }

      if (status === 'FAILED') {
        throw new Error(resultData.output.message || '图片生成失败');
      }

      // PENDING 或 RUNNING 继续轮询
    }

    throw new Error('图片生成超时，请稍后重试');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，图片生成时间较长，请稍后重试');
      }
      throw error;
    }
    throw new Error('未知错误');
  }
}

/**
 * 调用 DashScope 通义千问对话 API（用于文案生成）
 */
export async function chatWithQwen(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = DASHSCOPE_CONFIG.apiKey;

  if (!apiKey) {
    throw new Error('未配置 DashScope API Key，请在设置中配置');
  }

  const requestBody = {
    model: DASHSCOPE_CONFIG.chatModel,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${DASHSCOPE_CONFIG.chatBaseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试');
      }
      throw error;
    }
    throw new Error('未知错误');
  }
}

/**
 * 根据商品信息构建图片生成提示词
 */
export function buildImagePrompt(productInfo: {
  name: string;
  category: string;
  brand?: string;
  material?: string;
  color?: string;
  size?: string;
  targetAudience?: string;
  sellingPoints?: string[];
  scene?: ImageScene;
}): string {
  const { name, category, brand, material, color, size, targetAudience, sellingPoints, scene } = productInfo;

  let prompt = `${name}`;

  if (category) prompt += `，${category}`;
  if (brand) prompt += `，${brand}品牌`;
  if (material) prompt += `，${material}材质`;
  if (color) prompt += `，${color}色`;
  if (size) prompt += `，尺寸${size}`;
  if (targetAudience) prompt += `，适合${targetAudience}`;

  // 添加卖点到提示词
  if (sellingPoints && sellingPoints.length > 0) {
    prompt += `。产品特点：${sellingPoints.join('；')}`;
  }

  // 根据场景添加特定要求
  if (scene === 'douyin') {
    prompt += `。竖版构图，适合短视频平台展示`;
  } else if (scene === 'poster') {
    prompt += `。促销氛围，适合活动推广`;
  } else if (scene === 'banner') {
    prompt += `。宽幅展示，适合店铺首页`;
  } else {
    prompt += `。白底或浅色背景，产品居中展示，专业电商摄影风格，高清细节`;
  }

  return prompt;
}

/**
 * 生成电商海报文案（配合海报图片）
 */
export async function generatePosterCopy(productInfo: {
  name: string;
  sellingPoints: string[];
  promotion?: string;
}): Promise<{ title: string; subtitle: string; cta: string }> {
  const { name, sellingPoints, promotion } = productInfo;

  const systemPrompt = `你是一位电商海报文案专家，擅长撰写简短有力的促销文案。请根据商品信息生成海报文案，输出 JSON 格式：
{"title": "主标题（10字以内）", "subtitle": "副标题（20字以内）", "cta": "行动号召按钮文字（6字以内）"}`;

  const userPrompt = `商品：${name}
卖点：${sellingPoints.join('，')}
${promotion ? `促销信息：${promotion}` : ''}
请生成海报文案。`;

  const content = await chatWithQwen([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { temperature: 0.8 });

  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || name,
      subtitle: parsed.subtitle || sellingPoints[0] || '',
      cta: parsed.cta || '立即购买',
    };
  } catch {
    return {
      title: name,
      subtitle: sellingPoints[0] || '',
      cta: '立即购买',
    };
  }
}
