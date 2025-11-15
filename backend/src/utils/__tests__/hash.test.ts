import { hashPassword, verifyPassword } from "../hash";

describe("Password hashing", () => {
  it("should hash a password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("should verify a correct password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "testPassword123";
    const wrongPassword = "wrongPassword";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});

