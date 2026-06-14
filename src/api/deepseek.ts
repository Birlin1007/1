import { DEEPSEEK_CONFIG, COPYWRITING_STYLES, type CopywritingStyle } from './config';

export interface GenerateCopyRequest {
  productName: string;
  category: string;
  brand: string;
  material: string;
  size: string;
  color: string;
  targetAudience: string;
  referenceLinks?: string[];
  style: CopywritingStyle;
}

export interface GenerateCopyResponse {
  title: string;
  sellingPoints: string[];
  tags: string[];
}

interface DeepSeekMessage {
  role: 'system' | 'user';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
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
 * 构建用户提示词
 */
function buildUserPrompt(params: GenerateCopyRequest): string {
  const { productName, category, brand, material, size, color, targetAudience, referenceLinks } = params;

  let prompt = `请为以下Temu电商平台电子元器件产品生成文案：\n\n`;
  prompt += `【商品信息】\n`;
  prompt += `- 商品名称：${productName || '未填写'}\n`;
  prompt += `- 类目：${category || '未填写'}\n`;
  prompt += `- 品牌：${brand || '未填写'}\n`;
  prompt += `- 材质：${material || '未填写'}\n`;
  prompt += `- 尺寸：${size || '未填写'}\n`;
  prompt += `- 颜色：${color || '未填写'}\n`;
  prompt += `- 适用人群：${targetAudience || '未填写'}\n`;

  if (referenceLinks && referenceLinks.length > 0 && referenceLinks.some(l => l.trim())) {
    prompt += `\n【参考链接】\n`;
    referenceLinks.filter(l => l.trim()).forEach((link, i) => {
      prompt += `${i + 1}. ${link}\n`;
    });
    prompt += `\n请分析参考链接中的爆款特征，提炼其卖点策略并融入文案中。\n`;
  }

  prompt += `\n【要求】\n`;
  prompt += `1. 生成1个吸引人的商品标题（适合Temu平台，突出核心卖点）\n`;
  prompt += `2. 生成2条卖点文案（每条30-60字，突出产品优势和用户利益）\n`;
  prompt += `3. 生成2-3个标签词（用于平台搜索优化）\n`;
  prompt += `4. 文案需符合跨境电商平台的规范，避免违禁词\n`;
  prompt += `5. 必须使用中文输出\n`;
  prompt += `\n请严格按照以下JSON格式输出，不要包含其他内容：\n`;
  prompt += `{"title": "商品标题", "sellingPoints": ["卖点1", "卖点2"], "tags": ["标签1", "标签2"]}`;

  return prompt;
}

/**
 * 调用 DeepSeek API 生成文案
 */
export async function generateCopyWithDeepSeek(
  params: GenerateCopyRequest
): Promise<GenerateCopyResponse> {
  const apiKey = DEEPSEEK_CONFIG.apiKey;

  if (!apiKey) {
    throw new Error('未配置 DeepSeek API Key，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY');
  }

  const styleConfig = COPYWRITING_STYLES.find(s => s.id === params.style) || COPYWRITING_STYLES[0];

  const requestBody: DeepSeekRequest = {
    model: DEEPSEEK_CONFIG.model,
    messages: [
      {
        role: 'system',
        content: styleConfig.systemPrompt,
      },
      {
        role: 'user',
        content: buildUserPrompt(params),
      },
    ],
    stream: false,
    temperature: 0.7,
    max_tokens: 800,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_CONFIG.timeout);

  try {
    const response = await fetch(`${DEEPSEEK_CONFIG.baseURL}/chat/completions`, {
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

    const data: DeepSeekResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API 返回内容为空');
    }

    // 解析 JSON 响应
    return parseAIResponse(content);
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
 * 解析 AI 返回的 JSON 内容
 */
function parseAIResponse(content: string): GenerateCopyResponse {
  try {
    // 尝试直接解析
    const parsed = JSON.parse(content);
    return validateResponse(parsed);
  } catch {
    // 尝试从文本中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateResponse(parsed);
      } catch {
        // 提取失败，使用备用解析
      }
    }
    // 备用：从文本中提取信息
    return fallbackParse(content);
  }
}

/**
 * 验证并标准化响应格式
 */
function validateResponse(parsed: unknown): GenerateCopyResponse {
  const data = parsed as Record<string, unknown>;

  return {
    title: typeof data.title === 'string' ? data.title : '优质电子元器件',
    sellingPoints: Array.isArray(data.sellingPoints)
      ? data.sellingPoints.filter((sp): sp is string => typeof sp === 'string').slice(0, 3)
      : ['高品质产品，值得信赖', '专业制造，品质保障'],
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t): t is string => typeof t === 'string').slice(0, 3)
      : ['工业级', '品质保障'],
  };
}

/**
 * 备用解析：当 JSON 解析失败时，从文本中提取信息
 */
function fallbackParse(content: string): GenerateCopyResponse {
  const lines = content.split('\n').filter(l => l.trim());

  // 尝试找到标题（通常包含"标题"或第一个非空行）
  let title = '优质电子元器件';
  const titleLine = lines.find(l => l.includes('标题') || l.includes('title'));
  if (titleLine) {
    title = titleLine.replace(/.*[:：]\s*/, '').trim() || title;
  } else if (lines.length > 0) {
    title = lines[0].trim();
  }

  // 尝试找到卖点
  const sellingPoints: string[] = [];
  const spLines = lines.filter(l => l.includes('卖点') || l.includes('特点') || l.includes('优势'));
  spLines.forEach(l => {
    const point = l.replace(/.*[:：]\s*/, '').trim();
    if (point && point.length > 5) sellingPoints.push(point);
  });

  // 尝试找到标签
  const tags: string[] = [];
  const tagLine = lines.find(l => l.includes('标签') || l.includes('tags'));
  if (tagLine) {
    const tagText = tagLine.replace(/.*[:：]\s*/, '').trim();
    tags.push(...tagText.split(/[,，]/).map(t => t.trim()).filter(Boolean));
  }

  return {
    title,
    sellingPoints: sellingPoints.length > 0 ? sellingPoints.slice(0, 3) : ['高品质产品，值得信赖', '专业制造，品质保障'],
    tags: tags.length > 0 ? tags.slice(0, 3) : ['工业级', '品质保障'],
  };
}
