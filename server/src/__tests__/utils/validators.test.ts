import {
  isValidEmail,
  isStrongPassword,
  isPositiveAmount,
  sanitiseString,
} from "../../utils/validators";

describe("validator utilities", () => {
  describe("isValidEmail", () => {
    it("returns true for a valid email", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
    });

    it("returns false for an email without domain", () => {
      expect(isValidEmail("user@localhost")).toBe(false);
    });

    it("returns false for a blank string", () => {
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("returns true for a strong password", () => {
      expect(isStrongPassword("Password1")).toBe(true);
    });

    it("returns false when password is too short", () => {
      expect(isStrongPassword("Pass1")).toBe(false);
    });

    it("returns false when password has no number", () => {
      expect(isStrongPassword("Password"))
        .toBe(false);
    });
  });

  describe("isPositiveAmount", () => {
    it("returns true for a positive amount", () => {
      expect(isPositiveAmount(100)).toBe(true);
    });

    it("returns false for zero", () => {
      expect(isPositiveAmount(0)).toBe(false);
    });

    it("returns false for a negative value", () => {
      expect(isPositiveAmount(-10.5)).toBe(false);
    });
  });

  describe("sanitiseString", () => {
    it("trims whitespace and escapes HTML characters", () => {
      expect(sanitiseString(" <script>alert('x')</script> ")).toBe("&lt;script&gt;alert(&#39;x&#39;)&lt;&#x2F;script&gt;");
    });

    it("returns the original string when safe", () => {
      expect(sanitiseString("Hello World")).toBe("Hello World");
    });

    it("escapes ampersands and quotes", () => {
      expect(sanitiseString("Tom & Jerry \"fun\"")).toBe("Tom &amp; Jerry &quot;fun&quot;");
    });
  });
});
