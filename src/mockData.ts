import type { GeneratedDraft } from './types';

// ========== 电子元器件类目文案模板库 ==========

interface TemplateSet {
  titles: string[];
  sellingPoints: string[][];
  tags: string[][];
}

const TEMPLATES: Record<string, TemplateSet> = {
  '按钮开关': {
    titles: [
      '{name} | 工业级品质 万次按压不卡顿',
      '{brand}{name} | 自锁/点动双模式 精准触发',
      '{name} | {material}材质 {size}规格 稳定可靠',
      '高品质{name} | 防水防尘 恶劣环境稳定运行',
      '{name} | 镀金触点工艺 接触电阻低',
    ],
    sellingPoints: [
      ['{material}触点抗氧化，导电性能优异，适合高频次操作', '通过CE/ROHS认证，符合欧盟环保标准，出口品质保障'],
      ['自锁/复位双模式可选，满足不同电路控制需求', '机械寿命≥10万次，电气寿命≥5万次，经久耐用'],
      ['{size}标准尺寸，兼容主流安装孔位，即装即用', '{color}外观，工业设备/家用电器通用适配'],
      ['IP65防水防尘等级，恶劣环境稳定运行', '耐温范围-40℃~+85℃，极端温度不失效'],
      ['镀金触点工艺，接触电阻<50mΩ，信号传输稳定', '轻触力设计，操作手感舒适，响应速度<5ms'],
    ],
    tags: [
      ['工业级', 'ROHS认证'],
      ['10万次寿命', '双模式'],
      ['{size}规格', '{material}材质'],
      ['IP65防水', '耐高低温'],
      ['镀金触点', '<50mΩ'],
    ],
  },
  '微动开关': {
    titles: [
      '{name} | 灵敏响应 超长使用寿命',
      '{brand}{name} | 轻触触发 精密控制',
      '{name} | {size}微型设计 空间节省',
      '高灵敏{name} | 医疗设备/精密仪器首选',
      '{name} | 三脚焊盘设计 稳固不松动',
    ],
    sellingPoints: [
      ['行程短、回弹快，操作力仅60±15gf，灵敏度高', '银合金触点，接触电阻低，电寿命达10万次以上'],
      ['{size}微型封装，PCB占位面积小，高密度布局首选', '通过UL/VDE/CE多国安规认证，出口无忧'],
      ['三脚直插焊盘设计，焊接牢固不脱落', '适用于鼠标、打印机、医疗设备等精密控制场景'],
      ['动作力一致性好，批量误差<±10gf', '耐电流3A 250VAC，家用/工业场景通用'],
      ['环保无卤素材料，符合RoHS2.0标准', '防尘结构可选，粉尘环境依然可靠'],
    ],
    tags: [
      ['灵敏触发', '10万次寿命'],
      ['微型封装', '多国认证'],
      ['三脚焊盘', '精密控制'],
      ['±10gf精度', '3A耐流'],
      ['RoHS2.0', '无卤素'],
    ],
  },
  '船型开关': {
    titles: [
      '{name} | 大电流承载 电源控制首选',
      '{brand}{name} | 翘板设计 手感干脆',
      '{name} | 带灯指示 通电状态一目了然',
      '工业级{name} | 16A大电流 不虚标',
      '{name} | 两档/三档可选 多场景适配',
    ],
    sellingPoints: [
      ['额定电流16A/250V，大功率电器直接控制', '银触点材质，大电流下不烧蚀，长期使用不接触不良'],
      ['翘板机械结构，档位清晰手感干脆', '带LED电源指示灯，通电状态一目了然'],
      ['两档ON-OFF/三档ON-OFF-ON可选', '螺丝端子接线，导线连接牢固不松动'],
      ['{size}面板开孔，安装方便即装即用', 'UL认证，家用电器/工业设备通用'],
      ['阻燃PC外壳，850℃灼热丝测试通过', '接触电阻<30mΩ，大电流不发热'],
    ],
    tags: [
      ['16A大电流', '银触点'],
      ['翘板结构', 'LED指示灯'],
      ['两档/三档', '螺丝端子'],
      ['UL认证', '阻燃PC'],
      ['<30mΩ', '850℃阻燃'],
    ],
  },
  '拨动开关': {
    titles: [
      '{name} | 滑动切换 档位清晰',
      '{brand}{name} | 2/3/4档位可选',
      '{name} | {size}迷你体积 高密度PCB适配',
      '高可靠{name} | 金属滑杆 万次拨动不松',
      '{name} | 贴片/直插双封装',
    ],
    sellingPoints: [
      ['金属滑杆+镀金触点，滑动顺滑档位清晰', '机械寿命≥5000次，频繁切换不松动'],
      ['2档/3档/4档多种规格可选', '{size}迷你体积，高密度PCB布局首选'],
      ['SMT贴片/DIP直插双封装，兼容不同产线', '耐电流300mA/50VDC，信号/电源两用'],
      ['双列焊盘设计，焊接强度高抗震动', '无铅镀层，符合RoHS环保要求'],
      ['操作力适中，拨动手感一致性好', '适用于仪器仪表、通信设备、消费电子'],
    ],
    tags: [
      ['金属滑杆', '镀金触点'],
      ['5000次寿命', '多档位'],
      ['贴片/直插', '双封装'],
      ['300mA耐流', '双列焊盘'],
      ['RoHS', '无铅镀层'],
    ],
  },
  '继电器': {
    titles: [
      '{name} | 电磁隔离 安全可靠',
      '{brand}{name} | 10A大电流切换',
      '{name} | 5V/12V/24V线圈电压可选',
      '工业级{name} | 低功耗线圈 长期运行不发热',
      '{name} | PCB直插安装 替换方便',
    ],
    sellingPoints: [
      ['电磁隔离设计，控制端与负载端完全隔离', '10A/250VAC切换能力，大功率负载直接控制'],
      ['5V/12V/24V多种线圈电压可选', '低功耗线圈设计，长期运行不发热'],
      ['单刀/双刀/转换触点多种规格', 'PCB直插安装，替换方便维护简单'],
      ['触点间耐压1500VAC，绝缘性能优异', '机械寿命10万次，电气寿命5万次'],
      ['UL/CE/CQC多国安规认证', '符合RoHS2.0环保标准'],
    ],
    tags: [
      ['电磁隔离', '10A切换'],
      ['多电压可选', '低功耗'],
      ['单刀/双刀', 'PCB直插'],
      ['1500VAC耐压', '10万次寿命'],
      ['多国认证', 'RoHS2.0'],
    ],
  },
};

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/400x400/e8eaf6/3f51b5?text=Electronic+Component',
  'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Industrial+Grade',
  'https://placehold.co/400x400/e0f7fa/00838f?text=Quality+Assured',
];

function fillTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
}

export function generateMockDrafts(
  inputId: string,
  count: number,
  userImages: string[] = [],
  productInfo?: Record<string, string>
): Array<GeneratedDraft & { tags: string[] }> {
  const data: Record<string, string> = {
    name: productInfo?.name || '工业级按钮开关',
    category: productInfo?.category || '按钮开关',
    brand: productInfo?.brand || '国产优质',
    material: productInfo?.material || '铜合金',
    size: productInfo?.size || '12×12×7.3mm',
    color: productInfo?.color || '黑色',
    targetAudience: productInfo?.targetAudience || '电子工程师',
  };

  const category = data.category || '按钮开关';
  const templates = TEMPLATES[category] || TEMPLATES['按钮开关'];
  const referenceHint = productInfo?.referenceLinks?.length
    ? `参考爆款${productInfo.referenceLinks.length}条链接特征，标题突出核心卖点`
    : '';

  return Array.from({ length: count }, (_, i) => {
    const idx = i % 3;
    const imageIndex = userImages.length > 0 ? i % userImages.length : -1;
    const draftImage = imageIndex >= 0 ? userImages[imageIndex] : PLACEHOLDER_IMAGES[idx];

    const title = fillTemplate(templates.titles[i], data);
    const sellingPoints = templates.sellingPoints[i].map(sp => fillTemplate(sp, data));
    if (referenceHint && i === 0) {
      sellingPoints[1] = referenceHint;
    }
    const tags = templates.tags[i].map(t => fillTemplate(t, data)).filter(Boolean);

    return {
      id: `draft-${Date.now()}-${i}`,
      originalInputId: inputId,
      draftImage: draftImage,
      title: title,
      sellingPoints: sellingPoints,
      tags: tags.length > 0 ? tags : ['工业级', '品质保障'],
      layoutTemplate: productInfo?.layoutTemplate || 'classic',
    } as GeneratedDraft & { tags: string[] };
  });
}

export const CATEGORIES = [
  '按钮开关',
  '微动开关',
  '船型开关',
  '拨动开关',
  '继电器',
  '固态继电器',
  '时间继电器',
  '电磁继电器',
  '电容电阻',
  '连接器',
  '传感器',
  '电源模块',
  '集成电路IC',
  '二极管三极管',
  'PCB电路板',
];

// ========== 抖音风电商素材模拟数据（女装/数码/美妆） ==========

export interface ProductTask {
  taskId: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  platform: 'douyin' | 'temu';
  product: {
    name: string;
    category: string;
    subCategory: string;
    brand: string;
    sku: string;
    attributes: Record<string, string>;
    targetAudience: string;
  };
  inputAssets: {
    productImages: string[];
    referenceImages: string[];
    referenceLinks: string[];
    description: string;
  };
  aiResults: {
    title: { text: string; confidence: number };
    copywriting: {
      headline: string;
      sellingPoints: string[];
      keywords: string[];
      callToAction: string;
    };
    poster: {
      imageUrl: string;
      scene: string;
      prompt: string;
      dimensions: { width: number; height: number };
    };
    variants: Array<{
      variantId: string;
      style: string;
      title: string;
      posterUrl: string;
    }>;
  };
  userActions: {
    adopted: boolean;
    adoptedAt?: string;
    editedFields: string[];
    exportHistory: Array<{ format: string; exportedAt: string; fileName: string }>;
  };
}

export const MOCK_PRODUCT_TASKS: ProductTask[] = [
  {
    taskId: 'task_20250602_001',
    status: 'completed',
    createdAt: '2026-06-02T09:00:00Z',
    updatedAt: '2026-06-02T09:05:00Z',
    platform: 'douyin',
    product: {
      name: '法式复古碎花连衣裙',
      category: '女装',
      subCategory: '连衣裙',
      brand: 'ChicStudio',
      sku: 'CS-DRESS-2026-001',
      attributes: {
        material: '雪纺+棉质内衬',
        size: 'S/M/L/XL',
        color: '杏色碎花',
        specs: '方领、泡泡袖、高腰A字版型',
      },
      targetAudience: '18-28岁女大学生/年轻白领',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/dress001a/300/400',
        'https://picsum.photos/seed/dress001b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refdress001/300/400'],
      referenceLinks: ['https://douyin.com/shop/flower-dress-2026'],
      description: '春夏新款法式碎花裙，温柔气质风',
    },
    aiResults: {
      title: { text: '🔥绝美法式碎花裙✨上身秒变温柔小姐姐 亲测显瘦绝绝子', confidence: 0.94 },
      copywriting: {
        headline: '✨这条裙子真的绝绝子，穿上就是温柔本柔',
        sellingPoints: [
          '🔥方领+泡泡袖设计，露出锁骨巨显瘦，亲测手臂粗也能穿',
          '✨高腰A字版型，腰围瞬间小一圈，梨形身材姐妹闭眼入',
          '💕雪纺面料轻薄透气，内衬棉质亲肤不闷热，夏天穿刚刚好',
          '🌸杏色碎花温柔不挑皮，黄黑皮穿上也超显白',
        ],
        keywords: ['法式碎花裙', '显瘦连衣裙', '温柔风', '春夏新款', '泡泡袖'],
        callToAction: '🔗左下角小黄车get同款，现货48h发',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster001/1024/1536',
        scene: 'douyin_cover',
        prompt: 'A young Asian woman wearing a beige floral French-style dress, standing in a sunlit garden, soft natural lighting, dreamy aesthetic, portrait photography style, vertical composition for TikTok/Douyin cover',
        dimensions: { width: 1080, height: 1920 },
      },
      variants: [
        { variantId: 'v1', style: '温柔风', title: '✨法式碎花裙｜温柔到发光 约会必穿', posterUrl: 'https://picsum.photos/seed/posterv1_001/1024/1536' },
        { variantId: 'v2', style: '种草风', title: '🔥被问爆链接的碎花裙！谁穿谁温柔', posterUrl: 'https://picsum.photos/seed/posterv2_001/1024/1536' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T09:06:00Z',
      editedFields: ['title'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T09:07:00Z', fileName: 'task_20250602_001.json' }],
    },
  },
  {
    taskId: 'task_20250602_002',
    status: 'completed',
    createdAt: '2026-06-02T09:15:00Z',
    updatedAt: '2026-06-02T09:20:00Z',
    platform: 'temu',
    product: {
      name: '无线降噪蓝牙耳机 Pro',
      category: '数码',
      subCategory: '耳机',
      brand: 'SoundMax',
      sku: 'SM-BT-PRO-256',
      attributes: {
        material: 'ABS+硅胶耳帽',
        size: '入耳式',
        color: '象牙白',
        specs: 'ANC主动降噪、42h续航、蓝牙5.3',
      },
      targetAudience: '通勤族/学生党/音乐爱好者',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/earbud002a/300/400',
        'https://picsum.photos/seed/earbud002b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refearbud002/300/400'],
      referenceLinks: ['https://temu.com/goods/noise-cancel-earbuds'],
      description: '高性价比主动降噪耳机，42小时超长续航',
    },
    aiResults: {
      title: { text: '🔥百元降噪天花板✨42h续航亲测好用 地铁上终于清静了', confidence: 0.91 },
      copywriting: {
        headline: '✨亲测好用！这耳机戴上地铁瞬间变图书馆',
        sellingPoints: [
          '🔥ANC主动降噪真的顶，地铁轰鸣声直接消失，听歌终于不用开最大声',
          '✨42小时总续航，充电仓能用一周，出差完全不用带充电线',
          '💕蓝牙5.3连接超稳，打游戏几乎零延迟，脚步声听得很清楚',
          '🌸硅胶耳帽软fufu的，戴3小时耳朵不疼，小耳洞星人狂喜',
        ],
        keywords: ['降噪耳机', '蓝牙耳机', '超长续航', '蓝牙5.3', 'ANC'],
        callToAction: '🔗限时秒杀价，手慢无',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster002/1024/1024',
        scene: 'product',
        prompt: 'Minimalist product photography of white wireless earbuds in charging case, clean white background, soft studio lighting, subtle shadow, premium tech product aesthetic',
        dimensions: { width: 1024, height: 1024 },
      },
      variants: [
        { variantId: 'v1', style: '参数风', title: 'SoundMax Pro｜ANC降噪+42h续航 蓝牙5.3', posterUrl: 'https://picsum.photos/seed/posterv1_002/1024/1024' },
        { variantId: 'v2', style: '种草风', title: '🔥百元价位降噪王者！亲测地铁秒变图书馆', posterUrl: 'https://picsum.photos/seed/posterv2_002/1024/1024' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T09:21:00Z',
      editedFields: ['sellingPoints'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T09:22:00Z', fileName: 'task_20250602_002.json' }],
    },
  },
  {
    taskId: 'task_20250602_003',
    status: 'completed',
    createdAt: '2026-06-02T09:30:00Z',
    updatedAt: '2026-06-02T09:35:00Z',
    platform: 'douyin',
    product: {
      name: '持妆柔雾气垫粉底',
      category: '美妆',
      subCategory: '底妆',
      brand: 'GlowUp',
      sku: 'GU-CUSHION-03',
      attributes: {
        material: '养肤精华+微米粉体',
        size: '12g+替换芯',
        color: '自然色#03',
        specs: 'SPF50+ PA+++、12h持妆、控油保湿',
      },
      targetAudience: '油皮/混油皮、需要长时间带妆的上班族',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/cushion003a/300/400',
        'https://picsum.photos/seed/cushion003b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refcushion003/300/400'],
      referenceLinks: ['https://douyin.com/shop/matt-cushion-glowup'],
      description: '油皮亲妈气垫，12小时不脱妆，越夜越美丽',
    },
    aiResults: {
      title: { text: '✨油皮亲妈气垫🔥12h不脱妆 亲测越夜越美丽绝绝子', confidence: 0.93 },
      copywriting: {
        headline: '🔥这气垫真的绝绝子，油皮夏天终于有救了',
        sellingPoints: [
          '✨持妆12小时不暗沉，早上出门啥样晚上回家还啥样，亲测有效',
          '🔥柔雾妆感巨高级，毛孔瞬间隐形，像开了磨皮滤镜',
          '💕SPF50+防晒值，底妆防晒一步搞定，早八人多睡10分钟',
          '🌸控油但不拔干，T区不泛油，两颊不卡粉，混油皮狂喜',
        ],
        keywords: ['油皮气垫', '持妆粉底', '柔雾妆感', 'SPF50', '控油保湿'],
        callToAction: '🔗拍1发3（正装+替换芯+小样），库存不多冲',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster003/1024/1536',
        scene: 'beauty_closeup',
        prompt: 'Close-up beauty photography of a young Asian woman with flawless matte skin, holding a cushion compact near her face, soft dreamy lighting, pink and white tones, vertical beauty poster style',
        dimensions: { width: 1080, height: 1920 },
      },
      variants: [
        { variantId: 'v1', style: '测评风', title: 'GlowUp气垫｜油皮12h实测 真的不脱妆', posterUrl: 'https://picsum.photos/seed/posterv1_003/1024/1536' },
        { variantId: 'v2', style: '种草风', title: '✨油皮姐妹冲！这气垫越夜越美丽', posterUrl: 'https://picsum.photos/seed/posterv2_003/1024/1536' },
      ],
    },
    userActions: {
      adopted: false,
      editedFields: [],
      exportHistory: [],
    },
  },
  {
    taskId: 'task_20250602_004',
    status: 'completed',
    createdAt: '2026-06-02T09:45:00Z',
    updatedAt: '2026-06-02T09:50:00Z',
    platform: 'temu',
    product: {
      name: '高腰阔腿牛仔裤',
      category: '女装',
      subCategory: '裤装',
      brand: 'DenimLab',
      sku: 'DL-JEANS-WD-028',
      attributes: {
        material: '98%棉+2%氨纶',
        size: '25-32码',
        color: '复古浅蓝',
        specs: '高腰、阔腿、拖地长度、做旧水洗',
      },
      targetAudience: '20-35岁都市女性、追求舒适与时尚兼顾',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/jeans004a/300/400',
        'https://picsum.photos/seed/jeans004b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refjeans004/300/400'],
      referenceLinks: ['https://temu.com/goods/wide-leg-jeans'],
      description: '复古水洗阔腿牛仔裤，遮肉显瘦神器',
    },
    aiResults: {
      title: { text: '🔥梨形身材救命裤✨高腰阔腿遮肉显瘦 亲测腿长两米', confidence: 0.92 },
      copywriting: {
        headline: '✨这条裤子真的封神了，梨形身材闭眼入',
        sellingPoints: [
          '🔥高腰设计直接把腰线拉到胃，腿瞬间变两米，比例绝绝子',
          '✨阔腿版型巨遮肉，大腿粗/小腿弯全藏住，走路带风',
          '💕复古水洗蓝超百搭，T恤衬衫随便配，一周穿搭不重样',
          '🌸含2%氨纶有弹性，蹲下不勒肚子，坐办公室一整天舒服',
        ],
        keywords: ['阔腿牛仔裤', '高腰显瘦', '梨形身材', '复古水洗', '遮肉'],
        callToAction: '🔗满2件减20，和闺蜜一起拼',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster004/1024/1536',
        scene: 'fashion_fullbody',
        prompt: 'Full-body fashion photography of a stylish Asian woman wearing light blue wide-leg jeans and white crop top, standing on urban street, natural sunlight, casual chic vibe, vertical fashion poster',
        dimensions: { width: 1080, height: 1920 },
      },
      variants: [
        { variantId: 'v1', style: '显瘦风', title: '梨形救命裤｜高腰阔腿 遮肉显瘦绝绝子', posterUrl: 'https://picsum.photos/seed/posterv1_004/1024/1536' },
        { variantId: 'v2', style: '百搭风', title: '🔥复古水洗牛仔裤 一周穿搭不重样', posterUrl: 'https://picsum.photos/seed/posterv2_004/1024/1536' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T09:51:00Z',
      editedFields: ['title', 'headline'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T09:52:00Z', fileName: 'task_20250602_004.json' }],
    },
  },
  {
    taskId: 'task_20250602_005',
    status: 'completed',
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-02T10:05:00Z',
    platform: 'douyin',
    product: {
      name: '便携磁吸充电宝 10000mAh',
      category: '数码',
      subCategory: '移动电源',
      brand: 'PowerStick',
      sku: 'PS-MAG-10K-WH',
      attributes: {
        material: '铝合金+磁吸模组',
        size: '107x69x16mm',
        color: '云石白',
        specs: '10000mAh、15W无线+20W有线、Magsafe兼容',
      },
      targetAudience: 'iPhone用户/重度手机使用者/商务出差人群',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/power005a/300/400',
        'https://picsum.photos/seed/power005b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refpower005/300/400'],
      referenceLinks: ['https://douyin.com/shop/magsafe-powerbank'],
      description: 'MagSafe磁吸充电宝，无线+有线双输出',
    },
    aiResults: {
      title: { text: '🔥iPhone磁吸充电宝✨一贴就来电 亲测出门不用带线了', confidence: 0.9 },
      copywriting: {
        headline: '✨这充电宝真的解放双手，磁吸一贴直接充',
        sellingPoints: [
          '🔥MagSafe磁吸超稳，甩手机都不会掉，无线充终于不鸡肋了',
          '✨10000mAh能充2-3次，出差一天完全够用，告别电量焦虑',
          '💕15W无线+20W有线双输出，朋友手机也能一起救急',
          '🌸薄到16mm，贴手机上不累手，放口袋没负担',
        ],
        keywords: ['磁吸充电宝', 'MagSafe', '无线充电宝', '10000mAh', 'iPhone配件'],
        callToAction: '🔗iPhone用户必入，送磁吸环安卓也能用',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster005/1024/1024',
        scene: 'tech_lifestyle',
        prompt: 'Lifestyle product photo of a slim white magnetic power bank attached to the back of a smartphone, clean minimal background, soft studio lighting, modern tech aesthetic',
        dimensions: { width: 1024, height: 1024 },
      },
      variants: [
        { variantId: 'v1', style: '功能风', title: 'PowerStick磁吸电宝｜15W无线+20W有线 10000mAh', posterUrl: 'https://picsum.photos/seed/posterv1_005/1024/1024' },
        { variantId: 'v2', style: '场景风', title: '🔥出门不带线！磁吸一贴直接充 亲测好用', posterUrl: 'https://picsum.photos/seed/posterv2_005/1024/1024' },
      ],
    },
    userActions: {
      adopted: false,
      editedFields: [],
      exportHistory: [],
    },
  },
  {
    taskId: 'task_20250602_006',
    status: 'completed',
    createdAt: '2026-06-02T10:15:00Z',
    updatedAt: '2026-06-02T10:20:00Z',
    platform: 'temu',
    product: {
      name: '丝绒哑光唇釉套装（6支）',
      category: '美妆',
      subCategory: '唇妆',
      brand: 'Velvet Kiss',
      sku: 'VK-LIPSET-6C',
      attributes: {
        material: '丝绒哑光配方+植物精油',
        size: '2.5ml×6支',
        color: '6色组合（豆沙/番茄/砖红/玫瑰/焦糖/莓果）',
        specs: '丝绒质地、不拔干、显色持久、迷你便携',
      },
      targetAudience: '学生党/初入职场/喜欢换唇色的美妆爱好者',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/lip006a/300/400',
        'https://picsum.photos/seed/lip006b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/reflip006/300/400'],
      referenceLinks: ['https://temu.com/goods/velvet-lip-set'],
      description: '6色丝绒唇釉套装，平价显白不挑皮',
    },
    aiResults: {
      title: { text: '✨6支唇釉才一杯奶茶钱🔥每支都显白 亲测黄皮也能涂', confidence: 0.93 },
      copywriting: {
        headline: '🔥这6个颜色真的绝绝子，黄皮涂上直接白两个度',
        sellingPoints: [
          '✨6个颜色全日常，豆沙通勤/番茄显白/砖红复古，一周不重样',
          '🔥丝绒质地不拔干，含植物精油，嘴巴不会起皮卡纹',
          '💕迷你2.5ml刚好用完不浪费，小包包也能塞下补妆超方便',
          '🌸显色度真的绝，薄涂提气色厚涂有气场，一支两用',
        ],
        keywords: ['丝绒唇釉', '显白口红', '平价唇釉', '6色套装', '黄皮友好'],
        callToAction: '🔗一套6支=1支大牌价，学生党闭眼冲',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster006/1024/1536',
        scene: 'beauty_flatlay',
        prompt: 'Flat lay beauty photography of 6 mini lip tint tubes arranged in a fan shape on a marble surface, soft pink and rose tones, elegant minimal aesthetic, vertical composition',
        dimensions: { width: 1024, height: 1536 },
      },
      variants: [
        { variantId: 'v1', style: '试色风', title: 'Velvet Kiss唇釉｜6色全试色 黄皮显白不踩雷', posterUrl: 'https://picsum.photos/seed/posterv1_006/1024/1536' },
        { variantId: 'v2', style: '种草风', title: '✨一杯奶茶钱get 6支显白唇釉 亲测好用', posterUrl: 'https://picsum.photos/seed/posterv2_006/1024/1536' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T10:21:00Z',
      editedFields: ['callToAction'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T10:22:00Z', fileName: 'task_20250602_006.json' }],
    },
  },
  {
    taskId: 'task_20250602_007',
    status: 'completed',
    createdAt: '2026-06-02T10:30:00Z',
    updatedAt: '2026-06-02T10:35:00Z',
    platform: 'douyin',
    product: {
      name: '针织开衫外套（慵懒风）',
      category: '女装',
      subCategory: '外套',
      brand: 'CozyKnit',
      sku: 'CK-CARDI-LZ-009',
      attributes: {
        material: '羊毛混纺针织',
        size: '均码（适合80-140斤）',
        color: '燕麦奶白',
        specs: 'V领、宽松版型、落肩袖、中长款',
      },
      targetAudience: '25-40岁追求舒适穿搭的都市女性',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/cardigan007a/300/400',
        'https://picsum.photos/seed/cardigan007b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refcardigan007/300/400'],
      referenceLinks: ['https://douyin.com/shop/cozy-cardigan'],
      description: '慵懒风针织开衫，秋冬必备叠穿神器',
    },
    aiResults: {
      title: { text: '✨慵懒风针织开衫🔥一穿就有氛围感 亲测温柔到发光', confidence: 0.91 },
      copywriting: {
        headline: '🔥这开衫真的氛围感神器，随便一披就很好看',
        sellingPoints: [
          '✨燕麦奶白色巨温柔，黄皮穿上也显气色，素颜出门无压力',
          '🔥宽松版型遮肉一绝，内搭吊带/连衣裙都好看，微胖友好',
          '💕羊毛混纺软糯不扎人，贴身穿也很舒服，敏感肌狂喜',
          '🌸中长款刚好盖住pp，配鲨鱼裤显瘦，配裙子温柔',
        ],
        keywords: ['针织开衫', '慵懒风', '氛围感穿搭', '秋冬外套', '温柔风'],
        callToAction: '🔗现货秒发，秋冬第一批库存有限',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster007/1024/1536',
        scene: 'lifestyle_fashion',
        prompt: 'Lifestyle fashion photography of a relaxed Asian woman wearing an oversized oatmeal-colored knit cardigan, sitting on a cozy sofa with coffee, warm natural lighting, soft hygge aesthetic, vertical composition',
        dimensions: { width: 1080, height: 1920 },
      },
      variants: [
        { variantId: 'v1', style: '氛围风', title: '慵懒开衫｜一穿就有氛围感 温柔到发光', posterUrl: 'https://picsum.photos/seed/posterv1_007/1024/1536' },
        { variantId: 'v2', style: '叠穿风', title: '✨秋冬叠穿神器！这开衫搭什么都好看', posterUrl: 'https://picsum.photos/seed/posterv2_007/1024/1536' },
      ],
    },
    userActions: {
      adopted: false,
      editedFields: [],
      exportHistory: [],
    },
  },
  {
    taskId: 'task_20250602_008',
    status: 'completed',
    createdAt: '2026-06-02T10:45:00Z',
    updatedAt: '2026-06-02T10:50:00Z',
    platform: 'temu',
    product: {
      name: '智能手表运动版',
      category: '数码',
      subCategory: '智能穿戴',
      brand: 'FitPulse',
      sku: 'FP-WATCH-SPORT-BK',
      attributes: {
        material: '铝合金表壳+硅胶表带',
        size: '44mm表盘',
        color: '曜石黑',
        specs: '心率/血氧/睡眠监测、50米防水、14天续航、100+运动模式',
      },
      targetAudience: '健身爱好者/关注健康的上班族/送父母的年轻人',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/watch008a/300/400',
        'https://picsum.photos/seed/watch008b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refwatch008/300/400'],
      referenceLinks: ['https://temu.com/goods/smart-watch-sport'],
      description: '高性价比智能手表，运动健康监测全能',
    },
    aiResults: {
      title: { text: '🔥百元智能手表天花板✨心率血氧全监测 亲测续航两周', confidence: 0.89 },
      copywriting: {
        headline: '✨这手表真的香，百元价位该有的功能全有',
        sellingPoints: [
          '🔥心率血氧睡眠全监测，数据准到和医院设备差不多，健康管理靠它',
          '✨14天超长续航，出差两周不用带充电器，告别一天一充',
          '💕100+运动模式，跑步游泳瑜伽都能记，卡路里消耗一目了然',
          '🌸50米防水，洗手游泳不用摘，夏天出汗也不慌',
        ],
        keywords: ['智能手表', '运动手表', '心率监测', '血氧检测', '超长续航'],
        callToAction: '🔗送父母/自用都合适，性价比天花板',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster008/1024/1024',
        scene: 'sports_lifestyle',
        prompt: 'Dynamic sports lifestyle photo of a person running wearing a sleek black smartwatch, blurred motion background, energetic mood, bright daylight, modern fitness aesthetic',
        dimensions: { width: 1024, height: 1024 },
      },
      variants: [
        { variantId: 'v1', style: '功能风', title: 'FitPulse智能表｜心率血氧+14天续航 100+运动', posterUrl: 'https://picsum.photos/seed/posterv1_008/1024/1024' },
        { variantId: 'v2', style: '性价比风', title: '🔥百元智能手表天花板！功能全还有14天续航', posterUrl: 'https://picsum.photos/seed/posterv2_008/1024/1024' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T10:51:00Z',
      editedFields: ['sellingPoints'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T10:52:00Z', fileName: 'task_20250602_008.json' }],
    },
  },
  {
    taskId: 'task_20250602_009',
    status: 'completed',
    createdAt: '2026-06-02T11:00:00Z',
    updatedAt: '2026-06-02T11:05:00Z',
    platform: 'douyin',
    product: {
      name: '氨基酸温和洁面乳',
      category: '美妆',
      subCategory: '洁面',
      brand: 'PureFoam',
      sku: 'PF-CLEANSER-AMN-150',
      attributes: {
        material: '双重氨基酸表活+神经酰胺',
        size: '150ml',
        color: '透明啫喱',
        specs: 'pH5.5弱酸性、无皂基、洗后不紧绷、敏感肌可用',
      },
      targetAudience: '敏感肌/干皮/追求温和洁面的用户',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/cleanser009a/300/400',
        'https://picsum.photos/seed/cleanser009b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/refcleanser009/300/400'],
      referenceLinks: ['https://douyin.com/shop/amino-cleanser'],
      description: '氨基酸洁面，温和不刺激，敏感肌亲妈',
    },
    aiResults: {
      title: { text: '✨敏感肌亲妈洁面🔥氨基酸配方 亲测洗完不紧绷绝绝子', confidence: 0.92 },
      copywriting: {
        headline: '🔥终于找到洗完不紧绷的洁面了，敏感肌真的爱住',
        sellingPoints: [
          '✨双重氨基酸表活，清洁力够但超温和，洗完脸不红不痒',
          '🔥pH5.5弱酸性，和皮肤一样温和，屏障不会越洗越薄',
          '💕神经酰胺保湿，洗完不紧绷不假滑，摸起来软fufu的',
          '🌸无皂基无香精，敏感肌/换季烂脸期都能用，亲测安心',
        ],
        keywords: ['氨基酸洁面', '敏感肌', '温和洁面', '弱酸性', '不紧绷'],
        callToAction: '🔗买1送1进行中，150ml大容量能用半年',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster009/1024/1536',
        scene: 'skincare_clean',
        prompt: 'Clean skincare photography of hands holding a transparent gel cleanser bottle with foam, soft water droplets on skin, pure white background, gentle fresh aesthetic, vertical beauty poster',
        dimensions: { width: 1080, height: 1920 },
      },
      variants: [
        { variantId: 'v1', style: '成分风', title: 'PureFoam洁面｜双重氨基酸+pH5.5 敏感肌专研', posterUrl: 'https://picsum.photos/seed/posterv1_009/1024/1536' },
        { variantId: 'v2', style: '种草风', title: '✨敏感肌亲妈！这洁面洗完真的不紧绷', posterUrl: 'https://picsum.photos/seed/posterv2_009/1024/1536' },
      ],
    },
    userActions: {
      adopted: false,
      editedFields: [],
      exportHistory: [],
    },
  },
  {
    taskId: 'task_20250602_010',
    status: 'completed',
    createdAt: '2026-06-02T11:15:00Z',
    updatedAt: '2026-06-02T11:20:00Z',
    platform: 'temu',
    product: {
      name: '复古胶片相机（一次性成像）',
      category: '数码',
      subCategory: '相机',
      brand: 'RetroSnap',
      sku: 'RS-FILM-27EXP-YW',
      attributes: {
        material: 'ABS塑料+光学玻璃镜头',
        size: '115x60x35mm',
        color: '柠檬黄',
        specs: '27张胶片、内置闪光灯、ISO400、即拍即得',
      },
      targetAudience: '大学生/情侣/喜欢复古风的年轻人群',
    },
    inputAssets: {
      productImages: [
        'https://picsum.photos/seed/film010a/300/400',
        'https://picsum.photos/seed/film010b/300/400',
      ],
      referenceImages: ['https://picsum.photos/seed/reffilm010/300/400'],
      referenceLinks: ['https://temu.com/goods/disposable-film-camera'],
      description: '复古一次性胶片相机，27张即拍即得，送闺蜜礼物',
    },
    aiResults: {
      title: { text: '🔥复古胶片机✨27张即拍即得 亲测出片氛围感绝绝子', confidence: 0.9 },
      copywriting: {
        headline: '✨这胶片机真的出片神器，随手拍都是氛围感大片',
        sellingPoints: [
          '🔥内置闪光灯+ISO400胶片，白天晚上都能拍，出片率超高',
          '✨27张刚好记录一次旅行/约会，拍完后寄回冲洗，仪式感拉满',
          '💕柠檬黄颜值超高，拿在手上就是时尚单品，拍照凹造型必备',
          '🌸即拍即得不废片，比拍立得便宜多了，学生党也能玩胶片',
        ],
        keywords: ['胶片相机', '一次性相机', '复古相机', '即拍即得', '氛围感'],
        callToAction: '🔗送冲洗券，拍完后免费冲印寄到家',
      },
      poster: {
        imageUrl: 'https://picsum.photos/seed/poster010/1024/1024',
        scene: 'vintage_lifestyle',
        prompt: 'Vintage lifestyle photography of a bright yellow disposable film camera on a wooden table with scattered film photos, warm nostalgic lighting, retro aesthetic, cozy creative vibe',
        dimensions: { width: 1024, height: 1024 },
      },
      variants: [
        { variantId: 'v1', style: '复古风', title: 'RetroSnap胶片机｜27张即拍即得 氛围感神器', posterUrl: 'https://picsum.photos/seed/posterv1_010/1024/1024' },
        { variantId: 'v2', style: '礼物风', title: '🔥送闺蜜的礼物！胶片机出片真的绝绝子', posterUrl: 'https://picsum.photos/seed/posterv2_010/1024/1024' },
      ],
    },
    userActions: {
      adopted: true,
      adoptedAt: '2026-06-02T11:21:00Z',
      editedFields: ['title'],
      exportHistory: [{ format: 'json', exportedAt: '2026-06-02T11:22:00Z', fileName: 'task_20250602_010.json' }],
    },
  },
];
