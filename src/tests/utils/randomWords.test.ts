import {
    generateWord,
    getWordGenerationOptions,
    difficultyWordOptions} from "../../utils/randomWords";
import { generateSlug } from "random-word-slugs";

jest.mock("random-word-slugs", () => ({
    generateSlug: jest.fn(),
}));

describe("generateWord", () => {
    it("should generate a single word based on provided options", () => {

        (generateSlug as jest.Mock).mockReturnValue("blueberry cow");

        const word = generateWord({
            slugOptions: { format: "lower", partsOfSpeech: ["noun"] },
            lengthOptions: { min: 3, max: 5 },
            slugLength: 1,
        });

        expect(generateSlug).toHaveBeenCalledWith(1, { format: "lower", partsOfSpeech: ["noun"] });
        expect(word).toBe("cow");
    });

    it("should throw an error if no valid word is found after multiple attempts", () => {

        (generateSlug as jest.Mock).mockReturnValue("longwordthatdoesntfit");

        expect(() => {
            generateWord({
                slugOptions: { format: "lower", partsOfSpeech: ["noun"] },
                lengthOptions: { min: 1, max: 5 },
                slugLength: 1,
            });
        }).toThrow(
            "Bad game options provided try to use different word length options",
        );
    });
});



describe("getWordGenerationOptions", () => {
    it("should return default options when no categories are provided", () => {
        const options = getWordGenerationOptions();
        expect(options.slugLength).toBe(0);
        expect(options.lengthOptions.min).toBe(0);
        // expect(options.lengthOptions.max).toBe(15);
    });

    it("should return valid options for given categories", () => {
        const options = getWordGenerationOptions(["color", "animals"], { min: 2, max: 8 });
        expect(options.slugLength).toBeGreaterThan(0);
        expect(options.slugOptions.categories.noun).toContain("animals");
        expect(options.slugOptions.categories.adjective).toContain("color");
    });
});



describe("difficultyWordOptions", () => {
    it("should have correct settings for easy difficulty", () => {
        const options = difficultyWordOptions.easy;
        expect(options.lengthOptions.min).toBe(0);
        expect(options.lengthOptions.max).toBe(8);
        expect(options.slugLength).toBeGreaterThan(0);
    });

    it("should have correct settings for hard difficulty", () => {
        const options = difficultyWordOptions.hard;
        expect(options.lengthOptions.min).toBe(10);
        expect(options.slugLength).toBeGreaterThan(0);
    });
});



describe("difficultyWordOptions", () => {
    it("should return correct word options for easy difficulty", () => {
        const options = difficultyWordOptions.easy;
        expect(options.slugLength).toBeGreaterThan(0);
        expect(options.lengthOptions.min).toBe(0);
        expect(options.lengthOptions.max).toBe(8);
    });

    it("should return correct word options for medium difficulty", () => {
        const options = difficultyWordOptions.medium;
        expect(options.slugLength).toBeGreaterThan(0);
        expect(options.lengthOptions.min).toBe(8);
        expect(options.lengthOptions.max).toBe(10);
    });

    it("should return correct word options for hard difficulty", () => {
        const options = difficultyWordOptions.hard;
        expect(options.slugLength).toBeGreaterThan(0);
        expect(options.lengthOptions.min).toBe(10);
    });
});
describe("generateWord", () => {
    it("should generate a word with default options", () => {
        (generateSlug as jest.Mock).mockReturnValue("blue cat");

        const word = generateWord();
        expect(generateSlug).toHaveBeenCalledWith(1, { format: "lower" });
        expect(word).toBe("blue cat");
    });

    it("should generate a single word based on provided options", () => {
        (generateSlug as jest.Mock).mockReturnValue("small elephant");

        const word = generateWord({
            slugOptions: { format: "lower", partsOfSpeech: ["noun"] },
            lengthOptions: { min: 3, max: 5 },
            slugLength: 2,
        });

        expect(word).toBe("small"); // elephant is too long for the range 3-5
    });
});