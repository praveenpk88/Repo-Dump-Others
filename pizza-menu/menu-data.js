// Single source for all menu text and prices. Edit here, then run `node build.js`.
// price: number, or null when the price is still to be confirmed (prints as "XX").
// photo: file in photos/ (without .jpg), or omitted when no photo exists yet.

module.exports = {
  brand: {
    name: 'La Pizza Napoletana',
    by: 'by Samuele Ferro',
    venue: 'il Mercato Centrale · Melbourne',
    tagline: 'Real dough. Real passion. Real pizza.',
    intro:
      'At the heart of every pizza is Samuele’s passion: the dough. Combining elements of traditional ' +
      'Napoletana and contemporanea pizza-making, he continually experiments with flour, fermentation ' +
      'and hydration to create his perfect dough.',
    introAsk: 'Curious? Ask Samuele what flour and hydration he’s using today.',
  },

  tiers: ['Classic', 'Level up', 'Go all in'],

  // Each row reads left to right: the classic, a small twist, then fully loaded.
  pizzas: [
    [
      { name: 'Margherita', price: 22, desc: 'San Marzano tomato, Napoli-cut fior di latte, basil & EVOO', photo: 'margherita' },
      { name: 'Bufalina', price: 26, desc: '+ Buffalo mozzarella', photo: 'bufalina' },
      { name: 'Prosciutto', price: 30, desc: '+ Prosciutto & buffalo mozzarella', photo: 'prosciutto' },
    ],
    [
      { name: 'Marinara', price: 18, desc: 'San Marzano tomato, oregano & garlic oil', vegan: true, photo: 'marinara' },
      { name: 'Acchugina', price: 20, desc: '+ Anchovies' },
      { name: 'Napoletana', price: 25, desc: '+ Anchovies, olives & mozzarella', photo: 'napoletana' },
    ],
    [
      { name: 'Salsiccia e Patate', price: 28, desc: 'Creamy base of Napoli-cut fior di latte, salsiccia & herb-roasted potatoes', photo: 'salsiccia-patate' },
      { name: 'Fungaiola', price: 29, desc: '+ Mushroom' },
      { name: 'Sotto Bosco', price: null, desc: '+ Mushroom & ‘Flavour Bomb’ truffle cheddar' },
    ],
    [
      { name: 'La Porcona Rossa', price: 30, desc: 'San Marzano tomato, mozzarella, salsiccia, ham & salame', photo: 'porcona-rossa' },
      { name: 'La Porcona Bianca', price: 30, desc: 'Switch it up with a creamy mozzarella base' },
      { name: 'Porcaccia', price: 32, desc: '+ Crispy guanciale & ‘Flavour Bomb’ truffle cheddar' },
    ],
    [
      { name: 'Cotto e Funghi', price: 26, desc: 'San Marzano tomato, mozzarella, ham & mushroom', note: 'Swap the ham for chicken' },
      { name: 'Capricciosa', price: 30, desc: '+ Artichoke & olives', photo: 'capricciosa' },
      { name: 'Capricchuga', price: null, desc: '+ Anchovies' },
    ],
    [
      { name: 'Diavola', price: 28, desc: 'San Marzano tomato, mozzarella, salame & olives', photo: 'diavola' },
      { name: 'Lucifero', price: 30, desc: '+ ’Nduja' },
      { name: 'Purgatorio', price: null, desc: '+ ’Nduja & stracciatella' },
    ],
    [
      { name: 'Gamberi', price: 28, desc: 'Zucchini cream, cherry tomato, mozzarella, parsley & prawns', photo: 'gamberi' },
      { name: 'Spishrimps', price: 30, desc: 'Stracciatella replaces mozzarella, + ’nduja' },
      null,
    ],
    [
      { name: 'Mortadella', price: 30, desc: 'Creamy mozzarella base, mortadella, stracciatella & pistachio', photo: 'mortadella' },
      { name: 'Bombadella', price: null, desc: '+ ‘Flavour Bomb’ truffle cheddar' },
      null,
    ],
    [
      { name: 'Hamsorry', price: 26, desc: 'San Marzano tomato, mozzarella, ham & pineapple', photo: 'hamsorry' },
      { name: 'Hambetter', price: 28, desc: 'Go bianca + guanciale' },
      null,
    ],
    [
      { name: 'Vegetariana', price: 27, desc: 'Zucchini cream, artichoke, mozzarella, potato, capsicum & eggplant', photo: 'vegetariana', note: 'Add chicken +XX' },
      null,
      null,
    ],
    [
      { name: 'Quattro Formaggi', price: null, desc: 'Mozzarella, scamorza, parmesan & ‘Flavour Bomb’ truffle cheddar' },
      null,
      null,
    ],
  ],

  focaccia: [
    { name: 'Focaccia', price: 14, desc: 'Fluffy dough, herbs & EVOO', vegan: true },
    { name: 'Cheesy Garlic', price: 16, desc: '+ Mozzarella & garlic oil', photo: 'cheesy-garlic' },
  ],

  dolce: [
    { name: 'Nutella Pizza', price: null, desc: 'Nutella & powdered sugar' },
    { name: 'Nutella + Pistachio', price: null, desc: '+ Pistachio' },
    { name: 'Nutella + Almonds', price: null, desc: '+ Almonds' },
  ],

  notes: {
    vegan: { title: 'Vegan / can be made vegan', text: 'Ask our team and we’ll make it happen.' },
    gf: {
      title: 'GF bases available',
      text:
        'Our gluten-free dough is made in-house by Samuele, who holds a Coeliac Australia certificate. ' +
        'All pizzas are cooked in the same oven as our regular bases, so we cannot guarantee the absence ' +
        'of gluten or cross-contact.',
    },
  },
};
