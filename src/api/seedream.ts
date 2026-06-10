// 火山引擎 Seedream API 配置
// 支持两种配置方式（优先级从高到低）：
// 1. 在应用设置面板中输入（存储在 localStorage）
// 2. 环境变量 VITE_SEEDREAM_API_KEY

function getApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('seedream_api_key');
    if (localKey) return localKey;
  }
  return import.meta.env.VITE_SEEDREAM_API_KEY || '';
}

export const SEEDREAM_CONFIG = {
  // 开发环境使用 Vite 代理，生产环境使用直接地址
  baseURL: import.meta.env.DEV ? '/api/seedream' : 'https://ark.cn-beijing.volces.com/api/v3',
  // 模型 ID（用户可根据自己的接入点调整）
  model: 'doubao-seedream-4-0-250828',
  get apiKey() { return getApiKey(); },
  timeout: 120000, // 图片生成较慢，设置 2 分钟超时
} as const;

export interface GenerateImageRequest {
  /** 用于生成图像的提示词 */
  prompt: string;
  /** 生成图像数量，默认 1 */
  n?: number;
  /** 图像尺寸 */
  size?: '1024x1024' | '1024x768' | '768x1024' | '1664x936' | '936x1664' | '2048x2048' | '1K' | '2K' | '4K';
  /** 随机种子，-1 表示随机 */
  seed?: number;
  /** 返回格式：url 或 b64_json */
  response_format?: 'url' | 'b64_json';
  /** 是否生成组图（Seedream 4.0 支持） */
  sequential_image_generation?: 'auto' | 'disabled';
  /** 组图最大数量 */
  max_images?: number;
}

export interface GenerateImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

/**
 * 调用 Seedream API 生成图片
 */
export async function generateImageWithSeedream(
  params: GenerateImageRequest
): Promise<GenerateImageResponse> {
  const apiKey = SEEDREAM_CONFIG.apiKey;

  if (!apiKey) {
    throw new Error('未配置 Seedream API Key，请在设置中配置');
  }

  const requestBody: Record<string, unknown> = {
    model: SEEDREAM_CONFIG.model,
    prompt: params.prompt,
    n: params.n ?? 1,
    size: params.size ?? '1024x1024',
    seed: params.seed ?? -1,
    response_format: params.response_format ?? 'url',
  };

  // Seedream 4.0 支持组图
  if (params.sequential_image_generation) {
    requestBody.sequential_image_generation = params.sequential_image_generation;
    if (params.max_images) {
      requestBody.sequential_image_generation_options = { max_images: params.max_images };
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEEDREAM_CONFIG.timeout);

  try {
    const response = await fetch(`${SEEDREAM_CONFIG.baseURL}/images/generations`, {
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

    const data: GenerateImageResponse = await response.json();
    return data;
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
}): string {
  const { name, category, brand, material, color, size, targetAudience, sellingPoints } = productInfo;

  let prompt = `电商产品主图，${name}`;

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

  // 添加电商主图风格要求
  prompt += `。白底或浅色背景，产品居中展示，专业电商摄影风格，高清细节，适合跨境电商平台主图使用`;

  return prompt;
}

/**
 * 将 base64 图片数据转为 Blob URL
 */
export function base64ToBlobUrl(b64_json: string): string {
  const byteCharacters = atob(b64_json);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
