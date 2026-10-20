# Storyboard — six scenes

| Scene | Copy source | Visual action | Input | Emotional purpose |
|---|---|---|---|---|
| 0 Invitation | `hero*` | single pink flower suspended in mist, warm glow | Tap flower or scroll | curiosity |
| 1 First Bloom | `firstBloom` | bud expands, petals unfurl; macro camera | Scroll | reveal |
| 2 Your Own Garden | `garden` | portrait-view enchanted field, depth layers, petals | Scroll; subtle touch parallax if supported | wonder |
| 3 Five Little Flowers | `memories` + `memoryFlowers` | 5 distinguished accessible flowers/cards; optional premium 3D models | Tap each to open message | personal affection |
| 4 My Wish For You | `wish` | golden-hour light replaces pink mist, calmer motion | Scroll | tenderness |
| 5 Forever Blooming | `finale` | garden blossoms softly, restrained heart-shaped petal swirl | Tap replay | emotional closure |

## Full messages
Read `src/content/gardenContent.ts` for the exact text. The user-approved messages include: cute/scolding-then-forgiving, funny surprise anger while hanging out, gratitude for 6 years, sincere 20/10 wishes, and 'anh yêu em nhiều lắm'. Keep the author’s voice and fun `=)))` tone.

## Text direction
Headlines short, center aligned with generous whitespace, maintain legibility over translucent visual effects. Do not place important text directly into WebGL textures as the sole text source.
