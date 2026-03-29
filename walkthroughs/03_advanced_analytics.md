# Walkthrough: Advanced Analytics (UX)

Wir haben die mechanische Transparenz von Ranworld auf ein neues Level gehoben. Spieler sehen nun nicht mehr nur eine nackte Prozentzahl, sondern die exakte mathematische Aufschlüsselung ihrer Trefferchancen im Kampf.

## Die Analyse im Detail

### 1. Wahrscheinlichkeits-Breakdown
Jeder Angriff zeigt nun seine Komponenten direkt in der Aktions-Beschreibung an:
- **Base**: Die Grundgenauigkeit des Angriffs.
- **Focus**: Bonus durch die "Calibrate"-Aktion.
- **Pity**: Der versteckte "Pity-Timer"-Bonus für Pechsträhnen.
- **Env**: Malus oder Bonus durch das aktuelle Wetter (z.B. Ion-Storm).
- **Lab**: Permanente Forschungs-Boni aus deinem Meta-Upgrade-Labor.

*Beispielanzeige*: `[75% (Base: 78% / Focus: +16% / Env: -5% / Lab: +5%)]`

### 2. Taktische Tiefe
Durch diese Transparenz wird Ranworld von einem reinen Glücksspiel zu einer echten Simulation:
- Spieler können nun genau abwägen, wie viel sie durch "Kalibrierung" gewinnen.
- Die Auswirkungen der Labor-Upgrades werden direkt im Kampf spürbar und sichtbar (Belohnungs-Effekt).
- Versteckte Systeme wie der "Pity-Timer" sind kein Geheimnis mehr, sondern ein taktisches Werkzeug.

### 3. Technische Umsetzung
- **LabEngine**: Die Berechnungs-Logik wurde zentralisiert, um alle Modifikatoren korrekt zu erfassen.
- **UI-Integration**: Das `combatRenderer` Modul extrahiert diese Daten nun reaktiv aus dem Action-Preview des Backends.

## Fazit
Mit den **Advanced Analytics** ist Ranworld nun nicht mehr nur ein Spiel *über* Zufall, sondern ein Lab-Simulator, in dem man den Zufall aktiv misst und manipuliert. 🧪📊
