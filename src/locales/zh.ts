// 中文翻译
export default {
  common: {
    loading: '加载中...',
    loadingPhase: '正在加载...',
    fetchingPhaseInfo: '正在获取当前时段信息',
    error: '错误',
    retry: '重试',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    noResults: '未找到匹配的地点',
    select: '选择',
    evValue: '曝光值',
    environment: '环境',
    exposureConditions: {
      veryDark: '极暗环境',
      lowLight: '低光环境',
      indoor: '室内光线',
      overcast: '阴天户外',
      shadedSunny: '晴天阴影',
      sunny: '晴天直射',
      veryBright: '极亮环境',
    },
    units: {
      second: '秒',
      seconds: '秒',
      sec: '秒',
      minute: '分钟',
      minutes: '分钟',
      min: '分',
      hour: '小时',
      hours: '小时',
      cm: 'cm',
      m: 'm',
      year: '年',
      month: '月',
      day: '日',
    },
  },

  locationSearch: {
    placeholder: '搜索地点',
    noResults: '未找到匹配的地点',
  },

  navigation: {
    home: '主页',
    sunTimes: '蓝调时刻',
    calculator: '曝光实验室',
    settings: '设置',
  },

  home: {
    title: 'BlueHour',
    subtitle: '光线与时间的口袋伙伴',
    hero: {
      waitingPhase: '正在计算今日光线...',
      waitingLocation: '获取位置中...',
      locating: '定位中...',
      refreshLocation: '更新定位',
      nextBlueHour: '下一次蓝调时刻',
    },
    cta: {
      defaultTitle: '探索更多拍摄可能',
      defaultDescription: '光线总在变化，尝试不同的曝光组合。',
      dayTitle: '寻找构图的最佳时机',
      dayDescription: '强光下适合踩点。提前确认机位，为晚上的拍摄做准备。',
      blueTitle: '捕捉冷暖色调的平衡',
      blueDescription: '天空与城市灯光亮度最接近的时刻，注意控制高光。',
      nightTitle: '尝试光绘或星空摄影',
      nightDescription: '利用黑暗环境创作，或者使用 B 门拍摄车轨。',
    },
    timeline: {
      title: '今日光线时间轴',
    },
    features: {
      sunTimeline: {
        title: '蓝调时刻表',
        description: '一眼掌握黄金/蓝调/暮光的开始与结束。',
      },
      exposureLab: {
        title: '曝光实验室',
        description: 'EV、ND、倒易律与计时器整合为一个流程。',
      },
      settings: {
        title: '偏好设置',
        description: '管理语言、主题与其他个性化选项。',
      },
    },
    tips: {
      title: '每日摄影贴士',
      items: {
        tripod: '蓝调时刻光线较暗，务必使用三脚架以保持画质清晰。',
        aperture: '拍摄城市夜景时，使用 f/8 - f/11 的小光圈可以拍出漂亮的星芒。',
        iso: '尽量使用原生最低 ISO（如 ISO 100）以减少噪点，保证天空纯净。',
        raw: '建议使用 RAW 格式拍摄，以便后期调整白平衡和找回暗部细节。',
        foreground: '广角拍摄时，寻找有趣的前景（如水坑、栏杆）能增加照片的层次感。',
      }
    },
    sections: {
      sunPlannerAction: '打开完整时间轴',
      exposureLabAction: '进入曝光实验室',
      calculatorShortcuts: '计算器快捷入口',
      toolsTitle: '工具与偏好',
      toolsDescription: '快速调整语言、主题与应用信息。',
      languageShortcut: '立即切换应用语言。',
      themeShortcut: '在浅色、深色或跟随系统之间切换。',
      settingsShortcut: '打开设置与关于页面。',
    },
  },

  sunTimes: {
    title: '日出日落时间',
    guide: {
      title: '光线阶段指南',
      astronomicalTwilight: {
        title: '天文晨昏蒙影',
        desc: '天空非常黑暗，肉眼几乎看不到星星。这是拍摄星空、银河的最佳时机。地平线上仅有微弱的光线。',
      },
      nauticalTwilight: {
        title: '航海晨昏蒙影',
        desc: '地平线依稀可见，过去水手利用此时段进行星象导航。天空呈现深蓝色调，城市灯光开始亮起。',
      },
      civilTwilight: {
        title: '民用晨昏蒙影',
        desc: '太阳在地平线以下，但光线充足，户外活动无需人工照明。天空色彩丰富，是拍摄城市景观的好时机。',
      },
      blueHour: {
        title: '蓝色时刻 (Blue Hour)',
        desc: '日出前或日落后的一短暂时刻，天空呈现迷人的深蓝色。冷暖色调对比强烈，是城市夜景和建筑摄影的黄金时间。',
      },
      goldenHour: {
        title: '黄金时刻 (Golden Hour)',
        desc: '日出后或日落前，阳光角度低，光线柔和温暖，呈现金黄色。阴影柔和，非常适合人像和风光摄影。',
      },
      information: {
        title: '暮光的类型',
        desc: '暮光分为三种类型：民用暮光、航海暮光和天文暮光。它们按顺序发生，在地球上的任何地方都以相同顺序出现。暮光的类型取决于太阳中心在地平线下的角度：\n\n民用暮光：0°至12°\n航海暮光：6°至12°\n天文暮光：12°至18°\n\n当太阳在地平线下超过18°（天文暮光之后）时，这段时间被称为“夜晚”或“完全黑暗”。',
      },
    },
    searchPlaceholder: '搜索地点（支持多语言）',
    refreshLocation: '刷新当前位置',
    selectDate: '选择日期',

    // 时段名称
    phases: {
      astronomicalTwilightBegin: '天文晨昏蒙影开始',
      nauticalTwilightBegin: '航海晨昏蒙影开始',
      civilTwilightBegin: '民用晨昏蒙影开始',
      morningBlueHourStart: '蓝色时刻开始',
      morningBlueHourEnd: '蓝色时刻结束',
      morningBlueHour: '早晨蓝调时刻',
      sunrise: '日出',
      morningGoldenHourStart: '黄金时刻开始',
      morningGoldenHourEnd: '黄金时刻结束',
      morningGoldenHour: '早晨黄金时刻',
      solarNoon: '正午',
      eveningGoldenHourStart: '黄金时刻开始',
      eveningGoldenHourEnd: '黄金时刻结束',
      eveningGoldenHour: '傍晚黄金时刻',
      sunset: '日落',
      eveningBlueHourStart: '蓝色时刻开始',
      eveningBlueHourEnd: '蓝色时刻结束',
      eveningBlueHour: '傍晚蓝调时刻',
      civilTwilightEnd: '民用晨昏蒙影结束',
      nauticalTwilightEnd: '航海晨昏蒙影结束',
      astronomicalTwilightEnd: '天文晨昏蒙影结束',
      daylight: '白天',
      night: '夜晚',
    },

    // 时段标签
    morning: '早晨',
    daytime: '白天',
    evening: '傍晚',

    // 其他信息
    otherInfo: '其他信息',
    solarNoonLabel: '太阳正午',
    dayLengthLabel: '白天时长',

    // 错误消息
    errorTitle: '错误',
    errorMessage: '获取日出日落时间失败',
    unknownError: '未知错误',

    // 当前时段卡片
    currentPhase: {
      distanceTo: '距离{{phase}}还有 {{time}}',
      tomorrows: '明天的',
    },

    // 时间格式
    timeFormat: {
      hours: '{{count}} 小时',
      minutes: '{{count}} 分钟',
      hoursMinutes: '{{hours}} 小时 {{minutes}} 分钟',
    },
  },

  calculator: {
    title: '摄影计算器',
    evTitle: 'EV 计算器',
    ndTitle: 'ND 滤镜',
    dofTitle: '景深',

    // EV 计算器
    ev: {
      title: 'EV 曝光等效计算器',
      description: '保持曝光量不变，自由调整光圈、快门和 ISO',
      baseExposure: '基准曝光',
      adjustExposure: '调整曝光',
      aperture: '光圈',
      shutter: '快门',
      iso: 'ISO',
      lockParam: '锁定参数',
      calculate: '计算等效曝光',
      resetToCurrent: '重置为当前值',
      selectScene: '选择场景',
      scenes: {
        ev16: '雪地/沙滩强光',
        ev15: '晴朗日光 (阳光16法则)',
        ev14: '薄云/柔和日光',
        ev13: '多云/阴影下',
        ev12: '阴天/日出日落',
        ev11: '深阴天/黄昏',
        ev10: '日落后/暴风雨',
        ev9: '蓝调时刻/灯火通明',
        ev8: '城市夜景/篝火',
        ev7: '室内人工照明',
        ev6: '家庭室内/夜市',
        ev5: '明亮路灯下',
        ev4: '烛光/圣诞彩灯',
        ev3: '月光下的风景',
        ev2: '远处灯光/闪电',
        ev1: '远处天际线',
        ev0: '极暗/仅有星光',
        evMinus1: '银河/极光 (需高ISO)',
        evMinus2: '深空摄影',
        evMinus3: '几乎完全黑暗',
        evMinus4: '无月夜景',
        evMinus5: '极暗环境',
        evMinus6: '长时间曝光',
      },
    },

    // ND 滤镜计算器
    nd: {
      title: 'ND 滤镜计算器',
      description: '计算使用 ND 滤镜后的快门速度,内置计时器',
      originalShutter: '原始快门速度',
      originalShutterHint: '(不使用 ND 滤镜时的测光值)',
      ndStrength: 'ND 滤镜强度',
      stops: '档',
      newShutter: '新快门速度',
      calculate: '计算',
      startTimer: '开始计时',
      stopTimer: '停止计时',
      resetTimer: '重置',
      timerTitle: '曝光计时器',
      ready: '准备就绪',
      exposing: '曝光中...',
      complete: '曝光完成！',
    },

    // 景深计算器
    dof: {
      title: '景深计算器',
      description: '计算清晰范围和超焦距，精确控制景深',
      focalLength: '焦距',
      focalLengthUnit: 'mm',
      aperture: '光圈',
      focusDistance: '对焦距离',
      focusDistanceUnit: '米',
      sensorSize: '传感器尺寸',
      sensors: {
        fullFrame: '全画幅 (Full Frame)',
        apscCanon: 'APS-C (Canon)',
        apscNikonSony: 'APS-C (Nikon/Sony)',
        m43: 'M4/3 (Micro Four Thirds)',
        oneInch: '1" (CX)',
      },
      calculate: '计算景深',
      results: '计算结果',
      totalDof: '总景深',
      nearLimit: '近端清晰距离',
      farLimit: '远端清晰距离',
      hyperfocal: '超焦距',
      hyperfocalDesc: '对焦在此距离，可使从超焦距的一半到无限远都清晰',
      tips: '使用技巧',
      portraitTip: '人像摄影',
      portraitDesc: '使用大光圈（如 f/1.8），景深浅，背景虚化',
      landscapeTip: '风光摄影',
      landscapeDesc: '使用小光圈（如 f/11），对焦在超焦距处，确保前景到远景都清晰',
      streetTip: '街拍',
      streetDesc: '使用中等光圈（如 f/5.6），平衡景深和快门速度',
    },

    exposureLab: {
      title: '曝光实验室',
      subtitle: '长曝光一条龙：ND、倒易律与 B 门计时一次完成。',
      currentEv: '测光 EV',
      evHelper: '锁定一个参数，调整另两个，保持同一曝光量。',
      baseSettings: '测光设置',
      sceneShortcuts: '场景预设',
      sceneHint: '常见蓝调曝光一键套用，快速进入状态。',
      ndSection: 'ND 滤镜（可选）',
      ndHint: '在强光下使用 ND，延长快门创造流动感。',
      ndNone: '不使用 ND 滤镜',
      reciprocitySection: '胶片倒易律',
      reciprocity: {
        digital: '数码/无需校正',
        digitalDescription: '拍摄数码或现代传感器时选用此项。',
        digitalHint: '曝光时间保持不变。',
        
        // Foma
        foma100: 'Fomapan 100 Classic',
        foma100Description: '倒易率失效极快，1秒以上即需大幅补偿。',
        foma100Hint: '1秒变3秒，10秒变80秒！',
        
        foma200: 'Fomapan 200 Creative',
        foma200Description: '扁平颗粒技术，失效稍好于100/400。',
        foma200Hint: '1秒变3秒，10秒变60秒。',
        
        foma400: 'Fomapan 400 Action',
        foma400Description: '倒易率失效极快，类似 Foma 100。',
        foma400Hint: '1秒变3秒，10秒变80秒！',

        // Kodak Motion Picture
        kodak_50d: 'Kodak Vision3 50D (5203)',
        kodak_50dDescription: '日光型低感电影卷，画质极其细腻。',
        kodak_50dHint: '同 Cinestill 50D，10秒约需13秒。',

        kodak_250d: 'Kodak Vision3 250D (5207)',
        kodak_250dDescription: '日光型中感电影卷，全能型选手。',
        kodak_250dHint: '宽容度极高，10秒约需13秒。',

        kodak_500t: 'Kodak Vision3 500T (5219)',
        kodak_500tDescription: '灯光型高感电影卷，夜景之王。',
        kodak_500tHint: '同 Cinestill 800T，10秒约需13秒。',

        // Color Negative
        kodak_portra: 'Kodak Portra 160/400',
        kodak_portraDescription: '宽容度极高，2秒以上需轻微补偿。',
        kodak_portraHint: '宁曝勿欠，色彩表现优秀。',
        
        kodak_gold: 'Kodak Gold/Ultramax',
        kodak_goldDescription: '消费级胶卷，长曝建议稍多补偿。',
        kodak_goldHint: '注意长曝可能偏色。',
        
        fuji_superia: 'Fuji Superia/Pro 400H',
        fuji_superiaDescription: '富士胶卷，长曝可能偏绿/紫。',
        fuji_superiaHint: '4秒+1/3档，16秒+2/3档。',
        
        cinestill_800t: 'Cinestill 800T/50D',
        cinestill_800tDescription: '基于电影卷，夜景光晕独特。',
        cinestill_800tHint: '倒易率失效较明显。',
        
        lomo_cn: 'Lomography CN 400/800',
        lomo_cnDescription: '颗粒较粗，建议多给曝光。',
        lomo_cnHint: '类似早期柯达乳剂。',
        
        // B&W
        kodak_trix: 'Kodak Tri-X 400',
        kodak_trixDescription: '经典黑白，倒易率失效较明显。',
        kodak_trixHint: '10秒测光需曝光约50秒。',
        
        kodak_tmax100: 'Kodak T-Max 100',
        kodak_tmax100Description: '极佳的倒易率表现。',
        kodak_tmax100Hint: '接近 Acros，10秒仅需12秒。',
        
        kodak_tmax400: 'Kodak T-Max 400',
        kodak_tmax400Description: '较好的倒易率表现。',
        kodak_tmax400Hint: '10秒测光需曝光约18秒。',
        
        ilford_hp5: 'Ilford HP5 Plus',
        ilford_hp5Description: '经典黑白卷，标准倒易率。',
        ilford_hp5Hint: '10秒测光需曝光约20秒。',
        
        ilford_fp4: 'Ilford FP4 Plus',
        ilford_fp4Description: '中低感光度，表现稳定。',
        ilford_fp4Hint: '10秒测光需曝光约18秒。',
        
        ilford_delta100: 'Ilford Delta 100',
        ilford_delta100Description: '细腻颗粒，表现稳定。',
        ilford_delta100Hint: '10秒测光需曝光约18秒。',
        
        ilford_delta400: 'Ilford Delta 400',
        ilford_delta400Description: '高速微粒，失效较快。',
        ilford_delta400Hint: '10秒测光需曝光约25秒。',
        
        ilford_delta3200: 'Ilford Delta 3200',
        ilford_delta3200Description: '超高速卷，需显著补偿。',
        ilford_delta3200Hint: '10秒测光需曝光约21秒。',
        
        ilford_panf: 'Ilford Pan F Plus',
        ilford_panfDescription: '低感光度，画质细腻。',
        ilford_panfHint: '10秒测光需曝光约21秒。',
        
        ilford_xp2: 'Ilford XP2 Super',
        ilford_xp2Description: 'C-41工艺黑白卷。',
        ilford_xp2Hint: '10秒测光需曝光约20秒。',
        
        ilford_sfx: 'Ilford SFX 200',
        ilford_sfxDescription: '扩展红外感光。',
        ilford_sfxHint: '10秒测光需曝光约27秒。',
        
        fuji_acros: 'Fuji Neopan Acros II',
        fuji_acrosDescription: '倒易率王者，120秒内无需补偿。',
        fuji_acrosHint: '长曝首选黑白卷。',
        
        // Slide
        kodak_e100: 'Kodak Ektachrome E100',
        kodak_e100Description: '现代反转片，表现优秀。',
        kodak_e100Hint: '10秒+1/3档。',
        
        fuji_velvia50: 'Fuji Velvia 50',
        fuji_velvia50Description: '倒易率极差，慎用于长曝。',
        fuji_velvia50Hint: '4秒以上需大幅补偿。',
        
        fuji_provia100f: 'Fuji Provia 100F',
        fuji_provia100fDescription: '长曝首选反转片。',
        fuji_provia100fHint: '128秒内无需补偿！',
      },
      resultTitle: '长曝光结果',
      resultBase: '原始快门',
      resultNd: '加 ND 后',
      resultReciprocity: '倒易律校正后',
      timerTitle: 'B 门计时器',
      startTimer: '开始计时',
      stopTimer: '停止计时',
      timerDone: '曝光完成',
      start: '开始',
      stop: '停止',
      timer: {
        countdown: '倒计时',
        bulb: 'B门计时',
      },
    },
  },

  settings: {
    title: '设置',
    preferences: '偏好设置',
    language: '语言',
    theme: '主题',
    aboutApp: '关于应用',
    appearance: '外观',
    appearanceDescription: '选择您喜欢的主题模式',
    themeLight: '浅色模式',
    themeDark: '深色模式',
    themeAuto: '跟随系统',
    themeLightDesc: '明亮清新的界面,适合白天使用',
    themeDarkDesc: '护眼的深色界面,适合夜间使用',
    themeAutoDesc: '根据系统设置自动切换明暗模式',
    selectLanguageDesc: '选择您偏好的语言',
    selectThemeDesc: '选择您喜欢的主题模式',
    currentLanguage: '当前语言',
    currentTheme: '当前主题',
    about: '关于应用',
    aboutDescription: '应用信息和功能说明',
    appName: 'BlueHour - 摄影助手',
    version: '版本',
    description: '专为摄影爱好者设计的工具应用，帮助您规划完美的拍摄时间，轻松计算曝光参数、ND 滤镜和景深。',
    features: '功能',
    support: '支持',
    featureList: {
      blueHour: {
        title: '蓝调时刻规划器',
        description: '获取黄金时刻和蓝色时刻的精确时间',
      },
      exposureLab: {
        title: '曝光实验室',
        description: '一个页面串联 EV、ND、倒易律与 B 门计时',
      },
    },

    languages: {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      de: 'Deutsch',
    },

    dataSource: '数据来源',
    dataSourceText: '日出日落数据由 sunrise-sunset.org API 提供',
    feedbackSupport: '反馈与支持',
    github: 'GitHub',
    contactSupport: '联系支持',
    copyright: '© 2025 BlueHour Photography Tools',
    madeWithLove: '用 ❤️ 为摄影爱好者打造',
  },
  exposureLabHelp: {
    title: '曝光实验室 - 功能介绍',
    section1: {
      title: '1. 基础曝光参数',
      content: [
        '光圈 (Aperture)、快门 (Shutter)、ISO：自由调整三大曝光要素。',
        '智能锁定：点击参数旁的锁图标，可锁定该参数。调整其他数值时，系统会自动计算未锁定的参数，以保持曝光值 (EV) 平衡。',
        'EV 锁定：锁定当前曝光值 (EV)，调整任意参数时，其他参数会自动联动变化。',
      ],
    },
    section2: {
      title: '2. 场景 EV 参考',
      content: [
        '提供从强光到极暗环境（如日光、阴天、夜景、星空）的多种场景参考。',
        '点击场景卡片，可直接将该场景的 EV 值设为目标值。',
      ],
    },
    section3: {
      title: '3. ND 滤镜计算',
      content: [
        '模拟安装 ND 减光镜后的效果。',
        '选择不同的 ND 档位（如 ND8, ND1000），系统会自动计算减光后的等效快门速度。',
      ],
    },
    section4: {
      title: '4. 倒易律失效补偿',
      content: [
        '专为胶片摄影设计。',
        '选择胶片类型预设，系统会自动计算长曝光下因倒易律失效而需要增加的补偿时间。',
      ],
    },
    section5: {
      title: '5. 曝光计时器',
      content: [
        '根据计算出的最终曝光时间（已包含 ND 减光和倒易律补偿），提供倒计时功能，方便进行长曝光拍摄。',
      ],
    },
  },
};
