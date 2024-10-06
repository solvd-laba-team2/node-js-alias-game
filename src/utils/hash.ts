// Base62 characters: 0-9, a-z, A-Z

const base62Chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Function to convert a BigInt to Base62
function encodeBase62(num: bigint): string {
  let base62 = "";
  const base = BigInt(base62Chars.length);

  while (num > 0) {
    const remainder = num % base;
    base62 = base62Chars[Number(remainder)] + base62;
    num = num / base;
  }

  return base62 || "0";
}

// Function to shorten MongoDB ObjectId to a Base62 string
export function shortenId(id: string): string {
  // Convert hex ID (string) to BigInt
  const bigInt = BigInt(`0x${id}`);

  // Encode BigInt as Base62 (smaller URL-friendly format)
  return encodeBase62(bigInt);
}

// Function to decode a Base62 string back to BigInt
function decodeBase62(base62: string): bigint {
  let num = BigInt(0);
  const base = BigInt(base62Chars.length);

  for (let i = 0; i < base62.length; i++) {
    const index = base62Chars.indexOf(base62[i]);
    num = num * base + BigInt(index);
  }

  return num;
}

// Function to get the original MongoDB ObjectId from the shortened Base62 string
export function getOriginalId(shortCode: string): string {
  // Decode the Base62 string back to BigInt
  const bigInt = decodeBase62(shortCode);

  // Convert the BigInt to a hexadecimal string (MongoDB ObjectId format)
  const hexString = bigInt.toString(16);

  // Ensure the hex string is 24 characters long (standard ObjectId length)
  return hexString.padStart(24, "0");
}


