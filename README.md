# Baking with Chef Mochi 🐾

A cozy little web app where a tabby chef cat teaches you to bake a real
strawberry chocolate cake in five steps — with dialogue, a whisking
mini-game, ragtime music and synthesized sound effects.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where things live

- `src/data/recipe.js` — the recipe, steps and everything Chef Mochi says
- `src/games/` — mini-games, registered per step in `games/index.js`
- `src/audio/sound.js` — music + synthesized sound effects
- `public/art/` — cat illustrations and step icons
- `public/audio/` — background music

Built with React, Vite and Framer Motion.
