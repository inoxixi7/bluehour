// Deutsche Übersetzungen
export default {
  common: {
    loading: 'Lädt...',
    loadingPhase: 'Lädt...',
    fetchingPhaseInfo: 'Aktuelle Phaseninformationen werden abgerufen',
    error: 'Fehler',
    retry: 'Wiederholen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern',
    delete: 'Löschen',
    noResults: 'Keine passenden Orte gefunden',
    select: 'Auswählen',
    evValue: 'Belichtungswert',
    environment: 'Umgebung',
    exposureConditions: {
      veryDark: 'Sehr dunkel',
      lowLight: 'Schwaches Licht',
      indoor: 'Innenbereich',
      overcast: 'Bewölkt',
      shadedSunny: 'Schattig/Sonnig',
      sunny: 'Hell sonnig',
      veryBright: 'Sehr hell',
    },
    units: {
      second: 's',
      seconds: 's',
      sec: 's',
      minute: 'Min',
      minutes: 'Min',
      min: 'Min',
      hour: 'Std',
      hours: 'Std',
      cm: 'cm',
      m: 'm',
      year: '',
      month: '.',
      day: '.',
    },
  },
  
  locationSearch: {
    placeholder: 'Ort suchen',
    noResults: 'Keine passenden Orte gefunden',
  },
  
  navigation: {
    home: 'Startseite',
    sunTimes: 'Blaue Stunde',
    calculator: 'Rechner',
    settings: 'Einstellungen',
  },
  
  home: {
    title: 'BlueHour',
    subtitle: 'Fotografie-Assistenten-Toolkit',
    features: {
      sunTimes: {
        title: 'Blaue Stunde',
        description: 'Sonnenaufgang, Sonnenuntergang, Goldene und Blaue Stunde',
      },
      evCalculator: {
        title: 'EV Belichtung',
        description: 'Berechnen Sie äquivalente Belichtungskombinationen',
      },
      ndCalculator: {
        title: 'ND-Filter',
        description: 'Berechnen Sie die Verschlusszeit für Langzeitbelichtungen',
      },
      dofCalculator: {
        title: 'Schärfentiefe',
        description: 'Berechnen Sie Schärfentiefe und hyperfokale Distanz',
      },
      settings: {
        title: 'Einstellungen',
        description: 'Personalisieren Sie Ihr App-Erlebnis',
      },
    },
    sections: {
      sunPlannerAction: 'Komplette Timeline öffnen',
      exposureLabAction: 'Exposure Lab öffnen',
      calculatorShortcuts: 'Rechner-Schnellzugriff',
      toolsTitle: 'Tools & Einstellungen',
      toolsDescription: 'Sprache, Design und App-Infos schnell anpassen.',
      languageShortcut: 'App-Sprache sofort umschalten.',
      themeShortcut: 'Hell, dunkel oder System folgen.',
      settingsShortcut: 'Einstellungen und Infos öffnen.',
    },
  },
  
  sunTimes: {
    title: 'Sonnenaufgang & Sonnenuntergang',
    searchPlaceholder: 'Ort suchen (Mehrsprachig)',
    refreshLocation: 'Aktuellen Standort aktualisieren',
    selectDate: 'Datum auswählen',
    
    // Phasennamen
    phases: {
      astronomicalTwilightBegin: 'Astronomische Dämmerung Beginn',
      nauticalTwilightBegin: 'Nautische Dämmerung Beginn',
      civilTwilightBegin: 'Bürgerliche Dämmerung Beginn',
      morningBlueHourStart: 'Blaue Stunde Beginn',
      morningBlueHourEnd: 'Blaue Stunde Ende',
      morningBlueHour: 'Morgendliche Blaue Stunde',
      sunrise: 'Sonnenaufgang',
      morningGoldenHourStart: 'Goldene Stunde Beginn',
      morningGoldenHourEnd: 'Goldene Stunde Ende',
      morningGoldenHour: 'Morgendliche Goldene Stunde',
      solarNoon: 'Sonnenmittag',
      eveningGoldenHourStart: 'Goldene Stunde Beginn',
      eveningGoldenHourEnd: 'Goldene Stunde Ende',
      eveningGoldenHour: 'Abendliche Goldene Stunde',
      sunset: 'Sonnenuntergang',
      eveningBlueHourStart: 'Blaue Stunde Beginn',
      eveningBlueHourEnd: 'Blaue Stunde Ende',
      eveningBlueHour: 'Abendliche Blaue Stunde',
      civilTwilightEnd: 'Bürgerliche Dämmerung Ende',
      nauticalTwilightEnd: 'Nautische Dämmerung Ende',
      astronomicalTwilightEnd: 'Astronomische Dämmerung Ende',
      daylight: 'Tageslicht',
      night: 'Nacht',
    },
    
    // Abschnittsbezeichnungen
    morning: 'Morgen',
    daytime: 'Tag',
    evening: 'Abend',
    
    // Weitere Informationen
    otherInfo: 'Weitere Informationen',
    solarNoonLabel: 'Sonnenmittag',
    dayLengthLabel: 'Tageslänge',
    
    // Fehlermeldungen
    errorTitle: 'Fehler',
    errorMessage: 'Fehler beim Abrufen der Sonnenauf- und -untergangszeiten',
    unknownError: 'Unbekannter Fehler',
    
    // Aktuelle Phasenkarte
    currentPhase: {
      distanceTo: 'Noch {{time}} bis {{phase}}',
      tomorrows: 'Morgen ',
    },
    
    // Zeitformat
    timeFormat: {
      hours: '{{count}} Stunde',
      hours_plural: '{{count}} Stunden',
      minutes: '{{count}} Minute',
      minutes_plural: '{{count}} Minuten',
      hoursMinutes: '{{hours}} Stunden {{minutes}} Minuten',
    },
  },
  
  calculator: {
    title: 'Fotografie-Rechner',
    evTitle: 'EV-Rechner',
    ndTitle: 'ND-Filter',
    dofTitle: 'Schärfentiefe',
    
    // EV-Rechner
    ev: {
      title: 'EV-Belichtungsrechner',
      description: 'Blende, Verschlusszeit und ISO anpassen bei gleichbleibender Belichtung',
      baseExposure: 'Basisbelichtung',
      adjustExposure: 'Belichtung anpassen',
      aperture: 'Blende',
      shutter: 'Verschlusszeit',
      iso: 'ISO',
      lockParam: 'Parameter sperren',
      calculate: 'Äquivalente Belichtung berechnen',
      resetToCurrent: 'Auf aktuellen Wert zurücksetzen',
    },
    
    // ND-Filter-Rechner
    nd: {
      title: 'ND-Filter-Rechner',
      description: 'Verschlusszeit mit ND-Filter berechnen, integrierter Timer',
      originalShutter: 'Ursprüngliche Verschlusszeit',
      originalShutterHint: '(Messwert ohne ND-Filter)',
      ndStrength: 'ND-Filterstärke',
      stops: 'Blenden',
      newShutter: 'Neue Verschlusszeit',
      calculate: 'Berechnen',
      startTimer: 'Timer starten',
      stopTimer: 'Timer stoppen',
      resetTimer: 'Zurücksetzen',
      timerTitle: 'Belichtungs-Timer',
      ready: 'Bereit',
      exposing: 'Belichtung läuft...',
      complete: 'Belichtung abgeschlossen!',
    },
    
    // Schärfentiefe-Rechner
    dof: {
      title: 'Schärfentiefe-Rechner',
      description: 'Schärfebereich und hyperfokale Distanz für präzise Tiefenkontrolle berechnen',
      focalLength: 'Brennweite',
      focalLengthUnit: 'mm',
      aperture: 'Blende',
      focusDistance: 'Fokusdistanz',
      focusDistanceUnit: 'Meter',
      sensorSize: 'Sensorgröße',
      sensors: {
        fullFrame: 'Vollformat',
        apscCanon: 'APS-C (Canon)',
        apscNikonSony: 'APS-C (Nikon/Sony)',
        m43: 'M4/3 (Micro Four Thirds)',
        oneInch: '1" (CX)',
      },
      calculate: 'Schärfentiefe berechnen',
      results: 'Ergebnisse',
      totalDof: 'Gesamtschärfentiefe',
      nearLimit: 'Nahgrenze',
      farLimit: 'Ferngrenze',
      hyperfocal: 'Hyperfokaldistanz',
      hyperfocalDesc: 'Bei dieser Distanz fokussieren für Schärfe von der halben Hyperfokaldistanz bis unendlich',
      tips: 'Tipps',
      portraitTip: 'Porträtfotografie',
      portraitDesc: 'Offene Blende verwenden (z.B. f/1.8) für geringe Schärfentiefe und Hintergrundunschärfe',
      landscapeTip: 'Landschaftsfotografie',
      landscapeDesc: 'Geschlossene Blende verwenden (z.B. f/11), auf Hyperfokaldistanz fokussieren für Schärfe von Vorder- bis Hintergrund',
      streetTip: 'Streetfotografie',
      streetDesc: 'Mittlere Blende verwenden (z.B. f/5.6) für Balance zwischen Schärfentiefe und Verschlusszeit',
    },
  },
  
  settings: {
    title: 'Einstellungen',
    language: 'Sprache',
    theme: 'Design',
    appearance: 'Erscheinungsbild',
    appearanceDescription: 'Wählen Sie Ihren bevorzugten Designmodus',
    themeLight: 'Heller Modus',
    themeDark: 'Dunkler Modus',
    themeAuto: 'Systemeinstellung folgen',
    themeLightDesc: 'Helle und frische Oberfläche, geeignet für den Tag',
    themeDarkDesc: 'Augenfreundliche dunkle Oberfläche, perfekt für die Nacht',
    themeAutoDesc: 'Automatisch zwischen hellem und dunklem Modus wechseln',
    selectLanguageDesc: 'Wählen Sie Ihre bevorzugte Sprache',
    selectThemeDesc: 'Wählen Sie Ihren bevorzugten Designmodus',
    currentLanguage: 'Aktuelle Sprache',
    currentTheme: 'Aktuelles Design',
    about: 'Über die App',
    aboutDescription: 'App-Informationen und Funktionen',
    appName: 'BlueHour - Fotografie-Assistent',
    version: 'Version',
    description: 'Eine für Fotografie-Enthusiasten entwickelte Tool-App, die Ihnen hilft, perfekte Aufnahmezeiten zu planen und Belichtungsparameter, ND-Filter und Schärfentiefe einfach zu berechnen.',
    features: 'Funktionen',
    support: 'Support',
    
    featureList: {
      blueHour: {
        title: 'Blaue Stunde Planer',
        description: 'Präzise Zeiten für Goldene und Blaue Stunde erhalten',
      },
      evCalculator: {
        title: 'EV-Belichtungsrechner',
        description: 'Äquivalente Belichtungen berechnen, Blende, Verschluss und ISO frei anpassen',
      },
      ndFilter: {
        title: 'ND-Filter-Rechner',
        description: 'Präzise Berechnung der Verschlusszeit nach Verwendung von ND-Filtern',
      },
      dof: {
        title: 'Schärfentiefe-Rechner',
        description: 'Schärfentiefe-Bereich und hyperfokale Distanz berechnen',
      },
    },
    
    languages: {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      de: 'Deutsch',
    },
    
    dataSource: 'Datenquelle',
    dataSourceText: 'Sonnenaufgangs- und Sonnenuntergangsdaten bereitgestellt von sunrise-sunset.org API',
    feedbackSupport: 'Feedback & Support',
    github: 'GitHub',
    contactSupport: 'Support kontaktieren',
    copyright: '© 2025 BlueHour Photography Tools',
    madeWithLove: 'Mit ❤️ für Fotografen gemacht',
  },
};
