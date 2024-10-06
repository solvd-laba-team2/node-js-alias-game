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

type WordCategory = AdjectiveCategory | NounCategory;
type WordCategories = WordCategory[];

type NounCategory = (typeof nounCategories)[number];
type AdjectiveCategory = (typeof adjectiveCategories)[number];

interface LengthOptions {
  min?: number;
  max?: number;
}

const isNoun = (category: string) =>
  nounCategories.includes(category as NounCategory);

const isAdjective = (category: string) =>
  adjectiveCategories.includes(category as AdjectiveCategory);

const getValidCategories = (
  categories: string[] | null = null,
): {
  validNounCategories: NounCategory[];
  validAdjectiveCategories: AdjectiveCategory[];
  partsOfSpeech: ("adjective" | "noun")[];
} => {
  const validNounCategories: NounCategory[] = [];
  const validAdjectiveCategories: AdjectiveCategory[] = [];
  const partsOfSpeech = [];
  if (categories) {
    for (const category of categories) {
      if (isNoun(category)) {
        validNounCategories.push(category as NounCategory);
        partsOfSpeech.push("noun");
      } else if (isAdjective(category)) {
        validAdjectiveCategories.push(category as AdjectiveCategory);
        partsOfSpeech.push("adjective");
      }
    }
  }
  return { validNounCategories, validAdjectiveCategories, partsOfSpeech };
};

export const getWordGenerationOptions = (
  categories: WordCategories | string[] | null = null,
  lengthOptions: LengthOptions = { min: 0, max: 20 },
): {
  slugOptions: RandomWordOptions<number>;
  lengthOptions: LengthOptions;
  slugLength: number;
} => {
  const { min = 0, max = 15 } = lengthOptions;
  const { validAdjectiveCategories, validNounCategories, partsOfSpeech } =
    getValidCategories(categories);

  if (partsOfSpeech.length === 0) {
    return {
      slugOptions: { format: "lower" } as RandomWordOptions<
        typeof partsOfSpeech.length
      >,
      lengthOptions: { min, max } as LengthOptions,
      slugLength: partsOfSpeech.length,
    };
  }

  const options = {
    format: "lower",
    partsOfSpeech: partsOfSpeech,
    categories: {
      noun: validNounCategories,
      adjective: validAdjectiveCategories,
    },
  };

  return {
    slugOptions: options as RandomWordOptions<typeof partsOfSpeech.length>,
    lengthOptions: { min, max } as LengthOptions,
    slugLength: partsOfSpeech.length,
  };
};

export function generateWord(gameOptions: {
  slugOptions: RandomWordOptions<number>;
  lengthOptions: LengthOptions;
  slugLength: number;
}): string {
  const { min, max } = gameOptions.lengthOptions;
  const words = generateSlug(gameOptions.slugLength, gameOptions.slugOptions);

  // Split the slug into individual words
  const wordsArray = words.split(" ");

  // Filter words based on min/max length and return the array
  const filteredWords = wordsArray.filter(
    (word) => word.length >= min && word.length <= max,
  );

  const singleWord =
    filteredWords[Math.floor(Math.random() * filteredWords.length)];

  if (!singleWord) {
    return generateWord(gameOptions);
  }
  return singleWord;
}

const difficultyWordOptions = {
  easy: getWordGenerationOptions(["color", "animals", "family", "food"], {
    min: 0,
    max: 8,
  }),
  medium: getWordGenerationOptions(
    [
      ...adjectiveCategories.slice(adjectiveCategories.length / 3),
      ...nounCategories.slice(adjectiveCategories.length / 3),
    ],
    {
      min: 5,
    },
  ),
  hard: getWordGenerationOptions([...adjectiveCategories, ...nounCategories], {
    min: 10,
  }),
};
