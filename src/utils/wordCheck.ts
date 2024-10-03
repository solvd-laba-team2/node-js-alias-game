import natural from "natural";
import { isProfane } from "no-profanity";

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

// List of most common stopwords in English
const stopWords: string[] = [
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
    "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
    "she", "her", "hers", "herself", "it", "its", "itself", "they", "them",
    "their", "theirs", "themselves", "what", "which", "who", "whom", "this",
    "that", "these", "those", "am", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "having", "do", "does", "did", "doing",
    "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between",
    "into", "through", "during", "before", "after", "above", "below", "to",
    "from", "up", "down", "in", "out", "on", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why", "how",
    "all", "any", "both", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "s", "t", "can", "will", "just", "don", "should", "now"
];

// Helper function to detect if the target word is reversed
function detectReversedWord(input: string, target: string): boolean {
    const reversedInput = input.split("").reverse().join("");
    return reversedInput === target;
}

// Helper function to detect if target word can be formed from non-contiguous letters
function detectContinuesLetters(input: string, target: string): boolean {
    let targetIndex = 0;
    for (const char of input) {
        if (char === target[targetIndex]) {
            targetIndex++;
        }
        if (targetIndex === target.length) {
            return true;
        }
    }
    return false;
}

// Function to validate the message
export const isMessageValid = (message: string, targetWord: string): { validation: boolean, cheatWord?: string, comment?: string } => {
    // Tokenize the message and filter out common stop words
    const tokenizedMessage = tokenizer.tokenize(message.toLowerCase()).filter(word => !stopWords.includes(word));

    for (const item of tokenizedMessage) {
        // Check if Levenshtein distance is less than 3
        if (natural.LevenshteinDistance(targetWord, item) < 3) {
            return { validation: false, cheatWord: item, comment: "Levenshtein distance" }; // comment for testing purposes, to be deleted before deployment
        }

        // Check if the message is a derivative of the target word
        if (natural.PorterStemmer.stem(item) === targetWord || natural.PorterStemmer.stem(targetWord) === item) {
            return { validation: false, cheatWord: item, comment: "A close derivative" };
        }

        // Check for various cheating options
        if (detectReversedWord(item, targetWord)) {
            return { validation: false, cheatWord: item, comment: "Reversed" };
        }

        // Check for continues letters forming the target word
        if (detectContinuesLetters(item, targetWord)) {
            return { validation: false, cheatWord: item, comment: "Letters in message create target word" };
        }

        // Check for profanity
        if (isProfane(item)) {
            return { validation: false, cheatWord: item, comment: "Profane word" };
        }
    }

    // If no cheating is detected
    return { validation: true };
};


