// Everything Chef Mochi says and teaches lives here.
// A real recipe: one 8-inch (20 cm) chocolate cake, ganache drip,
// whipped cream and strawberries. Serves 8.

export const art = (name) => `/art/${name}.webp`
export const icon = (id) => `/art/icon-${id}.png`

export const meta = {
  title: 'Strawberry Chocolate Cake',
  serves: 'Serves 8',
  time: '~2 hrs (mostly cooling)',
  level: 'Easy, paws down',
}

export const welcome = {
  cat: 'intro',
  lines: [
    'Mrrrow! Welcome to my kitchen, little baker.',
    "I'm Chef Mochi. Today we're making a strawberry chocolate cake.",
    'Five easy steps. One gorgeous cake. Zero paws on the counter… mostly.',
    'Ready? Tap “Let’s bake!” and grab an apron.',
  ],
}

export const ingredientGroups = [
  {
    id: 'cake',
    title: 'For the cake',
    items: [
      { id: 'flour', name: 'All-purpose flour', amount: '1 cup · 125 g' },
      { id: 'sugar', name: 'Sugar', amount: '1 cup · 200 g' },
      { id: 'cocoa', name: 'Cocoa powder', amount: '⅓ cup · 30 g' },
      { id: 'soda', name: 'Baking soda', amount: '1 tsp' },
      { id: 'powder', name: 'Baking powder', amount: '½ tsp' },
      { id: 'salt', name: 'Salt', amount: '½ tsp' },
      { id: 'egg', name: 'Egg', amount: '1 large' },
      { id: 'milk', name: 'Milk', amount: '½ cup · 120 ml' },
      { id: 'butter', name: 'Butter, melted', amount: '4 tbsp · 57 g' },
      { id: 'vanilla', name: 'Vanilla extract', amount: '1 tsp' },
      { id: 'water', name: 'Hot water or coffee', amount: '½ cup · 120 ml' },
    ],
  },
  {
    id: 'ganache',
    title: 'For the chocolate drip',
    items: [
      { id: 'choc', name: 'Dark chocolate, chopped', amount: '4 oz · 115 g' },
      { id: 'cream1', name: 'Heavy cream', amount: '½ cup · 120 ml' },
    ],
  },
  {
    id: 'top',
    title: 'For the top',
    items: [
      { id: 'cream2', name: 'Cold heavy cream', amount: '½ cup · 120 ml' },
      { id: 'icing', name: 'Powdered sugar', amount: '1 tbsp' },
      { id: 'berries', name: 'Strawberries', amount: '6–8, hulled' },
    ],
  },
]

// `game` is the slot for the upcoming mini-games: register a component
// under the same key in src/games/index.js and it renders in the card.
export const steps = [
  {
    id: 'prepare',
    title: 'Prepare',
    subtitle: 'Set up your little kitchen',
    time: '10 min',
    cat: 'prepare',
    game: 'prepare',
    lines: [
      'First things first — let’s gather our treasures!',
      'Tap each ingredient to set it on the counter. I’ll guard the strawberries. Purely for safety reasons.',
      'Oh! Turn the oven on now, so it’s toasty when we need it.',
    ],
    instructions: [
      'Preheat your oven to 350°F / 175°C.',
      'Grease an 8-inch (20 cm) round pan and line the bottom with a circle of parchment paper.',
      'Melt the butter and let it cool a little. Take the egg out of the fridge.',
      'Gather every ingredient below so nothing sneaks away mid-recipe.',
    ],
    tip: 'Measure flour by spooning it into the cup and levelling it off. Scooping straight from the bag packs in too much and makes a dry cake.',
    showIngredients: true,
  },
  {
    id: 'mix',
    title: 'Mix',
    subtitle: 'Whisk up a fudgy batter',
    time: '10 min',
    cat: 'mix',
    game: 'mix',
    lines: [
      'Whisk, whisk, whisk! This is my favourite part.',
      'Dry things first, then the wet things. The hot water goes in last.',
      'The batter will look super runny. Don’t panic! Runny batter makes a fudgy cake.',
    ],
    instructions: [
      'In a large bowl, whisk the flour, sugar, cocoa, baking soda, baking powder and salt until no lumps remain.',
      'Add the egg, milk, melted butter and vanilla. Whisk for about 1 minute until smooth and glossy.',
      'Slowly stir in the hot water (or coffee). The batter will be thin — that’s exactly right.',
    ],
    tip: 'Coffee won’t make the cake taste like coffee. It just makes the chocolate taste extra chocolatey.',
    after: {
      cat: 'taste',
      title: 'Chef’s taste test',
      lines: [
        '…mmh. Just making sure it’s safe.',
        'Very important chef duty. Very serious. Mrrp.',
        'Psst — raw batter has raw egg and flour, so leave the taste-testing to the cat.',
      ],
      body: [
        'Chef Mochi is conducting a highly scientific quality inspection of the batter.',
        'Results: delicious. Ready for the oven.',
      ],
      next: 'Into the oven',
    },
  },
  {
    id: 'bake',
    title: 'Bake',
    subtitle: 'Into the warm box it goes',
    time: '30–35 min + cooling',
    cat: 'bake',
    game: 'bake',
    lines: [
      'Into the warm box it goes!',
      'No peeking for the first 20 minutes. I know. It’s hard. I’ll watch for both of us.',
      'It’s done when a toothpick comes out with just a few moist crumbs.',
      'Then it has to cool all the way down. Perfect time for a nap…',
    ],
    instructions: [
      'Pour the batter into the prepared pan and tap it on the counter to pop any big bubbles.',
      'Bake on the middle rack for 30–35 minutes, until a toothpick in the centre comes out with a few moist crumbs.',
      'Cool in the pan for 10 minutes, then run a knife around the edge and turn it out onto a rack.',
      'Let it cool completely, about 1 hour. Peel off the parchment.',
    ],
    tip: 'Opening the oven door early lets the heat rush out and can make the middle sink. Use the oven light instead.',
  },
  {
    id: 'decorate',
    title: 'Decorate',
    subtitle: 'Drip, swirl, crown',
    time: '25 min',
    cat: 'decorate',
    game: 'decorate',
    lines: [
      'Now the fancy part. Paws steady…',
      'Make sure the cake is totally cool. Warm cake plus cream equals sad puddle.',
      'Chocolate drip first, cream swirls next, then strawberries on top like little crowns.',
    ],
    instructions: [
      'Heat ½ cup cream until it’s steaming (not boiling) and pour it over the chopped chocolate.',
      'Wait 5 minutes, then stir until glossy. Let it thicken for 10–15 minutes.',
      'Pour the ganache onto the centre of the cake and nudge it to the edges so it drips down the sides.',
      'Whip the cold cream with the powdered sugar to soft peaks, then pipe big swirls around the top.',
      'Crown each swirl with a strawberry.',
    ],
    tip: 'Test the drip on one spot first. If it races to the bottom, let the ganache cool a few more minutes.',
  },
  {
    id: 'enjoy',
    title: 'Enjoy',
    subtitle: 'The best step of all',
    time: 'Right meow',
    cat: 'enjoy',
    game: 'enjoy',
    lines: [
      'Ta-da! Look what we made!',
      'You’re officially a pâtissier. And an honorary cat.',
      'Cut a big slice. Chef’s tax is one strawberry, please.',
    ],
    instructions: [
      'Dip a knife in hot water and wipe it dry before each cut for neat slices.',
      'Serve right away, or chill for 30 minutes to let the ganache set.',
      'Keep leftovers covered in the fridge for up to 3 days.',
    ],
    tip: 'Let fridge-cold slices sit out for 15 minutes. The cake gets soft and fudgy again.',
  },
]

export const quips = [
  'Mrrp?',
  'Purrrrr…',
  'Hehe, that tickles!',
  '*slow blink* (that means I like you)',
  'Paws off the whisk!',
  'Chef is working! …okay, one more pet.',
  'Mew!',
]

export const cheers = ['Purr-fect!', 'Paw-some!', 'Meow-velous!', 'Whisker-licious!', 'You’re a natural!']
