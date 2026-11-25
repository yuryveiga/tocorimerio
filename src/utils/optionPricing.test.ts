import { describe, it, expect } from "vitest";
import { optionExtraPerPerson } from "./pricing";

describe("transfer option price is fixed for up to 4 people", () => {
  it("4 people share one vehicle price", () => expect(optionExtraPerPerson(200, 4) * 4).toBe(200));
  it("1 person pays the full vehicle price", () => expect(optionExtraPerPerson(200, 1)).toBe(200));
  it("5 people need two vehicles", () => expect(optionExtraPerPerson(200, 5) * 5).toBe(400));
});
