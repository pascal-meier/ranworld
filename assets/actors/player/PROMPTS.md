# Player Sprite Prompts

Current base candidate:

- `player-idle-v1.png`

Use this file to keep the character visually consistent across states.

## Core Character Identity

- Sci-fi lab operative
- Compact explorer suit
- Bright visor
- Handheld scanner
- Wrist stabilizer
- White and gray armor
- Teal accent lights
- Small orange warning accents
- Full body
- Slight 3/4 front view
- Readable silhouette
- Crisp pixel-art look

## Idle

### Positive
```txt
pixel art game sprite, sci-fi lab operative, full body, idle pose, slight 3/4 front view, bright visor helmet, handheld scanner, wrist stabilizer, compact explorer suit, readable silhouette, white and gray armor, teal accent lights, small orange details, clean outline, limited color palette, crisp pixels, simple shading, transparent background
```

### Negative
```txt
fantasy, knight, sword, shield, medieval, blurry, smudged, painterly, photorealistic, 3d render, anti-aliased, noisy details, messy silhouette, extra limbs, extra fingers, bulky armor, oversized weapon, background scene, text, watermark
```

## Guard

### Positive
```txt
pixel art game sprite, same character, sci-fi lab operative, full body, guard pose, slight 3/4 front view, bright visor helmet, compact explorer suit, wrist stabilizer raised defensively, scanner arm pulled in, readable silhouette, white and gray armor, teal accent lights, small orange details, clean outline, limited color palette, crisp pixels, simple shading, transparent background
```

### Negative
```txt
fantasy, knight, sword, shield, medieval, blurry, smudged, painterly, photorealistic, 3d render, anti-aliased, noisy details, messy silhouette, extra limbs, extra fingers, bulky armor, huge shield, background scene, text, watermark
```

## Focus

### Positive
```txt
pixel art game sprite, same character, sci-fi lab operative, full body, focus pose, slight 3/4 front view, bright visor helmet, handheld scanner glowing, wrist stabilizer active, compact explorer suit, readable silhouette, white and gray armor, teal accent lights, small orange details, clean outline, limited color palette, crisp pixels, simple shading, transparent background
```

### Negative
```txt
fantasy, knight, sword, shield, medieval, blurry, smudged, painterly, photorealistic, 3d render, anti-aliased, noisy details, messy silhouette, extra limbs, extra fingers, bulky armor, oversized weapon, background scene, text, watermark
```

## Suggested Settings

- Steps: `12`
- CFG: `1.2` to `1.4`
- LoRA strength: `0.8`
- Keep the same seed family while searching for matching states
- Generate `4` variants at a time

## Naming

- `player-idle-v2.png`
- `player-guard-v1.png`
- `player-focus-v1.png`
