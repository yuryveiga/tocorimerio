import { describe, expect, it } from "vitest";
import { getTransferDirection } from "./transferOption";

const option = { title: "Copacabana → Maracanã", from: "Copacabana", to: "Maracanã" };

describe("getTransferDirection", () => {
  it("keeps the saved direction by default", () => {
    expect(getTransferDirection(option)).toEqual({
      from: "Copacabana",
      to: "Maracanã",
      title: "Copacabana → Maracanã",
      hasRoute: true,
    });
  });

  it("inverts origin and destination when the client swaps", () => {
    expect(getTransferDirection(option, true)).toEqual({
      from: "Maracanã",
      to: "Copacabana",
      title: "Maracanã → Copacabana",
      hasRoute: true,
    });
  });

  it("offers the swap only when both ends exist", () => {
    expect(getTransferDirection({ title: "Transfer particular", from: "", to: "" }).hasRoute).toBe(false);
    expect(getTransferDirection({ title: "Saindo de Copacabana", from: "Copacabana", to: "" }).hasRoute).toBe(false);
  });

  it("keeps a single end readable when swapped", () => {
    expect(getTransferDirection({ title: "Copacabana", from: "Copacabana", to: "" }, true)).toEqual({
      from: "",
      to: "Copacabana",
      title: "Copacabana",
      hasRoute: false,
    });
  });

  it("falls back to the stored title when no route is saved", () => {
    expect(getTransferDirection({ title: "Transfer para o jogo", from: "", to: "" }, true).title).toBe(
      "Transfer para o jogo",
    );
  });

  it("ignores extra spaces around the ends", () => {
    expect(getTransferDirection({ from: "  Copacabana ", to: "  Maracanã  " }, true).title).toBe(
      "Maracanã → Copacabana",
    );
  });

  it("tolerates a missing option", () => {
    expect(getTransferDirection(undefined)).toEqual({ from: "", to: "", title: "", hasRoute: false });
  });
});
