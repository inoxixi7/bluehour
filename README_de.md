# 📱 Blue Hour - Landschafts- und Astrofotografie-Planungs-App

Ein umfassendes Fotografieplanungswerkzeug für Landschafts- und Outdoor-Fotografen. Diese React Native App bietet eine Vielzahl von Funktionen, darunter blaue Stunde, Sonnenauf- und -untergangsberechnungen, Belichtungsberechnungen und Reziprozitätsberechnungen für analoge Fotografie.

## ✨ Hauptfunktionen

### 📍 Blaue-Stunden-Planung

- Suchen und Berechnen der genauen Zeit der blauen Stunde an jedem Ort
- Anzeige von Sonnenauf- und -untergangszeiten sowie Start- und Endzeiten der blauen Stunde
- Speichern Sie Ihre Lieblings-Fotostandorte für schnellen Zugriff
- Unterstützt aktuelle Position oder manuelle Standortsuche
- **Was ist die blaue Stunde?** Die kurze Zeitspanne vor Sonnenaufgang und nach Sonnenuntergang, wenn der Himmel ein tiefes Blau annimmt. Die „magische Stunde" für Landschafts- und Architekturfotografie.

### 📸 Belichtungsrechner

- Belichtungsdreieck-Berechnung: Blende, Verschlusszeit, ISO
- **EV-Lock-Funktion**: Fixieren Sie den Basis-EV, ändern Sie einen Parameter und die anderen passen sich automatisch an
- **ND-Filter-Berechnung**: Unterstützt automatische Verschlusszeitanpassung bei Verwendung von ND-Filtern
- Direkter Sprung zum Reziprozitätsrechner aus den Berechnungsergebnissen

### 🎞️ Reziprozitätsrechner (Filmkompensation)

- **Reziprozitätsfehler-Korrektur**: Automatische Korrektur des Sensitivitätsverlusts bei Langzeitbelichtungen
- Unterstützt über 50 Filme (Ilford, Kodak, Fuji, Foma usw.): Portra 400, Ektar 100, Provia 100F, Velvia 50, etc.
- **Eingebaute Timer-Funktion**: Countdown mit korrigierter Verschlusszeit, unterstützt Hintergrundausführung und Benachrichtigungen
- Detaillierte Erklärung der Parameter und Eigenschaften jedes Films

### 🎨 Benutzer-Voreinstellungsverwaltung

- Speichern Sie benutzerdefinierte Fotovoreinstellungen (Blende, ISO, ND-Kombinationen)
- Schnelle Anwendung und Verwaltung von Voreinstellungen
- Personalisierte Einstellungen für Ihren Fotostil

### 🌍 Mehrsprachige Unterstützung

- Vereinfachtes Chinesisch (Standard)
- Englisch
- Japanisch
- Deutsch

### 🎭 Dunkles/Helles Design

- Folgt dem Systemdesign
- Wechseln Sie mit einem Tastendruck zwischen hellem/dunklem Modus

---

## 📖 Fotografische Fachbegriffe erklärt

### Was ist die blaue Stunde?

**Definition**: Die blaue Stunde ist die kurze Zeitspanne vor Sonnenaufgang und nach Sonnenuntergang, wenn die Sonne unter den Horizont sinkt und das gestreute Licht den Himmel in ein tiefes, lebendiges Blau taucht.

**Eigenschaften**:

- Weiches, gleichmäßiges Licht, nicht zu kontrastreich
- Der Himmel zeigt ein tiefes Blau mit niedriger Farbtemperatur
- Gutes Gleichgewicht zwischen Umgebungslicht und künstlichem Licht
- Tritt normalerweise etwa 30 Minuten vor Sonnenaufgang und nach Sonnenuntergang auf

**Beste Motive**:

- Stadtlandschaften: Gutes Gleichgewicht zwischen Nachtszenen und Himmel
- Architekturfotografie: Weiches Licht hebt Gebäudekonturen hervor
- Astrofotografie: Kombinieren Sie den Vordergrund, wenn der Himmel noch nicht vollständig dunkel ist
- Küstenlandschaften: Ruhige und sanfte Lichtatmosphäre

---

### Was ist das Reziprozitätsgesetz?

**Definition**: Das Reziprozitätsgesetz besagt, dass die Belichtung (Exposure) = Beleuchtungsstärke (Illuminance) × Zeit (Time). Theoretisch bleibt die Belichtung gleich, wenn Sie die Beleuchtungsstärke halbieren und die Zeit verdoppeln.

**Formel**:

```
E = I × t
```

- E: Belichtung (Exposure)
- I: Beleuchtungsstärke (Illuminance)
- t: Belichtungszeit (Time)

**Beispiel**:

- Blende F/8, Verschlusszeit 1/125s, ISO 100
- Ändern Sie die Blende auf F/11 (reduziert das Licht um 1 Blendenstufe)
- Ändern Sie die Verschlusszeit auf 1/60s (verdoppelt die Zeit)
- Die endgültige Belichtung bleibt gleich

Dies ist das Grundprinzip beim Anpassen des **Belichtungsdreiecks** (Blende, Verschlusszeit, ISO).

---

### Was ist Reziprozitätsfehler?

**Definition**: Bei der Analogfotografie verliert das **Reziprozitätsgesetz seine Gültigkeit**, wenn die Belichtungszeit eine bestimmte Schwelle überschreitet (normalerweise mehr als 1 Sekunde), und die tatsächliche Belichtung wird geringer als der theoretische Wert.

**Ursache**:

- Chemische Eigenschaften der Filmemulsion
- Die Reaktionseffizienz der lichtempfindlichen Partikel nimmt bei Langzeitbelichtung ab
- Verschiedene Filmtypen haben unterschiedliche Grade des Versagens

**Auswirkung**:

- **Unterbelichtung**: Wenn Sie normal nach dem Belichtungsmesser fotografieren, wird der Film zu dunkel
- **Farbverschiebung**: Bei Farbfilmen kann sich die Farbtemperatur ändern oder die Sättigung abnehmen
- **Kontrastveränderung**: Details in den Schatten können verloren gehen

**Lösung**:
Der **Reziprozitätsrechner** dieser App berechnet automatisch den Korrekturfaktor basierend auf jedem Filmtyp und gibt Ihnen die tatsächlich benötigte Verschlusszeit.

**Beispiel**:

- Verwendung von Kodak Tri-X 400 Film
- Vom Belichtungsmesser gemessene Verschlusszeit: 10 Sekunden
- Unter Berücksichtigung des Reziprozitätsfehlers müssen Sie tatsächlich **50 Sekunden** belichten (Kodak-Datenblatt)
- Diese App berechnet es automatisch und bietet auch eine Timer-Funktion

---

## 📥 Download und Verwendung

### Installationsmethode

1. **Android**: Laden Sie die APK-Datei herunter und installieren Sie sie (bald verfügbar)
2. **iOS**: Laden Sie sie aus dem App Store herunter (bald verfügbar)
3. **Entwicklermodus**: Klonen Sie das Projekt und führen Sie `npm install && npm start` aus

### Verwendungstipps

**Für Landschaftsfotografen**:

1. Suchen Sie im Voraus die Zeit der blauen Stunde an Ihrem Fotostandort und planen Sie Ihre Ankunftszeit
2. Verwenden Sie den Belichtungsrechner, um Blende und Verschlusszeit basierend auf den Lichtbedingungen vor Ort schnell zu berechnen
3. Speichern Sie häufig verwendete Einstellungen (z.B. F/11 + ISO 100 für Landschaftsfotografie) als Voreinstellungen

**Für Analogfotografen**:

1. Verwenden Sie bei Langzeitbelichtungen (insbesondere Nachtszenen und Astrofotografie) immer den Reziprozitätsrechner
2. Wählen Sie Ihren Filmtyp (z.B. Portra 400 oder Provia 100F)
3. Geben Sie die vom Belichtungsmesser gemessene Verschlusszeit ein und erhalten Sie die korrigierte Zeit
4. Verwenden Sie den eingebauten Timer, um die Belichtungszeit genau zu steuern

---

## 🛠️ Technologie-Stack

- **React Native** + **Expo** - Cross-Plattform-Mobile-Entwicklung
- **TypeScript** - Typsicherheit
- **React Navigation** - Navigationsverwaltung
- **i18next** - Internationalisierungsunterstützung
- **AsyncStorage** - Lokale Datenpersistenz

---

## 📚 Entwicklerinformationen

Für Projektarchitektur, API-Spezifikationen und Entwicklungsanleitungen siehe:

- [Entwicklungsnotizen](docs/DEVELOPMENT_NOTES.md)
- [Internationalisierungserklärung](docs/I18N.md)
- [Reziprozitätsdaten](docs/RECIPROCITY_DATA.md)

---

## 📄 Lizenz

MIT License - Siehe [LICENSE](LICENSE)-Datei für Details.

---

## 📧 Kontakt

Wenn Sie Fragen oder Vorschläge haben, reichen Sie bitte ein Issue auf GitHub ein.

---

**Halten Sie die schönen Momente der Landschaft und des Sternenhimmels fest! 🌄✨**
