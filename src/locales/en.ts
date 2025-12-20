// English translations
export default {
  common: {
    loading: 'Loading...',
    loadingPhase: 'Loading...',
    fetchingPhaseInfo: 'Fetching current phase information',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    noResults: 'No matching locations found',
    select: 'Select',
    evValue: 'Exposure Value',
    environment: 'Environment',
    exposureConditions: {
      veryDark: 'Very Dark',
      lowLight: 'Low Light',
      indoor: 'Indoor',
      overcast: 'Overcast',
      shadedSunny: 'Shaded/Sunny',
      sunny: 'Bright Sunny',
      veryBright: 'Very Bright',
    },
    units: {
      second: 's',
      seconds: 's',
      sec: 's',
      minute: 'min',
      minutes: 'min',
      min: 'min',
      hour: 'h',
      hours: 'h',
      cm: 'cm',
      m: 'm',
      year: '',
      month: '/',
      day: '/',
    },
  },

  locationSearch: {
    placeholder: 'Search location',
    noResults: 'No matching locations found',
  },

  navigation: {
    home: 'Home',
    sunTimes: 'Blue Hour',
    calculator: 'Exposure Lab',
    settings: 'Settings',
  },

  home: {
    title: 'BlueHour',
    subtitle: 'Light & time companion',
    hero: {
      waitingPhase: "Calculating today's light...",
      waitingLocation: 'Getting location...',
      locating: 'Locating...',
      refreshLocation: 'Update Location',
      nextBlueHour: 'Next blue hour',
    },
    cta: {
      defaultTitle: 'Explore Creative Options',
      defaultDescription: 'Light is always changing. Try different exposure combinations.',
      dayTitle: 'Scout for Compositions',
      dayDescription: 'Harsh light is perfect for finding angles. Plan your spot for tonight.',
      blueTitle: 'Balance City Lights',
      blueDescription: 'Sky and artificial lights are equal brightness. Watch your highlights.',
      nightTitle: 'Try Light Painting',
      nightDescription: 'Use the darkness for creative light painting or star trails.',
    },
    timeline: {
      title: 'Light timeline (today)',
    },
    features: {
      sunTimeline: {
        title: 'Blue Hour Planner',
        description: 'See golden hour, blue hour, and twilight for your location.',
      },
      exposureLab: {
        title: 'Exposure Lab',
        description: 'One workflow for EV tuning, ND math, reciprocity and timer.',
      },
      settings: {
        title: 'Settings',
        description: 'Language, theme and personalization.',
      },
    },
    tips: {
      title: 'Daily Photo Tip',
      items: {
        tripod: 'Blue hour light is low; use a tripod to keep your images sharp.',
        aperture: 'For cityscapes, use a small aperture (f/8 - f/11) to create starbursts on streetlights.',
        iso: 'Stick to the base ISO (e.g., ISO 100) to minimize noise and keep the sky clean.',
        raw: 'Shoot in RAW format to easily adjust white balance and recover shadow details later.',
        foreground: 'With wide-angle lenses, find an interesting foreground to add depth to your composition.',
      }
    },
    sections: {
      sunPlannerAction: 'Open full timeline',
      exposureLabAction: 'Open Exposure Lab',
      calculatorShortcuts: 'Calculator shortcuts',
      toolsTitle: 'Tools & Settings',
      toolsDescription: 'Fine-tune language, theme, and preferences.',
      languageShortcut: 'Switch the app language instantly.',
      themeShortcut: 'Toggle light, dark, or follow system.',
      settingsShortcut: 'Open settings and about information.',
    },
  },

  sunTimes: {
    title: 'Sunrise & Sunset Times',
    guide: {
      title: 'Light Phase Guide',
      astronomicalTwilight: {
        title: 'Astronomical Twilight',
        desc: 'The sky is very dark, and stars are visible. This is the best time for astrophotography. Only faint light on the horizon.',
      },
      nauticalTwilight: {
        title: 'Nautical Twilight',
        desc: 'The horizon is visible. Sailors used this time for navigation. The sky takes on a deep blue hue, and city lights start to turn on.',
      },
      civilTwilight: {
        title: 'Civil Twilight',
        desc: 'The sun is below the horizon, but there is enough light for outdoor activities. The sky is colorful, great for cityscapes.',
      },
      blueHour: {
        title: 'Blue Hour',
        desc: 'A brief period before sunrise or after sunset when the sky is deep blue. Perfect for city nightscapes and architecture with strong color contrast.',
      },
      goldenHour: {
        title: 'Golden Hour',
        desc: 'Shortly after sunrise or before sunset. The light is soft, warm, and golden. Ideal for portraits and landscapes with soft shadows.',
      },
      information: {
        title: 'Types of Twilight',
        desc: 'There are three types of twilight: civil, nautical, and astronomical. They occur in sequence and happen in the same order everywhere on Earth. The type of twilight depends on the angle of the sun\'s center below the horizon:\n\nCivil twilight: 0° to 6°\nNautical twilight: 6° to 12°\nAstronomical twilight: 12° to 18°\n\nThe period when the sun is more than 18° below the horizon (after astronomical twilight) is called "night" or "complete darkness".',
      },
    },
    searchPlaceholder: 'Search location (Multi-language)',
    refreshLocation: 'Refresh Current Location',
    selectDate: 'Select Date',

    // Phase names
    phases: {
      astronomicalTwilightBegin: 'Astronomical Twilight Begin',
      nauticalTwilightBegin: 'Nautical Twilight Begin',
      civilTwilightBegin: 'Civil Twilight Begin',
      morningBlueHourStart: 'Blue Hour Start',
      morningBlueHourEnd: 'Blue Hour End',
      morningBlueHour: 'Morning Blue Hour',
      sunrise: 'Sunrise',
      morningGoldenHourStart: 'Golden Hour Start',
      morningGoldenHourEnd: 'Golden Hour End',
      morningGoldenHour: 'Morning Golden Hour',
      solarNoon: 'Solar Noon',
      eveningGoldenHourStart: 'Golden Hour Start',
      eveningGoldenHourEnd: 'Golden Hour End',
      eveningGoldenHour: 'Evening Golden Hour',
      sunset: 'Sunset',
      eveningBlueHourStart: 'Blue Hour Start',
      eveningBlueHourEnd: 'Blue Hour End',
      eveningBlueHour: 'Evening Blue Hour',
      civilTwilightEnd: 'Civil Twilight End',
      nauticalTwilightEnd: 'Nautical Twilight End',
      astronomicalTwilightEnd: 'Astronomical Twilight End',
      daylight: 'Daylight',
      night: 'Night',
    },

    // Section labels
    morning: 'Morning',
    daytime: 'Daytime',
    evening: 'Evening',

    // Other information
    otherInfo: 'Other Information',
    solarNoonLabel: 'Solar Noon',
    dayLengthLabel: 'Day Length',

    // Error messages
    errorTitle: 'Error',
    errorMessage: 'Failed to fetch sunrise and sunset times',
    unknownError: 'Unknown error',

    // Current phase card
    currentPhase: {
      distanceTo: '{{time}} until {{phase}}',
      tomorrows: "Tomorrow's ",
    },

    // Time format
    timeFormat: {
      hours: '{{count}} hour',
      hours_plural: '{{count}} hours',
      minutes: '{{count}} minute',
      minutes_plural: '{{count}} minutes',
      hoursMinutes: '{{hours}} hours {{minutes}} minutes',
    },
  },

  calculator: {
    title: 'Photography Calculators',
    evTitle: 'EV Calculator',
    ndTitle: 'ND Filter',
    dofTitle: 'DoF',

    ev: {
      title: 'EV Exposure Calculator',
      description: 'Adjust aperture, shutter speed, and ISO while maintaining exposure',
      baseExposure: 'Base Exposure',
      adjustExposure: 'Adjust Exposure',
      aperture: 'Aperture',
      shutter: 'Shutter',
      iso: 'ISO',
      lockParam: 'Lock Parameter',
      calculate: 'Calculate Equivalent Exposure',
      resetToCurrent: 'Reset to Current',
      selectScene: 'Select Scene',
      scenes: {
        ev16: 'Snow / Sand (Bright Sun)',
        ev15: 'Bright Sunny (Sunny 16 Rule)',
        ev14: 'Hazy Sun / Soft Shadows',
        ev13: 'Cloudy / Bright Overcast',
        ev12: 'Overcast / Sunrise / Sunset',
        ev11: 'Deep Shade / Twilight',
        ev10: 'After Sunset / Stormy',
        ev9: 'Blue Hour / Bright Night Street',
        ev8: 'City Night / Bonfire',
        ev7: 'Indoor Artificial Light',
        ev6: 'Home Interior / Night Market',
        ev5: 'Bright Street Light',
        ev4: 'Candlelight / Christmas Lights',
        ev3: 'Moonlit Landscape',
        ev2: 'Distant Lights / Lightning',
        ev1: 'Distant Skyline',
        ev0: 'Very Dark / Starlight Only',
        evMinus1: 'Milky Way / Aurora (High ISO)',
        evMinus2: 'Deep Sky Astrophotography',
        evMinus3: 'Total Darkness',
        evMinus4: 'Moonless Night Landscape',
        evMinus5: 'Extremely Dark Environment',
        evMinus6: 'Long Exposure Art',
      },
    },

    nd: {
      title: 'ND Filter Calculator',
      description: 'Calculate shutter speed with ND filter, built-in timer',
      originalShutter: 'Original Shutter Speed',
      originalShutterHint: '(Metered value without ND filter)',
      ndStrength: 'ND Filter Strength',
      stops: 'stops',
      newShutter: 'New Shutter Speed',
      calculate: 'Calculate',
      startTimer: 'Start Timer',
      stopTimer: 'Stop Timer',
      resetTimer: 'Reset',
      timerTitle: 'Exposure Timer',
      ready: 'Ready',
      exposing: 'Exposing...',
      complete: 'Exposure Complete!',
    },

    dof: {
      title: 'Depth of Field Calculator',
      description: 'Calculate focus range and hyperfocal distance for precise depth control',
      focalLength: 'Focal Length',
      focalLengthUnit: 'mm',
      aperture: 'Aperture',
      focusDistance: 'Focus Distance',
      focusDistanceUnit: 'meters',
      sensorSize: 'Sensor Size',
      sensors: {
        fullFrame: 'Full Frame',
        apscCanon: 'APS-C (Canon)',
        apscNikonSony: 'APS-C (Nikon/Sony)',
        m43: 'M4/3 (Micro Four Thirds)',
        oneInch: '1" (CX)',
      },
      calculate: 'Calculate DoF',
      results: 'Results',
      totalDof: 'Total DoF',
      nearLimit: 'Near Limit',
      farLimit: 'Far Limit',
      hyperfocal: 'Hyperfocal Distance',
      hyperfocalDesc: 'Focus at this distance to achieve sharpness from half the hyperfocal distance to infinity',
      tips: 'Tips',
      portraitTip: 'Portrait Photography',
      portraitDesc: 'Use wide aperture (e.g., f/1.8) for shallow depth and background blur',
      landscapeTip: 'Landscape Photography',
      landscapeDesc: 'Use narrow aperture (e.g., f/11), focus at hyperfocal distance for sharp foreground to background',
      streetTip: 'Street Photography',
      streetDesc: 'Use moderate aperture (e.g., f/5.6) to balance depth of field and shutter speed',
    },

    exposureLab: {
      title: 'Exposure Lab',
      subtitle: 'Long exposure workflow for ND filters, reciprocity, and the bulb timer.',
      currentEv: 'Metered EV',
      evHelper: 'Lock one parameter and adjust the others to stay on the same exposure.',
      baseSettings: 'Metered settings',
      sceneShortcuts: 'Scene presets',
      sceneHint: 'Start from a typical blue-hour exposure with one tap.',
      ndSection: 'ND filter (optional)',
      ndHint: 'Add ND when you want slow shutter effects under bright light.',
      ndNone: 'No ND filter',
      reciprocitySection: 'Film reciprocity profiles',
      reciprocity: {
        digital: 'Digital / No correction',
        digitalDescription: 'Use this when shooting digital or modern sensors.',
        digitalHint: 'Exposure time stays the same.',
        
        // Foma
        foma100: 'Fomapan 100 Classic',
        foma100Description: 'Severe reciprocity failure, compensate above 1s.',
        foma100Hint: '1s becomes 3s, 10s becomes 80s!',
        
        foma200: 'Fomapan 200 Creative',
        foma200Description: 'Flat grain tech, slightly better than 100/400.',
        foma200Hint: '1s becomes 3s, 10s becomes 60s.',
        
        foma400: 'Fomapan 400 Action',
        foma400Description: 'Severe reciprocity failure, similar to Foma 100.',
        foma400Hint: '1s becomes 3s, 10s becomes 80s!',

        // Kodak Motion Picture
        kodak_50d: 'Kodak Vision3 50D (5203)',
        kodak_50dDescription: 'Daylight balanced, extremely fine grain.',
        kodak_50dHint: 'Same as Cinestill 50D, 10s needs ~13s.',

        kodak_250d: 'Kodak Vision3 250D (5207)',
        kodak_250dDescription: 'Daylight balanced, versatile speed.',
        kodak_250dHint: 'High latitude, 10s needs ~13s.',

        kodak_500t: 'Kodak Vision3 500T (5219)',
        kodak_500tDescription: 'Tungsten balanced, king of night scenes.',
        kodak_500tHint: 'Same as Cinestill 800T, 10s needs ~13s.',

        // Color Negative
        kodak_portra: 'Kodak Portra 160/400',
        kodak_portraDescription: 'High latitude, mild correction needed above 2s.',
        kodak_portraHint: 'Better to overexpose than underexpose.',
        
        kodak_gold: 'Kodak Gold/Ultramax',
        kodak_goldDescription: 'Consumer film, suggest slightly more compensation.',
        kodak_goldHint: 'Watch for color shifts in long exposures.',
        
        fuji_superia: 'Fuji Superia/Pro 400H',
        fuji_superiaDescription: 'Fuji films, potential green/magenta shift.',
        fuji_superiaHint: '4s +1/3 stop, 16s +2/3 stop.',
        
        cinestill_800t: 'Cinestill 800T/50D',
        cinestill_800tDescription: 'Based on cinema film, unique halation.',
        cinestill_800tHint: 'Noticeable reciprocity failure.',
        
        lomo_cn: 'Lomography CN 400/800',
        lomo_cnDescription: 'Coarser grain, give generous exposure.',
        lomo_cnHint: 'Similar to older Kodak emulsions.',
        
        // B&W
        kodak_trix: 'Kodak Tri-X 400',
        kodak_trixDescription: 'Classic B&W, significant reciprocity failure.',
        kodak_trixHint: '10s metered needs ~50s exposure.',
        
        kodak_tmax100: 'Kodak T-Max 100',
        kodak_tmax100Description: 'Excellent reciprocity characteristics.',
        kodak_tmax100Hint: 'Close to Acros, 10s needs only 12s.',
        
        kodak_tmax400: 'Kodak T-Max 400',
        kodak_tmax400Description: 'Good reciprocity characteristics.',
        kodak_tmax400Hint: '10s metered needs ~18s exposure.',
        
        ilford_hp5: 'Ilford HP5 Plus',
        ilford_hp5Description: 'Classic B&W, standard reciprocity.',
        ilford_hp5Hint: '10s metered needs ~20s exposure.',
        
        ilford_fp4: 'Ilford FP4 Plus',
        ilford_fp4Description: 'Medium speed, stable performance.',
        ilford_fp4Hint: '10s metered needs ~18s exposure.',
        
        ilford_delta100: 'Ilford Delta 100',
        ilford_delta100Description: 'Fine grain, stable performance.',
        ilford_delta100Hint: '10s metered needs ~18s exposure.',
        
        ilford_delta400: 'Ilford Delta 400',
        ilford_delta400Description: 'High speed fine grain, faster failure.',
        ilford_delta400Hint: '10s metered needs ~25s exposure.',
        
        ilford_delta3200: 'Ilford Delta 3200',
        ilford_delta3200Description: 'Ultra high speed, needs significant compensation.',
        ilford_delta3200Hint: '10s metered needs ~21s exposure.',
        
        ilford_panf: 'Ilford Pan F Plus',
        ilford_panfDescription: 'Low speed, fine detail.',
        ilford_panfHint: '10s metered needs ~21s exposure.',
        
        ilford_xp2: 'Ilford XP2 Super',
        ilford_xp2Description: 'C-41 process B&W film.',
        ilford_xp2Hint: '10s metered needs ~20s exposure.',
        
        ilford_sfx: 'Ilford SFX 200',
        ilford_sfxDescription: 'Extended red sensitivity.',
        ilford_sfxHint: '10s metered needs ~27s exposure.',
        
        fuji_acros: 'Fuji Neopan Acros II',
        fuji_acrosDescription: 'Reciprocity King, no compensation under 120s.',
        fuji_acrosHint: 'Best choice for B&W long exposure.',
        
        // Slide
        kodak_e100: 'Kodak Ektachrome E100',
        kodak_e100Description: 'Modern slide film, excellent performance.',
        kodak_e100Hint: '10s +1/3 stop.',
        
        fuji_velvia50: 'Fuji Velvia 50',
        fuji_velvia50Description: 'Poor reciprocity, avoid for long exposures.',
        fuji_velvia50Hint: 'Significant compensation needed above 4s.',
        
        fuji_provia100f: 'Fuji Provia 100F',
        fuji_provia100fDescription: 'Best slide film for long exposure.',
        fuji_provia100fHint: 'No compensation needed up to 128s!',
      },
      resultTitle: 'Long exposure result',
      resultBase: 'Metered shutter',
      resultNd: 'After ND filter',
      resultReciprocity: 'After reciprocity',
      timerTitle: 'Bulb timer',
      startTimer: 'Start timer',
      stopTimer: 'Stop timer',
      timerDone: 'Exposure complete',
      start: 'Start',
      stop: 'Stop',
      timer: {
        countdown: 'Countdown',
        bulb: 'Bulb Timer',
      },
    },
  },

  settings: {
    title: 'Settings',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    aboutApp: 'About App',
    appearance: 'Appearance',
    appearanceDescription: 'Choose your preferred theme mode',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeAuto: 'Follow System',
    themeLightDesc: 'Bright and fresh interface, suitable for daytime',
    themeDarkDesc: 'Eye-friendly dark interface, perfect for nighttime',
    themeAutoDesc: 'Automatically switch between light and dark modes',
    selectLanguageDesc: 'Choose your preferred language',
    selectThemeDesc: 'Choose your preferred theme mode',
    currentLanguage: 'Current Language',
    currentTheme: 'Current Theme',
    about: 'About',
    aboutDescription: 'App information and features',
    appName: 'BlueHour - Photography Assistant',
    version: 'Version',
    description: 'A tool app designed for photography enthusiasts to help you plan perfect shooting times and easily calculate exposure parameters, ND filters, and depth of field.',
    features: 'Features',
    support: 'Support',

    featureList: {
      blueHour: {
        title: 'Blue Hour Planner',
        description: 'Get precise times for golden hour and blue hour',
      },
      exposureLab: {
        title: 'Exposure Lab',
        description: 'One tap workflow for EV, ND, reciprocity and the bulb timer',
      },
    },

    languages: {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      de: 'Deutsch',
    },

    dataSource: 'Data Source',
    dataSourceText: 'Sunrise and sunset data provided by sunrise-sunset.org API',
    feedbackSupport: 'Feedback & Support',
    github: 'GitHub',
    contactSupport: 'Contact Support',
    copyright: '© 2025 BlueHour Photography Tools',
    madeWithLove: 'Made with ❤️ for photographers',
  },
  exposureLabHelp: {
    title: 'Exposure Lab - Feature Guide',
    section1: {
      title: '1. Basic Exposure Parameters',
      content: [
        'Aperture, Shutter, ISO: Freely adjust the three pillars of exposure.',
        'Smart Lock: Tap the lock icon next to a parameter to lock it. When adjusting other values, the system automatically calculates the unlocked parameter to maintain Exposure Value (EV) balance.',
        'EV Lock: Lock the current Exposure Value (EV). Adjusting any parameter will automatically update the others to match.',
      ],
    },
    section2: {
      title: '2. Scene EV Reference',
      content: [
        'Provides references for various lighting conditions, from bright daylight to very dark environments (e.g., sunny, overcast, night scenes, starry sky).',
        'Tap a scene card to directly set its EV as the target value.',
      ],
    },
    section3: {
      title: '3. ND Filter Calculation',
      content: [
        'Simulates the effect of attaching an ND (Neutral Density) filter.',
        'Select different ND strengths (e.g., ND8, ND1000), and the system automatically calculates the equivalent shutter speed.',
      ],
    },
    section4: {
      title: '4. Reciprocity Failure Compensation',
      content: [
        'Designed for film photography.',
        'Select a film stock preset, and the system calculates the necessary exposure compensation for long exposures due to reciprocity failure.',
      ],
    },
    section5: {
      title: '5. Exposure Timer',
      content: [
        'Provides a countdown timer based on the final calculated exposure time (including ND and reciprocity adjustments), useful for long exposure shots.',
      ],
    },
  },
};
