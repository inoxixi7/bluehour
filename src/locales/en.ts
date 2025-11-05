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
    calculator: 'Calculators',
    settings: 'Settings',
  },
  
  home: {
    title: 'BlueHour',
    subtitle: 'Photography Assistant Toolkit',
    features: {
      sunTimes: {
        title: 'Blue Hour',
        description: 'View sunrise, sunset, golden hour and blue hour',
      },
      evCalculator: {
        title: 'EV Exposure',
        description: 'Calculate equivalent exposure combinations',
      },
      ndCalculator: {
        title: 'ND Filter',
        description: 'Calculate long exposure shutter speed',
      },
      dofCalculator: {
        title: 'Depth of Field',
        description: 'Calculate depth of field and hyperfocal distance',
      },
      settings: {
        title: 'Settings',
        description: 'Personalize your app experience',
      },
    },
  },
  
  sunTimes: {
    title: 'Sunrise & Sunset Times',
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
    
    // EV Calculator
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
    },
    
    // ND Filter Calculator
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
    
    // Depth of Field Calculator
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
  },
  
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    appearance: 'Appearance',
    appearanceDescription: 'Choose your preferred theme mode',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeAuto: 'Follow System',
    about: 'About App',
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
      evCalculator: {
        title: 'EV Exposure Calculator',
        description: 'Calculate equivalent exposures, freely adjust aperture, shutter and ISO',
      },
      ndFilter: {
        title: 'ND Filter Calculator',
        description: 'Precisely calculate shutter speed after using ND filters',
      },
      dof: {
        title: 'Depth of Field Calculator',
        description: 'Calculate depth of field range and hyperfocal distance',
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
};
