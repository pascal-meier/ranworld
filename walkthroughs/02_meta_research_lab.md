# Walkthrough: Meta-Research Lab

Ranworld hat nun einen vollständigen **Meta-Game-Loop**. Der Start eines jeden Expeditions-Versuchs ist nun eine strategische Entscheidungsebene, auf der du deinen "Forschungsstand" verbesserst.

## Das Labor im Detail

### 1. Permanente Upgrades
Wir haben drei zentrale Forschungszweige eingeführt, die den Schwierigkeitsgrad des Spiels beeinflussen:
- **HULL REINFORCEMENT**: Erhöht deine Start-HP permanent um bis zu +30.
- **SUPPLY LOGISTICS**: Ermöglicht den Start mit bis zu 2 zusätzlichen Versorgungs-Tokens.
- **FOCUS CALIBRATION**: Ein dauerhafter Bonus auf die Grundgenauigkeit (Legacy Boost), der bei jedem Angriff im Kampf aktiv ist.

### 2. Der Kauf-Prozess
Im neuen **Research Terminal** (Setup-Screen) kannst du deine in vorherigen Runs gesammelten **Archive Shards** investieren:
- Du siehst den Fortschritt (LVL 0/3 etc.), die Kosten für das nächste Level und eine detaillierte Beschreibung.
- Das System ist reaktiv: Sobald du auf "Research" klickst, wird das Guthaben abgezogen und der Bonus ist sofort für den nächsten Run aktiv.

### 3. Persistenz & Balance
- **LocalStorage**: Deine Forschungsergebnisse gehen nicht verloren, wenn du den Browser neu startest.
- **Mechanische Auswirkung**: Die `LabEngine` liest diese Daten beim Start jedes neuen Runs aus und wendet die Buffs auf den `PlayerState` an.

## Fazit
Das Meta-Labor gibt dem Spiel eine langfristige Motivation. Jeder gescheiterte Run bringt nun wertvolle Erkenntnisse (Shards), mit denen du dich auf die nächste, gefährlichere Expedition vorbereiten kannst. 🧪🧬
