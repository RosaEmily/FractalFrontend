import { describe, expect, it } from "vitest";
import Aura from "@primeuix/themes/aura";
import preset from "../src/shared/constants/primevue-preset";

describe("PrimeVue preset", () => {
  it("preserves Aura's shared design tokens", () => {
    expect(preset.primitive).toEqual(Aura.primitive);
    expect(preset.semantic).toEqual(Aura.semantic);
    expect(preset.css).toEqual(Aura.css);
  });

  it("preserves the complete theme of each included component", () => {
    for (const [name, tokens] of Object.entries(preset.components)) {
      expect(tokens, name).toEqual(Aura.components[name as keyof typeof Aura.components]);
    }
  });
});
