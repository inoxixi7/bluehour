# BlueHour - Photography Companion 📷

[![Expo](https://img.shields.io/badge/Expo-Go-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.73-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BlueHour** is an all-in-one assistant designed for photographers. It helps you plan for the perfect "Golden Hour" and "Blue Hour" light, and provides a suite of professional calculators to handle complex shooting scenarios.

[English](README.md) | [日本語](README_ja.md) | [中文](README_zh.md)

---

## ✨ Key Features

### 🌅 Blue Hour Planner
Never miss the perfect light again.
- **Smart Location**: GPS auto-location, city search, and map pinning.
- **Precise Timeline**:
  - 🔵 **Blue Hour**: The magical time when the sky turns deep blue.
  - 🟡 **Golden Hour**: Soft, warm light during sunrise and sunset.
  - 🌑 **Twilights**: Detailed data for Astronomical, Nautical, and Civil twilights.
  - ☀️ **Sunrise/Sunset & Solar Noon**: Key solar events.
- **Future Planning**: Select any date to plan your shoots in advance.
- **Visuals**: Intuitive solar path and light phase charts.

### 🧮 Calculator Suite

#### 1. Exposure Calculator (EV)
- **Reciprocity**: Convert between Aperture, Shutter Speed, and ISO while maintaining exposure.
- **Parameter Lock**: Lock any parameter to automatically calculate the others.
- **ND Filter**: Built-in conversion for Neutral Density filters.

#### 2. Reciprocity Failure Calculator
- **For Film Photography**: Compensate for sensitivity loss during long exposures.
- **Film Presets**: Built-in data for popular films like Kodak Portra, Fujifilm Acros, Ilford HP5, etc.
- **Timer**: Integrated countdown timer with progress bar.

#### 3. Depth of Field (DoF) & Hyperfocal
- **Sharpness Range**: Calculate Near Limit, Far Limit, and Total Depth of Field.
- **Hyperfocal Distance**: Essential for landscape photography to maximize sharpness.
- **Multi-Format**: Supports Full Frame, APS-C, M4/3, and Medium Format systems.

---

## 🚀 Getting Started

### Prerequisites
Ensure your development environment has:
- **Node.js** (v18+)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: Download on your iOS or Android device.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/inoxixi7/bluehournew.git
   cd bluehournew
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the project**
   ```bash
   npx expo start
   ```

4. **Run the app**
   - Scan the QR code with Expo Go on your phone.
   - Or press `a` for Android Emulator, `i` for iOS Simulator.

---

## 📂 Project Structure

```
bluehournew/
├── assets/             # Static assets (images, fonts)
├── src/
│   ├── api/            # API services (Geocoding, SunTimes)
│   ├── components/     # UI Components
│   ├── constants/      # Global constants (Colors, Layout)
│   ├── contexts/       # React Contexts (Theme, Location)
│   ├── hooks/          # Custom Hooks
│   ├── locales/        # i18n localization files
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   └── utils/          # Utility functions (Calculations, Formatters)
└── docs/               # Documentation
```

---

## 🗺️ Roadmap

- [x] **v1.0 Foundation**
  - [x] Solar timeline & Blue Hour calculation
  - [x] Basic Exposure Calculator
  - [x] Multi-language support (EN/ZH/JA/DE)
  - [x] Dark Mode
- [ ] **v1.1 Advanced**
  - [ ] Moon Phase & Milky Way planner
  - [ ] Timelapse Calculator
  - [ ] Local Weather integration
- [ ] **v2.0 Community**
  - [ ] User photo sharing
  - [ ] Spot recommendations

---

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Maps**: [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- **i18n**: [i18next](https://www.i18next.com/)

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## ⚖️ Legal & Credits

- **Data Source**: Sunrise and sunset data provided by [sunrise-sunset.org](https://sunrise-sunset.org/api).
- **Privacy Policy**: This application processes location data locally on your device to calculate solar times. No location data is uploaded to any external server.
- **Trademarks**: All product names, logos, and brands (e.g., Kodak, Fujifilm) are property of their respective owners. All company, product and service names used in this application are for identification purposes only.
