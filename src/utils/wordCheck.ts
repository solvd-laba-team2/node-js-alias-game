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
    "very", "s", "t", "can", "will", "just", "don", "should", "now", "d", "ll", "u"
];

// Helper function to detect if the target word is reversed
function detectReversedWord(input: string, target: string): boolean {
    const reversedInput = input.split("").reverse().join("");
    return reversedInput === target;
}

// Helper function to detect if target word can be formed from non-contiguous letters
function detectNonContinuesLetters(input: string, target: string): boolean {
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

// Helper function to detect if the target word is hidden in a window of characters in the message
function detectTargetWordInWindow(input: string, target: string): boolean {
    const strippedInput = input.replace(/[^a-zA-Z]/g, "").toLowerCase();

    let targetIndex = 0;
    for (const char of strippedInput) {
        if (char === target[targetIndex]) {
            targetIndex++;
        } else {
            targetIndex = 0;
        }
        if (targetIndex === target.length) {
            return true;
        }
    }
    return false;
}

// Helper function to check if an item contains 66% or more of the target word
function containsMajorityOfTargetWord(input: string, target: string): boolean {
    let targetIndex = 0;
    let matchedChars = 0;

    // Iterate over the characters of the item
    for (const char of input) {
        if (char === target[targetIndex]) {
            matchedChars++;
            targetIndex++;
        } else {
            targetIndex = 0; // Reset if the sequence breaks
        }

        if (targetIndex === target.length) {
            break; // Stop when we have matched the whole targetWord
        }
    }
    // Calculate percentage of matched characters in the item
    const percentageMatched = (matchedChars / input.length) * 100;

    // Return false if 66% or more of the item matches the target word in sequence
    return percentageMatched > 66;
}

export const checkForProfanity = (message: string): { isProfane: boolean} => {
    const tokenizedMessage = tokenizer.tokenize(message.toLowerCase());
    for (const item of tokenizedMessage){
        if(isProfane(item)){
            return { isProfane: true};
        }

    }
    return { isProfane: false};
};

// Function to validate the message
export const isMessageValid = (message: string, targetWord: string): { validation: boolean, cheatWord?: string, comment?: string } => {
    // Tokenize the message and filter out common stop words
    const tokenizedMessage = tokenizer.tokenize(message.toLowerCase()).filter(word => !stopWords.includes(word));

    // Adjusting Levenshtein distance based on targetWord length
    let minimumDistance = 2;
    if (targetWord.length > 4 && targetWord.length < 8) {
        minimumDistance = 3;
    } else if (targetWord.length >= 8 && targetWord.length < 11) {
        minimumDistance = 4;
    } else if (targetWord.length >= 11) {
        minimumDistance = 5;
    }

    for (const item of tokenizedMessage) {
        // Check if Levenshtein distance is less than minimumDistance
        if (natural.LevenshteinDistance(targetWord, item) < minimumDistance) {
            return { validation: false, cheatWord: item, comment: "Levenshtein distance" };
        }
        // Check if the message is a derivative of the target word
        if (natural.PorterStemmer.stem(item) === targetWord || natural.PorterStemmer.stem(targetWord) === item) {
            return { validation: false, cheatWord: item, comment: "A close derivative" };
        }
         // Check for various cheating options
        if (detectReversedWord(item, targetWord)) {
            return { validation: false, cheatWord: item, comment: "Reversed" };
        }
        // Check for non-continues letters forming the target word
        if (detectNonContinuesLetters(item, targetWord)) {
            return { validation: false, cheatWord: item, comment: "Target word hidden in message" };
        }
        // Check if the message contains majority of target word
        if (containsMajorityOfTargetWord(item, targetWord) || containsMajorityOfTargetWord(targetWord, item)) {
            return { validation: false, cheatWord: item, comment: "Word contains majority of target word" };
        }
    }
    // Check for hiding the target word in whole message
    if (detectTargetWordInWindow(message, targetWord)) {
        return { validation: false, cheatWord: message, comment: "Target word hidden in message" };
    }

    return { validation: true };
};

