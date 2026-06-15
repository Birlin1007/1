// SiliconFlow VLM API 配置
// 前端不再直接调用 SiliconFlow，而是通过 /api/analyze-image 代理
// API Key 只存在于服务端（Vercel 环境变量），前端完全看不到

export const SILICONFLOW_CONFIG = {
  baseURL: '/api/analyze-image',
  model: 'Qwen/Qwen3-VL-8B-Instruct',
  timeout: 60000,
} as const;

export interface ImageAnalysisResult {
  productName: string;
  category: string;
  description: string;
  sellingPoints: string[];
  keywords: string[];
  targetAudience: string;
  material: string;
  color: string;
}

interface VLMMessage {
  role: 'user';
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >;
}

interface VLMRequest {
  model: string;
  messages: VLMMessage[];
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  stream: boolean;
  n: number;
}

interface VLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

/**
 * 将 File 对象转为 base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 去掉 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 将图片 URL 转为 base64（用于已上传的图片预览地址）
 */
export function urlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * 调用 SiliconFlow VLM 分析图片并生成电商文案
 */
export async function analyzeImageForEcommerce(
  imageBase64: string
): Promise<ImageAnalysisResult> {

  const systemPrompt = `你是一位专业的跨境电商商品分析专家，擅长通过商品图片分析产品特征并生成高质量的电商文案。

请仔细分析上传的商品图片，提取以下信息并以 JSON 格式输出：
{
  "productName": "商品名称（简洁有力，适合电商平台）",
  "category": "商品类目（如：电阻、电容、芯片、连接器等）",
  "description": "商品详细描述（50-100字，突出核心功能和用途）",
  "sellingPoints": ["卖点1（30-50字）", "卖点2（30-50字）", "卖点3（30-50字）"],
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "targetAudience": "目标用户群体（如：电子工程师、DIY爱好者、工厂采购等）",
  "material": "材质（如：陶瓷、金属膜、环氧树脂等）",
  "color": "颜色"
}

要求：
1. 所有输出使用中文
2. 卖点文案要突出产品优势和用户利益
3. 关键词要适合电商平台搜索优化
4. 如果图片是电子元器件，请标注具体参数（如阻值、容值、封装等）`;

  const requestBody: VLMRequest = {
    model: SILICONFLOW_CONFIG.model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: systemPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.7,
    frequency_penalty: 0.5,
    stream: false,
    n: 1,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SILICONFLOW_CONFIG.timeout);

  try {
    const response = await fetch(SILICONFLOW_CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data: VLMResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API 返回内容为空');
    }

    return parseVLMResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      throw error;
    }
    throw new Error('未知错误');
  }
}

/**
 * 解析 VLM 返回的 JSON 内容
 */
function parseVLMResponse(content: string): ImageAnalysisResult {
  try {
    const parsed = JSON.parse(content);
    return validateAnalysisResponse(parsed);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateAnalysisResponse(parsed);
      } catch {
        // 提取失败
      }
    }
    return fallbackAnalysisParse(content);
  }
}

function validateAnalysisResponse(parsed: unknown): ImageAnalysisResult {
  const data = parsed as Record<string, unknown>;

  return {
    productName: typeof data.productName === 'string' ? data.productName : '未知商品',
    category: typeof data.category === 'string' ? data.category : '电子元器件',
    description: typeof data.description === 'string' ? data.description : '',
    sellingPoints: Array.isArray(data.sellingPoints)
      ? data.sellingPoints.filter((sp): sp is string => typeof sp === 'string').slice(0, 5)
      : [],
    keywords: Array.isArray(data.keywords)
      ? data.keywords.filter((k): k is string => typeof k === 'string').slice(0, 8)
      : [],
    targetAudience: typeof data.targetAudience === 'string' ? data.targetAudience : '',
    material: typeof data.material === 'string' ? data.material : '',
    color: typeof data.color === 'string' ? data.color : '',
  };
}

function fallbackAnalysisParse(content: string): ImageAnalysisResult {
  const lines = content.split('\n').filter(l => l.trim());

  let productName = '未知商品';
  const nameLine = lines.find(l => l.includes('商品名称') || l.includes('产品名称'));
  if (nameLine) productName = nameLine.replace(/.*[:：]\s*/, '').trim();

  let category = '电子元器件';
  const catLine = lines.find(l => l.includes('类目') || l.includes('类别'));
  if (catLine) category = catLine.replace(/.*[:：]\s*/, '').trim();

  const sellingPoints: string[] = [];
  const spLines = lines.filter(l => l.includes('卖点') || l.startsWith('-') || l.startsWith('•'));
  spLines.forEach(l => {
    const point = l.replace(/^[-•]\s*/, '').replace(/.*[:：]\s*/, '').trim();
    if (point && point.length > 5) sellingPoints.push(point);
  });

  const keywords: string[] = [];
  const kwLine = lines.find(l => l.includes('关键词') || l.includes('标签'));
  if (kwLine) {
    const kwText = kwLine.replace(/.*[:：]\s*/, '').trim();
    keywords.push(...kwText.split(/[,，]/).map(t => t.trim()).filter(Boolean));
  }

  return {
    productName,
    category,
    description: '',
    sellingPoints: sellingPoints.slice(0, 5),
    keywords: keywords.slice(0, 8),
    targetAudience: '',
    material: '',
    color: '',
  };
}
