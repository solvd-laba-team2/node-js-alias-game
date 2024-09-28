const { generateSlug } = require("random-word-slugs");

const adjectiveCategories = [
  "appearance",
  "color",
  "condition",
  "personality",
  "quantity",
  "shapes",
  "size",
  "sounds",
  "taste",
  "time",
  "touch",
];

const nounCategories = [
  "animals",
  "business",
  "education",
  "family",
  "food",
  "health",
  "media",
  "people",
  "place",
  "profession",
  "religion",
  "science",
  "sports",
  "technology",
  "thing",
  "time",
  "transportation",
];
function generateWord(category = null, lengthOptions = { min: 0, max: 15 }) {
  const isNoun = nounCategories.includes(category);
  const isAdjective = adjectiveCategories.includes(category);
  const partsOfSpeech = isNoun
    ? ["noun"]
    : isAdjective
    ? ["adjective"]
    : ["noun", "adjective"];
  const options = {
    format: "lower",
    partsOfSpeech: partsOfSpeech,
    categories: {
      adjective: adjectiveCategories.includes(category) ? [category] : [],
      noun: nounCategories.includes(category) ? [category] : [],
    },
  };
  let word = generateSlug(1, options);
  while (word.length > lengthOptions.max || word.length < lengthOptions.min) {
    word = generateSlug(1, options);
  }
  return word;
}

module.exports = { generateWord };
