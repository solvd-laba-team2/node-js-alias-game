import { generateSlug, RandomWordOptions } from "random-word-slugs";

// Define the possible categories for adjectives and nouns
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
] as const;

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
] as const;

type NounCategory = (typeof nounCategories)[number];
type AdjectiveCategory = (typeof adjectiveCategories)[number];

// Define types for the function arguments
interface LengthOptions {
  min?: number;
  max?: number;
}

// Function to generate a word based on the category and optional length options
export function generateWord(
  category: NounCategory | AdjectiveCategory | null = null,
  lengthOptions: LengthOptions = { min: 0, max: 15 },
): string {
  const isNoun = nounCategories.includes(category as NounCategory);
  const isAdjective = adjectiveCategories.includes(
    category as AdjectiveCategory,
  );
  const categories: {
    noun?: NounCategory[] | NounCategory;
    adjective?: AdjectiveCategory[] | AdjectiveCategory;
  } = {};
  if (isNoun) {
    categories.noun = [category as NounCategory];
  } else if (isAdjective) {
    categories.adjective = [category as AdjectiveCategory];
  }

  const options: RandomWordOptions<1> = {
    format: "lower",
    partsOfSpeech: isNoun ? ["noun"] : ["adjective"],
    categories: {
      adjective:
        isAdjective && category ? [category as AdjectiveCategory] : undefined,
      noun: isNoun && category ? [category as NounCategory] : undefined,
    },
  };

  let word = generateSlug(1, options);

  // Apply default length options if none are provided
  const { min = 0, max = 15 } = lengthOptions;

  // Ensure the word meets the length requirements
  while (word.length > max || word.length < min) {
    word = generateSlug(1, options);
  }

  return word;
}
