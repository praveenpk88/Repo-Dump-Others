// The shorter "final" pizza list, taken from the latest one-page Canva menu (13 pizzas).
// Laid out in three columns: Classic (the classic flavours), Level up (a little more on top),
// Go all in (the most loaded). Row 1 is the Margherita → Bufalina → Prosciutto ladder.
// diet: 'V' vegetarian, 'Ve' vegan. photo: file in photos/ (without .jpg).

module.exports = {
  tiers: ['Classic', 'Level up', 'Go all in'],

  pizzas: [
    [
      { name: 'Margherita', price: 22, desc: 'San Marzano tomato, Napoli-cut fior di latte, fresh basil & EVOO', diet: 'V', photo: 'margherita' },
      { name: 'Bufalina', price: 28, desc: 'San Marzano tomato, Napoli-cut fior di latte, buffalo mozzarella, basil & EVOO', diet: 'V', photo: 'bufalina' },
      { name: 'Prosciutto', price: 30, desc: 'San Marzano tomato, Napoli-cut fior di latte, buffalo mozzarella, prosciutto, basil & EVOO', photo: 'prosciutto' },
    ],
    [
      { name: 'Marinara', price: 17, desc: 'San Marzano tomato, oregano & garlic oil', diet: 'V, Ve', photo: 'marinara' },
      { name: 'Hawaiian', price: 26, desc: 'San Marzano tomato, mozzarella, smoked ham, pineapple & EVOO', photo: 'hamsorry' },
      { name: 'Capricciosa', price: 30, desc: 'San Marzano tomato, mozzarella, ham, artichoke, olives, mushroom & EVOO', photo: 'capricciosa' },
    ],
    [
      { name: 'Cheesy Garlic', price: 16, desc: 'Mozzarella, herbs & garlic oil', diet: 'V', photo: 'cheesy-garlic' },
      { name: 'Diavola', price: 28, desc: 'San Marzano tomato, mozzarella, spicy salame, olives, basil & EVOO', photo: 'diavola' },
      { name: 'La Porcona', price: 30, desc: 'Mozzarella, pork sausage, ham & spicy salame', note: 'Rossa (tomato base) or Bianca (white base)', photo: 'porcona-rossa' },
    ],
    [
      { name: 'Napoletana', price: 26, desc: 'Mozzarella, olives, anchovies, herbs & garlic oil', photo: 'napoletana' },
      { name: 'Salsiccia & Patate', price: 28, desc: 'Mozzarella cream base, Napoli-cut fior di latte, herb-roasted potato & pork sausage', note: 'Add mushrooms or capsicum +$1', photo: 'salsiccia-patate' },
      { name: 'Gamberi', price: 30, desc: 'Zucchini cream base, cherry tomatoes, prawns, spicy ’nduja & stracciatella', photo: 'gamberi' },
    ],
    [
      { name: 'Vegetarian', price: 27, desc: 'Zucchini cream base with seasonal vegetables & EVOO', diet: 'V', photo: 'vegetariana' },
      null,
      null,
    ],
  ],
};
