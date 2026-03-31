# Walkthrough: Cinematic Ambient Audio

Wir haben die sterile und monotone Hintergrund-Akustik durch eine lebendige, prozedural generierte Klanglandschaft ersetzt.

## Die neue "Living Drone"

### 1. Von 2 auf 15 Sekunden
Anstatt einer kurzen 2-Sekunden-Schleife nutzen wir nun einen **15-sekündigen Buffer**. Das macht rhythmische Wiederholungen für das menschliche Ohr fast unhörbar und reduziert Ermüdungserscheinungen beim Spielen.

### 2. Brown-Noise Atmosphäre
Statt einfachem weißem Rauschen (das oft als "Saturieren" oder "Rauschen" wahrgenommen wird) nutzen wir nun **Brownian Noise**. Dieses ist tiefer, wärmer und simuliert perfekt den fernen Klang von Belüftungssystemen oder Schiffsreaktoren.

### 3. Der "Breathe"-Effekt (LFO)
Der Grundton (45Hz) ist nicht mehr statisch. Ein extrem langsamer **LFO (Low-Frequency Oscillator)** moduliert die Amplitude, sodass der Sound sanft "atmet". Das gibt der Umgebung eine organische, fast unheimliche Sci-Fi-Präsenz.

### 4. Harmonische Resonanz
Wir haben mehrere Obertöne (Harmonische) hinzugefügt, die leicht phasenverschoben sind. Dies simuliert die magnetische Resonanz von schweren Laborgeräten.

## Technische Details
- **Seamless Looping**: Ein winziges Windowing am Anfang und Ende des Buffers verhindert Knack-Geräusche beim Loop-Übergang.
- **Lautstärke-Balancing**: Der Sound wurde im `RunScene` auf `0.2` reduziert, um subtil im Hintergrund zu bleiben, ohne die Soundeffekte zu überlagern.

## Fazit
Ranworld klingt nun nicht mehr nach einer Test-App, sondern nach einer immersiven **Forschungsstation**. 🌌🛸
