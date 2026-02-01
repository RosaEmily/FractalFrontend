import { normalizeUrl, slugify } from "../format";
import type {
  DuplicatesValidationOptions,
  Item,
  StringValidator,
} from "@/shared/interface/zod";
import { validateUrl } from "../valid";

export const regexValidator =
  (regex: RegExp): StringValidator =>
  (val) =>
    !val || regex.test(val);

export const validateQuestionFormat =
  (requireStart = true): StringValidator =>
  (val) => {
    if (!val) return true;
    const trimmed = val.trim();
    return requireStart ? /^¿.*\?$/.test(trimmed) : /.*\?$/.test(trimmed);
  };

export const validateNoDuplicates =
  (
    itemsOrGetter: Item[] | (() => Item[]) = [],
    options: DuplicatesValidationOptions = {},
  ) =>
  (val: string): boolean => {
    if (!val) return true;

    const { key, maxRepeats = 1, type = "slug" } = options;

    const items =
      typeof itemsOrGetter === "function" ? itemsOrGetter() : itemsOrGetter;

    if (!Array.isArray(items)) return true;

    const normalizers: Record<string, (v: string) => string> = {
      slug: slugify,
      url: normalizeUrl,
    };

    const normalize = normalizers[type] ?? slugify;

    let count = 0;

    for (const item of items) {
      const value =
        typeof item === "object" && item !== null
          ? key && key in item
            ? (item as Record<string, unknown>)[key]
            : Object.values(item)[0]
          : item;

      if (normalize(String(value)) === normalize(val)) {
        count++;
      }
    }

    return count < maxRepeats;
  };

export const validateHttpsUrl =
  () =>
  (val: string): boolean => {
    if (!val) return true;
    return validateUrl(val);
  };
