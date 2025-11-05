// 日本語翻訳
export default {
  common: {
    loading: '読み込み中...',
    loadingPhase: '読み込み中...',
    fetchingPhaseInfo: '現在の時間帯情報を取得中',
    error: 'エラー',
    retry: '再試行',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    delete: '削除',
    noResults: '一致する場所が見つかりません',
    select: '選択',
    evValue: '露出値',
    environment: '環境',
    exposureConditions: {
      veryDark: '非常に暗い',
      lowLight: '低照度',
      indoor: '室内',
      overcast: '曇天屋外',
      shadedSunny: '晴天日陰',
      sunny: '晴天',
      veryBright: '非常に明るい',
    },
    units: {
      second: '秒',
      seconds: '秒',
      sec: '秒',
      minute: '分',
      minutes: '分',
      min: '分',
      hour: '時間',
      hours: '時間',
      cm: 'cm',
      m: 'm',
      year: '年',
      month: '月',
      day: '日',
    },
  },
  
  locationSearch: {
    placeholder: '場所を検索',
    noResults: '一致する場所が見つかりません',
  },
  
  navigation: {
    home: 'ホーム',
    sunTimes: 'ブルーアワー',
    calculator: '計算機',
    settings: '設定',
  },
  
  home: {
    title: 'BlueHour',
    subtitle: '写真撮影アシスタントツール',
    features: {
      sunTimes: {
        title: 'ブルーアワー',
        description: '日の出、日の入り、ゴールデンアワー、ブルーアワーを確認',
      },
      evCalculator: {
        title: 'EV露出',
        description: '等価露出の組み合わせを計算',
      },
      ndCalculator: {
        title: 'NDフィルター',
        description: '長時間露光のシャッター速度を計算',
      },
      dofCalculator: {
        title: '被写界深度',
        description: '被写界深度と過焦点距離を計算',
      },
      settings: {
        title: '設定',
        description: 'アプリの使用体験をカスタマイズ',
      },
    },
  },
  
  sunTimes: {
    title: '日の出・日の入り時刻',
    searchPlaceholder: '場所を検索（多言語対応）',
    refreshLocation: '現在地を更新',
    selectDate: '日付を選択',
    
    // 時間帯名
    phases: {
      astronomicalTwilightBegin: '天文薄明開始',
      nauticalTwilightBegin: '航海薄明開始',
      civilTwilightBegin: '市民薄明開始',
      morningBlueHourStart: 'ブルーアワー開始',
      morningBlueHourEnd: 'ブルーアワー終了',
      morningBlueHour: '朝のブルーアワー',
      sunrise: '日の出',
      morningGoldenHourStart: 'ゴールデンアワー開始',
      morningGoldenHourEnd: 'ゴールデンアワー終了',
      morningGoldenHour: '朝のゴールデンアワー',
      solarNoon: '正午',
      eveningGoldenHourStart: 'ゴールデンアワー開始',
      eveningGoldenHourEnd: 'ゴールデンアワー終了',
      eveningGoldenHour: '夕方のゴールデンアワー',
      sunset: '日の入り',
      eveningBlueHourStart: 'ブルーアワー開始',
      eveningBlueHourEnd: 'ブルーアワー終了',
      eveningBlueHour: '夕方のブルーアワー',
      civilTwilightEnd: '市民薄明終了',
      nauticalTwilightEnd: '航海薄明終了',
      astronomicalTwilightEnd: '天文薄明終了',
      daylight: '日中',
      night: '夜間',
    },
    
    // セクションラベル
    morning: '朝',
    daytime: '日中',
    evening: '夕方',
    
    // その他の情報
    otherInfo: 'その他の情報',
    solarNoonLabel: '太陽正午',
    dayLengthLabel: '日長',
    
    // エラーメッセージ
    errorTitle: 'エラー',
    errorMessage: '日の出・日の入り時刻の取得に失敗しました',
    unknownError: '不明なエラー',
    
    // 現在の時間帯カード
    currentPhase: {
      distanceTo: '{{phase}}まであと {{time}}',
      tomorrows: '明日の',
    },
    
    // 時間フォーマット
    timeFormat: {
      hours: '{{count}} 時間',
      minutes: '{{count}} 分',
      hoursMinutes: '{{hours}} 時間 {{minutes}} 分',
    },
  },
  
  calculator: {
    title: '撮影計算機',
    evTitle: 'EV計算機',
    ndTitle: 'NDフィルター',
    dofTitle: '被写界深度',
    
    // EV計算機
    ev: {
      title: 'EV露出計算機',
      description: '露出を維持しながら、絞り・シャッタースピード・ISOを自由に調整',
      baseExposure: '基準露出',
      adjustExposure: '露出調整',
      aperture: '絞り',
      shutter: 'シャッター',
      iso: 'ISO',
      lockParam: 'ロックするパラメータ',
      calculate: '等価露出を計算',
      resetToCurrent: '現在の値にリセット',
    },
    
    // NDフィルター計算機
    nd: {
      title: 'NDフィルター計算機',
      description: 'NDフィルター使用後のシャッタースピードを計算、タイマー内蔵',
      originalShutter: '元のシャッタースピード',
      originalShutterHint: '(NDフィルターなしの測光値)',
      ndStrength: 'NDフィルター強度',
      stops: '段',
      newShutter: '新しいシャッタースピード',
      calculate: '計算',
      startTimer: 'タイマー開始',
      stopTimer: 'タイマー停止',
      resetTimer: 'リセット',
      timerTitle: '露出タイマー',
      ready: '準備完了',
      exposing: '露出中...',
      complete: '露出完了！',
    },
    
    // 被写界深度計算機
    dof: {
      title: '被写界深度計算機',
      description: '明瞭範囲と過焦点距離を計算し、被写界深度を正確に制御',
      focalLength: '焦点距離',
      focalLengthUnit: 'mm',
      aperture: '絞り',
      focusDistance: '焦点距離',
      focusDistanceUnit: 'メートル',
      sensorSize: 'センサーサイズ',
      sensors: {
        fullFrame: 'フルフレーム',
        apscCanon: 'APS-C (Canon)',
        apscNikonSony: 'APS-C (Nikon/Sony)',
        m43: 'M4/3 (マイクロフォーサーズ)',
        oneInch: '1" (CX)',
      },
      calculate: '被写界深度を計算',
      results: '計算結果',
      totalDof: '総被写界深度',
      nearLimit: '近距離限界',
      farLimit: '遠距離限界',
      hyperfocal: '過焦点距離',
      hyperfocalDesc: 'この距離にフォーカスすると、過焦点距離の半分から無限遠まで鮮明に',
      tips: '使用のヒント',
      portraitTip: 'ポートレート撮影',
      portraitDesc: '開放絞り（例：f/1.8）を使用し、浅い被写界深度で背景をぼかす',
      landscapeTip: '風景撮影',
      landscapeDesc: '絞り込み（例：f/11）、過焦点距離にフォーカスして前景から遠景まで鮮明に',
      streetTip: 'ストリート撮影',
      streetDesc: '中間絞り（例：f/5.6）を使用し、被写界深度とシャッタースピードのバランスをとる',
    },
  },
  
  settings: {
    title: '設定',
    language: '言語',
    theme: 'テーマ',
    appearance: '外観',
    appearanceDescription: 'お好みのテーマモードを選択',
    themeLight: 'ライトモード',
    themeDark: 'ダークモード',
    themeAuto: 'システムに従う',
    themeLightDesc: '明るく爽やかなインターフェース、日中の使用に最適',
    themeDarkDesc: '目に優しいダークインターフェース、夜間の使用に最適',
    themeAutoDesc: 'システム設定に応じて自動的にライト/ダークモードを切り替え',
    selectLanguageDesc: 'お好みの言語を選択してください',
    selectThemeDesc: 'お好みのテーマモードを選択してください',
    currentLanguage: '現在の言語',
    currentTheme: '現在のテーマ',
    about: 'アプリについて',
    aboutDescription: 'アプリ情報と機能説明',
    appName: 'BlueHour - 写真撮影アシスタント',
    version: 'バージョン',
    description: '写真愛好家のために設計されたツールアプリ。完璧な撮影時間の計画や、露出パラメータ、NDフィルター、被写界深度の計算を簡単に行えます。',
    features: '機能',
    support: 'サポート',
    featureList: {
      blueHour: {
        title: 'ブルーアワープランナー',
        description: 'ゴールデンアワーとブルーアワーの正確な時刻を取得',
      },
      evCalculator: {
        title: 'EV露出計算機',
        description: '等価露出を計算し、絞り、シャッター、ISOを自由に調整',
      },
      ndFilter: {
        title: 'NDフィルター計算機',
        description: 'NDフィルター使用後のシャッター速度を正確に計算',
      },
      dof: {
        title: '被写界深度計算機',
        description: '被写界深度範囲と過焦点距離を計算',
      },
    },
    
    languages: {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      de: 'Deutsch',
    },
    
    dataSource: 'データソース',
    dataSourceText: '日の出・日の入りデータは sunrise-sunset.org API より提供',
    feedbackSupport: 'フィードバックとサポート',
    github: 'GitHub',
    contactSupport: 'サポートに連絡',
    copyright: '© 2025 BlueHour Photography Tools',
    madeWithLove: '写真愛好家のために ❤️ を込めて作成',
  },
};
