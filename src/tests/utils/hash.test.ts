import { shortenId, getOriginalId, encodeBase62, decodeBase62 } from "../../utils/hash";

describe("encodeBase62", () => {
  it("should return \"0\" when input is 0", () => {
    expect(encodeBase62(BigInt(0))).toBe("0");
  });

  it("should encode BigInt to Base62", () => {
    expect(encodeBase62(BigInt(1234569528n))).toBe("1ly7VK");
  });
});


describe("shortenId", () => {
  it("should shorten MongoDB ObjectId to Base62", () => {
    const objectId = "507f191e810c19729de860ea";
    const shortened = shortenId(objectId);
    expect(shortened).toBeDefined();
  });
});


describe("decodeBase62", () => {
  it("should decode Base62 to BigInt", () => {
    expect(decodeBase62("1ly7VK")).toBe(BigInt(1234569528n));
  });
});


describe("getOriginalId", () => {
  it("should return original ObjectId from shortened Base62 string", () => {
    const shortened = "co9nX2CINLrkfy2";
    const originalId = getOriginalId(shortened);
    expect(originalId).toHaveLength(24);
    expect(originalId).toBe("007f191e810c19729de860ea");
  });
});
