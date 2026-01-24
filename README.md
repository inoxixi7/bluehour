# 📱 Blue Hour - Landscape & Astrophotography Planning App

A comprehensive photography planning tool designed for landscape and outdoor photographers. This React Native app provides a rich set of features including blue hour calculations, sunrise/sunset times, exposure calculations, and film reciprocity calculations for analog photography.

## ✨ Key Features

### 📍 Blue Hour Planning
- Search and calculate precise blue hour times for any location
- Display sunrise/sunset times along with blue hour start/end times
- Save your favorite photography locations for quick access
- Support for current location or manual location search
- **What is Blue Hour?** The brief period before sunrise and after sunset when the sky takes on a deep blue color. The "magic hour" for landscape and architectural photography.

### 📸 Exposure Calculator
- Exposure triangle calculations: Aperture, Shutter Speed, ISO
- **EV Lock Feature**: Lock base EV, change one parameter and others auto-adjust
- **ND Filter Calculation**: Supports automatic shutter speed adjustment when using ND filters
- Direct jump to Reciprocity Calculator from calculation results

### 🎞️ Reciprocity Calculator (Film Compensation)
- **Reciprocity Failure Correction**: Automatically compensates for film sensitivity loss during long exposures
- Support for 11 major film types: Portra 400, Ektar 100, Provia 100F, Velvia 50, etc.
- **Built-in Timer Function**: Countdown with corrected shutter speed, supports background operation and notifications
- Detailed explanation of each film's parameters and characteristics

### 🎨 User Preset Management
- Save custom photography presets (aperture, ISO, ND combinations)
- Quick application and management of presets
- Personalized settings for your shooting style

### 🌍 Multi-language Support
- Simplified Chinese (default)
- English
- Japanese
- German

### 🎭 Dark/Light Theme
- Follows system theme
- Toggle between light/dark mode with one tap

---

## 📖 Photography Terms Explained

### What is Blue Hour?

**Definition**: Blue hour is the brief period before sunrise and after sunset when the sun dips below the horizon, causing scattered light to paint the sky in deep, vibrant blues.

**Characteristics**:
- Soft, even lighting without excessive contrast
- Sky displays deep blue tones with low color temperature
- Good balance between ambient and artificial lighting
- Typically occurs about 30 minutes before sunrise and after sunset

**Best Subjects**:
- Urban landscapes: Good balance between night scenes and sky
- Architectural photography: Soft light highlights building contours
- Astrophotography: Combine foreground when sky isn't completely dark yet
- Coastal landscapes: Calm and serene light atmosphere

---

### What is the Reciprocity Law?

**Definition**: The reciprocity law states that Exposure = Illuminance × Time. Theoretically, if you halve the illuminance and double the time, the exposure remains the same.

**Formula**:
```
E = I × t
```
- E: Exposure
- I: Illuminance
- t: Time

**Example**:
- Aperture F/8, Shutter speed 1/125s, ISO 100
- Change aperture to F/11 (reduces light by 1 stop)
- Change shutter speed to 1/60s (doubles time)
- Final exposure remains the same

This is the fundamental principle when adjusting the **exposure triangle** (aperture, shutter speed, ISO).

---

### What is Reciprocity Failure?

**Definition**: In film photography, when exposure time exceeds a certain threshold (typically more than 1 second), the **reciprocity law breaks down**, and the actual exposure becomes less than the theoretical value.

**Cause**:
- Chemical properties of film emulsion
- Light-sensitive particle reaction efficiency decreases during long exposures
- Different film types have varying degrees of failure

**Impact**:
- **Underexposure**: Shooting normally by the meter will make the film too dark
- **Color Shift**: Color films may experience color temperature changes or saturation loss
- **Contrast Change**: Shadow detail may be lost

**Solution**:
This app's **Reciprocity Calculator** automatically calculates the correction factor based on each film type and provides you with the actual required shutter speed.

**Example**:
- Using Kodak Portra 400 film
- Metered shutter speed: 30 seconds
- Considering reciprocity failure, you actually need to expose for **52 seconds**
- This app calculates it automatically and also provides a timer function

---

## 📥 Download and Usage

### Installation Methods

1. **Android**: Download and install the APK file (coming soon)
2. **iOS**: Download from App Store (coming soon)
3. **Developer Mode**: Clone the project and run `npm install && npm start`

### Usage Tips

**For Landscape Photographers**:
1. Search for blue hour times at your photo location in advance and plan your arrival time
2. Use the exposure calculator to quickly calculate aperture and shutter speed based on on-site light conditions
3. Save frequently used settings (e.g., F/11 + ISO 100 for landscapes) as presets

**For Film Photographers**:
1. Always use the reciprocity calculator for long exposures (especially night scenes and astrophotography)
2. Select your film type (e.g., Portra 400 or Provia 100F)
3. Input the shutter speed measured by your meter and get the corrected time
4. Use the built-in timer to accurately control exposure time

---

## 🛠️ Tech Stack

- **React Native** + **Expo** - Cross-platform mobile development
- **TypeScript** - Type safety
- **React Navigation** - Navigation management
- **i18next** - Internationalization support
- **AsyncStorage** - Local data persistence

---

## 📚 Developer Information

For project architecture, API specifications, and development guides, see:
- [Development Notes](docs/DEVELOPMENT_NOTES.md)
- [Internationalization Explanation](docs/I18N.md)
- [Reciprocity Data](docs/RECIPROCITY_DATA.md)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 📧 Contact

If you have any questions or suggestions, please submit an Issue on GitHub.

---

**Capture the beautiful moments of landscapes and starry skies! 🌄✨**
