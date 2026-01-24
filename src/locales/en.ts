// English translations
export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
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
    greeting: 'Blue Hour',
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
    advice: {
      sectionTitle: 'Photography Tips',
      currentLight: 'What to Do in Current Light',
      default: {
        title1: 'Explore Creative Options',
        desc1: 'Light is always changing. Try different exposure combinations.',
        title2: 'Prepare Your Gear',
        desc2: 'Check battery levels, clear your memory cards, and ensure everything is ready.',
      },
      day: {
        title1: 'Scout for Compositions',
        desc1: 'Harsh light is perfect for finding angles. Plan your spot for tonight.',
        title2: 'Test Different Angles',
        desc2: 'Use the abundant daylight to find the best shooting angles and foreground elements.',
        title3: 'Observe Light Changes',
        desc3: 'Notice shadow direction and intensity to predict evening light effects.',
      },
      blue: {
        title1: 'Balance City Lights',
        desc1: 'Sky and artificial lights are equal brightness. Watch your highlights.',
        title2: 'Shoot Urban Nightscapes',
        desc2: 'This is the golden time for city skylines with rich blue tones in the sky.',
        title3: 'Use Bracketing',
        desc3: 'Bracket exposures for sky and ground separately for better post-processing.',
      },
      night: {
        title1: 'Try Light Painting',
        desc1: 'Use the darkness for creative light painting or star trails.',
        title2: 'Capture the Milky Way',
        desc2: 'Get away from light pollution, use wide aperture lenses and high ISO for stars.',
        title3: 'Record Traffic Trails',
        desc3: 'Use bulb mode or long exposures to capture traffic light trails for dynamic effects.',
      },
    },
    timeline: {
      title: 'Light timeline (today)',
      detail: 'Details',
    },
    features: {
      sunTimeline: {
        title: 'Blue Hour Planner',
        description: 'See golden hour, blue hour, and twilight for your location.',
      },
      exposureLab: {
        title: 'Exposure Lab', // Legacy
        description: 'One workflow for EV tuning, ND math, reciprocity and timer.',
      },
      exposureCalc: {
        title: 'Exposure Calculator',
        description: 'Calculate exposure & ND filters.',
      },
      reciprocityCalc: {
        title: 'Reciprocity Calculator',
        description: 'Film reciprocity failure correction.',
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
    intro: {
      title: 'About BlueHour',
      description: 'BlueHour is a golden hour and blue hour tool designed specifically for photography enthusiasts. Whether you\'re just starting out or you\'re a seasoned photographer, we help you capture the most beautiful light moments of the day.',
      featuresTitle: 'Main Features:',
      feature1Title: 'Golden & Blue Hour Timeline',
      feature1Desc: 'Accurately displays sunrise, sunset, golden hour, and blue hour times for your location. Plan your shoots in advance and never miss the magic moment.',
      feature2Title: 'Exposure Calculator',
      feature2Desc: 'Smart calculator helps you handle complex exposure parameters. Supports equivalent exposure calculation, ND filter calculation, and provides EV reference values for common scenes.',
      feature3Title: 'Reciprocity Calculator',
      feature3Desc: 'Designed for film photographers. Automatically calculates reciprocity failure compensation for different film stocks during long exposures, with a built-in exposure timer.',
      footer: 'Tap the navigation bar to explore more features and start your photography journey!',
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
      title: 'Exposure Calculator',
      subtitle: 'Long exposure workflow for ND filters, reciprocity, and the bulb timer.',
      currentEv: 'Metered EV',
      evHelper: 'Lock one parameter and adjust the others to stay on the same exposure.',
      baseSettings: 'Metered settings',
      sceneShortcuts: 'Scene presets',
      sceneValues: 'Scene Preset',
      sceneHint: 'Start from a typical blue-hour exposure with one tap.',
      ndSection: 'ND filter (optional)',
      ndHint: 'Add ND when you want slow shutter effects under bright light.',
      ndNone: 'No ND filter',
      noScene: 'No Scene',
      aperture: 'Aperture',
      shutter: 'Shutter',
      iso: 'ISO',
      lock: 'Lock',
      unlock: 'Unlock',
      resultNd: 'Shutter w/ ND',
      reciprocitySection: 'Film reciprocity profiles',
      reciprocity: {
        filmProfile: 'Film Profile',
        selectFilm: 'Select film',
        meteredShutter: 'Metered Shutter Speed',
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
        kodak_portra160: 'Kodak Portra 160',
        kodak_portra160Description: 'Neutral tones, gentle reciprocity correction.',
        kodak_portra160Hint: 'Use this profile for Portra 160.',

        kodak_portra400: 'Kodak Portra 400',
        kodak_portra400Description: 'High latitude, stable color in long exposures.',
        kodak_portra400Hint: 'Use this profile for Portra 400.',

        kodak_portra800: 'Kodak Portra 800',
        kodak_portra800Description: 'Fast speed, moderate correction needed.',
        kodak_portra800Hint: 'Use this profile for Portra 800.',

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

        fuji_astia100f: 'Fujichrome Astia 100F',
        fuji_astia100fDescription: 'Soft tones, moderate reciprocity compensation.',
        fuji_astia100fHint: 'Use for Astia 100F.',

        fuji_provia400x: 'Fujichrome Provia 400X',
        fuji_provia400xDescription: 'High-speed slide film, needs compensation in long exposures.',
        fuji_provia400xHint: 'Use for Provia 400X.',

        fuji_sensia200: 'Fujichrome Sensia 200',
        fuji_sensia200Description: 'Consumer slide film, noticeable reciprocity failure.',
        fuji_sensia200Hint: 'Use for Sensia 200.',

        fuji_64t: 'Fujichrome 64T',
        fuji_64tDescription: 'Tungsten-balanced slide film, compensate in long exposures.',
        fuji_64tHint: 'Use for 64T.',

        fuji_t64: 'Fujichrome T64',
        fuji_t64Description: 'Tungsten-balanced slide film, compensate in long exposures.',
        fuji_t64Hint: 'Use for T64.',
        
        fuji_velvia50: 'Fuji Velvia 50',
        fuji_velvia50Description: 'Poor reciprocity, avoid for long exposures.',
        fuji_velvia50Hint: 'Significant compensation needed above 4s.',
        
        fuji_provia100f: 'Fuji Provia 100F',
        fuji_provia100fDescription: 'Best slide film for long exposure.',
        fuji_provia100fHint: 'No compensation needed up to 128s!',

        kodak_ektar100: 'Kodak Ektar 100',
        kodak_ektar100Description: 'Reciprocity profile for Kodak Ektar 100.',
        kodak_ektar100Hint: 'Select this for Kodak Ektar 100.',

        fuji_superia200: 'Fuji Superia 200',
        fuji_superia200Description: 'Reciprocity profile for Fuji Superia 200.',
        fuji_superia200Hint: 'Select this for Fuji Superia 200.',

        fuji_superia1600: 'Fuji Superia 1600',
        fuji_superia1600Description: 'Reciprocity profile for Fuji Superia 1600.',
        fuji_superia1600Hint: 'Select this for Fuji Superia 1600.',

        fuji_c200: 'Fuji C200',
        fuji_c200Description: 'Reciprocity profile for Fuji C200.',
        fuji_c200Hint: 'Select this for Fuji C200.',

        fuji_color100: 'Fuji Color 100',
        fuji_color100Description: 'Reciprocity profile for Fuji Color 100.',
        fuji_color100Hint: 'Select this for Fuji Color 100.',

        fuji_pro160c: 'Fuji Pro 160C',
        fuji_pro160cDescription: 'Reciprocity profile for Fuji Pro 160C.',
        fuji_pro160cHint: 'Select this for Fuji Pro 160C.',

        fuji_pro160ns: 'Fuji Pro 160NS',
        fuji_pro160nsDescription: 'Reciprocity profile for Fuji Pro 160NS.',
        fuji_pro160nsHint: 'Select this for Fuji Pro 160NS.',

        fuji_xtra400: 'Fuji X-TRA 400',
        fuji_xtra400Description: 'Reciprocity profile for Fuji X-TRA 400.',
        fuji_xtra400Hint: 'Select this for Fuji X-TRA 400.',

        fuji_nexia400: 'Fuji Nexia 400',
        fuji_nexia400Description: 'Reciprocity profile for Fuji Nexia 400.',
        fuji_nexia400Hint: 'Select this for Fuji Nexia 400.',

        holga400: 'Holga 400',
        holga400Description: 'Reciprocity profile for Holga 400.',
        holga400Hint: 'Select this for Holga 400.',

        kodak_trix320: 'Kodak Tri-X 320',
        kodak_trix320Description: 'Reciprocity profile for Kodak Tri-X 320.',
        kodak_trix320Hint: 'Select this for Kodak Tri-X 320.',

        kodak_tmax3200: 'Kodak T-Max 3200',
        kodak_tmax3200Description: 'Reciprocity profile for Kodak T-Max 3200.',
        kodak_tmax3200Hint: 'Select this for Kodak T-Max 3200.',

        ilford_kentmere100: 'Kentmere 100',
        ilford_kentmere100Description: 'Reciprocity profile for Kentmere 100.',
        ilford_kentmere100Hint: 'Select this for Kentmere 100.',

        ilford_kentmere400: 'Kentmere 400',
        ilford_kentmere400Description: 'Reciprocity profile for Kentmere 400.',
        ilford_kentmere400Hint: 'Select this for Kentmere 400.',

        shanghai_gp3: 'Shanghai GP3',
        shanghai_gp3Description: 'Reciprocity profile for Shanghai GP3.',
        shanghai_gp3Hint: 'Select this for Shanghai GP3.',

        lomo_potsdam100: 'Lomo Potsdam 100',
        lomo_potsdam100Description: 'Reciprocity profile for Lomo Potsdam 100.',
        lomo_potsdam100Hint: 'Select this for Lomo Potsdam 100.',

        fuji_velvia100: 'Fujichrome Velvia 100',
        fuji_velvia100Description: 'Reciprocity profile for Fujichrome Velvia 100.',
        fuji_velvia100Hint: 'Select this for Fujichrome Velvia 100.',

        fuji_velvia100f: 'Fujichrome Velvia 100F',
        fuji_velvia100fDescription: 'Reciprocity profile for Fujichrome Velvia 100F.',
        fuji_velvia100fHint: 'Select this for Fujichrome Velvia 100F.',

        fuji_pro400h: 'Fuji Pro 400H',
        fuji_pro400hDescription: 'Reciprocity profile for Fuji Pro 400H.',
        fuji_pro400hHint: 'Select this for Fuji Pro 400H.',
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
      willAdjust: 'Will auto-adjust',
      preset: 'Camera Preset',
      noPreset: 'No Preset',
      noScene: 'No Scene',
    },
  },

  reciprocity: {
    title: 'Reciprocity Calculator',
    filmProfile: 'Film Profile',
    selectFilm: 'Select film',
    meteredShutter: 'Metered Shutter Speed',
    resultBase: 'Base Shutter',
    resultReciprocity: 'Corrected',
    timerTitle: 'Bulb Timer',
    startTimer: 'Start Timer',
    stopTimer: 'Stop Timer',
    timerDone: 'Done',
  },

  settings: {
    title: 'Settings',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    aboutApp: 'About App',
    notifications: {
      title: 'Photo Reminders',
      enableTitle: 'Golden Hour Reminder',
      enableDescription: 'Remind you 30 minutes before golden hour',
      permissionTitle: 'Notification Permission Required',
      permissionMessage: 'Please allow notification permission in system settings to receive photo reminders',
    },
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

    userPresets: {
      title: 'User Presets',
      createNew: 'Create New Preset',
      editPreset: 'Edit Preset',
      empty: 'No presets yet. Create one to quickly configure your gear.',
      active: 'Active',
      activate: 'Activate',
      deactivate: 'Deactivate',
      presetName: 'Preset Name',
      presetNamePlaceholder: 'e.g. Landscape Kit',
      camera: 'Camera',
      cameraPlaceholder: 'e.g. Nikon Z6 II',
      lens: 'Lens',
      lensPlaceholder: 'e.g. 24-70mm f/2.8',
      useFilm: 'Use Film',
      selectFilm: 'Select Film',
      currentPreset: 'Active Preset',
      noActivePreset: 'No Preset Active',
      manage: 'Manage',
    },
  },
  reciprocityHelp: {
    title: 'Reciprocity Calculator - Guide',
    description: 'The Reciprocity Calculator is designed for film photography to help you compensate for reciprocity failure during long exposures. When exposure times exceed 1 second, film sensitivity decreases, requiring extended exposure times to achieve correct exposure.',
    section1: {
      title: 'What is Reciprocity Failure?',
      content: [
        'Reciprocity Law states: Exposure = Light Intensity × Time',
        'In theory, reducing intensity and extending time should produce identical exposure',
        'However, during long exposures (typically >1s), film sensitivity decreases',
        'This phenomenon is called "Reciprocity Failure" and requires additional exposure time compensation',
      ],
    },
    section2: {
      title: 'How to Use the Calculator?',
      content: [
        '1. Select your film stock (different films have different reciprocity characteristics)',
        '2. Enter the metered shutter speed (initial exposure time)',
        '3. The calculator automatically displays the corrected exposure time',
        '4. Use the built-in bulb timer to precisely control your exposure',
      ],
    },
    section3: {
      title: 'Practical Tips',
      content: [
        'Digital Cameras: Almost unaffected by reciprocity failure, no compensation needed',
        'Film Variations: Black & white and color negative films have significantly different characteristics',
        'Extreme Cases: Some films may require several times the compensation for ultra-long exposures',
        'Rule of Thumb: At 1s metered exposure, compensation is minimal; beyond 10s, compensation increases significantly',
      ],
    },
  },

  exposureLabHelp: {
    title: 'Exposure Lab - Feature Guide',
    description: 'Exposure Lab is a powerful photography calculation tool that integrates exposure parameter adjustment, scene EV reference, ND filter calculation, reciprocity failure compensation, and exposure timer. It helps you precisely control exposure, especially for long exposure photography.',
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
