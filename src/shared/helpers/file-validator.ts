import type {
  Rule,
  ValidationHandlers,
  FileValidationResult,
  DimensionRules,
  ItemRule,
  KeyCharacteristics,
  Format,
} from "@/shared/interface/file";

export class FileValidator {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  validateFormat = (
    acceptedFormats: string[],
    messageError?: string
  ): {
    error: string | null;
    extension: string | null;
    fileName: string;
  } => {
    const fileName = this.file.name;
    const extension = this.file.name.split(".").pop()?.toLowerCase() ?? null;

    const isValid = extension && acceptedFormats.includes(extension);

    return {
      error: isValid
        ? null
        : (messageError ??
          `Formato inválido. Solo se permiten: ${acceptedFormats.join(", ")}`),
      extension,
      fileName,
    };
  };

  validateSize = (
    sizeRule: Rule
  ): {
    error: string | null;
    sizeKB: number;
  } => {
    const sizeKB = this.file.size / 1024;

    if (!sizeRule) {
      return {
        error: null,
        sizeKB,
      };
    }

    const error = this.validateValueRule(sizeKB, sizeRule, "tamaño", "KB");

    return {
      error,
      sizeKB,
    };
  };

  validateDimensions = (
    dimensionRules: DimensionRules
  ): Promise<{
    error: string | null;
    width?: number;
    height?: number;
    url: string;
  }> => {
    return new Promise((resolve) => {
      const image = new Image();
      const url = URL.createObjectURL(this.file);

      image.onload = () => {
        const { width, height } = image;

        // validar ancho
        if (dimensionRules.width) {
          const error = this.validateValueRule(
            width,
            dimensionRules.width,
            "ancho",
            "px"
          );

          if (error) {
            URL.revokeObjectURL(url);
            resolve({ error, url, width, height });
            return;
          }
        }

        // validar alto
        if (dimensionRules.height) {
          const error = this.validateValueRule(
            height,
            dimensionRules.height,
            "alto",
            "px"
          );

          if (error) {
            URL.revokeObjectURL(url);
            resolve({ error, url, width, height });
            return;
          }
        }

        // OK → no hay errores
        URL.revokeObjectURL(url);
        resolve({
          error: null,
          url,
          width,
          height,
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          error: "No se pudo cargar la imagen.",
          url,
        });
      };

      image.src = url;
    });
  };

  validateValueRule = (
    current: number,
    rule: Rule,
    label: string,
    measuring: string
  ): string | null => {
    // EXACT
    if (rule.exact && current !== rule.exact.value) {
      return (
        rule.exact.messageError ??
        this.getValidationMessage(
          "exact",
          label,
          `${rule.exact.value} ${measuring}`
        )
      );
    }

    // MIN
    if (rule.min && current < rule.min.value) {
      return (
        rule.min.messageError ??
        this.getValidationMessage(
          "min",
          label,
          `${rule.min.value} ${measuring}`
        )
      );
    }

    // MAX
    if (rule.max && current > rule.max.value) {
      return (
        rule.max.messageError ??
        this.getValidationMessage(
          "max",
          label,
          `${rule.max.value} ${measuring}`
        )
      );
    }

    return null;
  };

  getValidationMessage = (
    type: string,
    label: string,
    value: string
  ): string => {
    switch (type) {
      case "exact":
        return `El ${label} debe ser exactamente ${value}.`;
      case "min":
        return `El ${label} debe ser mayor o igual a ${value}.`;
      case "max":
        return `El ${label} no debe superar ${value}.`;
      default:
        return "Valor inválido.";
    }
  };

  validateFile = async ({
    handlers,
    acceptedFormats,
    sizeRule,
    dimensionRules,
  }: {
    handlers?: ValidationHandlers;
    acceptedFormats?: string[];
    sizeRule?: Rule;
    dimensionRules?: DimensionRules;
  }): Promise<FileValidationResult> => {
    const errors: string[] = [];

    handlers?.onInit?.();
    const file = this.file;

    // Datos acumulados
    let extension: string | null = null;
    let fileName = file.name;
    let sizeKB = file.size / 1024;
    let width: number | undefined;
    let height: number | undefined;

    // ----- 1. Formato -----
    if (acceptedFormats?.length) {
      const formatResult = this.validateFormat(acceptedFormats);
      extension = formatResult.extension;
      fileName = formatResult.fileName;

      if (formatResult.error) {
        errors.push(formatResult.error);
      }
    }

    // ----- 2. Tamaño -----
    if (sizeRule) {
      const sizeResult = this.validateSize(sizeRule);
      sizeKB = sizeResult.sizeKB;

      if (sizeResult.error) {
        errors.push(sizeResult.error);
      }
    }

    // ----- 3. Dimensiones (solo si es imagen) -----
    const isImage = file.type.startsWith("image/");

    if (isImage && dimensionRules) {
      const dimResult = await this.validateDimensions(dimensionRules);
      width = dimResult.width;
      height = dimResult.height;

      if (dimResult.error) {
        errors.push(dimResult.error);
      }
    }

    // Crear URL de previsualización
    const previewUrl = URL.createObjectURL(file);
    const data: FileValidationResult = {
      previewUrl,
      fileName,
      extension,
      sizeKB,
      width,
      height,
      errors,
    };

    // ----- 4. Resultado final -----
    if (errors.length > 0) {
      handlers?.onError(errors);
      handlers?.onFinished?.();
      return data;
    }

    // ----- ENTREGAR TODOS LOS DATOS -----
    handlers?.onValid(data);
    handlers?.onFinished?.();

    return data;
  };

  generateMessageRule = (
    dimensionRules?: DimensionRules,
    sizeRule?: Rule,
    formats?: Format,
    keyOrder?: KeyCharacteristics[]
  ) => {
    // Mensajes temporales con su key
    const tempMessages: {
      key: KeyCharacteristics;
      message: string;
    }[] = [];

    // 🔹 Formatos aceptados
    if (formats?.items?.length) {
      const formatMessage = formats.message
        ? formats.message.replace(
            "#formats",
            formats.items.join(", ").toUpperCase()
          )
        : `Formato: ${formats.items.join(", ").toUpperCase()}`;

      tempMessages.push({ key: "formats", message: formatMessage });
    }

    // Size
    if (sizeRule) {
      const msgs = this.processMessageRule(sizeRule, "KB", "Peso");
      msgs.forEach((msg) => tempMessages.push({ key: "size", message: msg }));
    }

    // Width
    if (dimensionRules?.width) {
      const msgs = this.processMessageRule(dimensionRules.width, "px", "Ancho");
      msgs.forEach((msg) => tempMessages.push({ key: "width", message: msg }));
    }

    // Height
    if (dimensionRules?.height) {
      const msgs = this.processMessageRule(dimensionRules.height, "px", "Alto");
      msgs.forEach((msg) => tempMessages.push({ key: "height", message: msg }));
    }

    // Mensaje personalizado
    if (dimensionRules?.message) {
      const customMessage = this.applyDimensionPlaceholders(
        dimensionRules.message,
        dimensionRules
      );
      tempMessages.push({
        key: "messageDimension",
        message: customMessage,
      });
    }

    // 🔹 Ordenar según keyOrderCharacteristics
    if (keyOrder?.length) {
      tempMessages.sort(
        (a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key)
      );
    }

    // Retornar solo los mensajes
    return tempMessages.map((item) => item.message);
  };

  applyDimensionPlaceholders = (
    message: string,
    dimensionRules: DimensionRules
  ) => {
    const replacements: Record<string, string | number | undefined> = {
      "#width.min": dimensionRules.width?.min?.value,
      "#width.max": dimensionRules.width?.max?.value,
      "#width.exact": dimensionRules.width?.exact?.value,
      "#height.min": dimensionRules.height?.min?.value,
      "#height.max": dimensionRules.height?.max?.value,
      "#height.exact": dimensionRules.width?.exact?.value,
    };

    let processed = message;

    Object.entries(replacements).forEach(([placeholder, value]) => {
      if (value !== undefined) {
        processed = processed.replace(
          new RegExp(placeholder, "g"),
          String(value)
        );
      }
    });

    return processed;
  };

  processMessageRule = (
    rule: Rule | undefined,
    unit: string,
    typeLabel: string
  ): string[] => {
    if (!rule) return [];

    const parts: string[] = [];

    if (rule.min?.showMessage) {
      parts.push(...this.checkMessageRule(rule.min, "min", unit, typeLabel));
    }
    if (rule.max?.showMessage) {
      parts.push(...this.checkMessageRule(rule.max, "max", unit, typeLabel));
    }
    if (rule.exact?.showMessage) {
      parts.push(
        ...this.checkMessageRule(rule.exact, "exact", unit, typeLabel)
      );
    }

    return parts;
  };

  checkMessageRule = (
    item: ItemRule | undefined,
    type: string,
    unit: string,
    typeLabel: string
  ): string[] => {
    if (!item) return [];

    const parts: string[] = [];

    // Usa el mensaje personalizado si existe
    if (item.message) {
      const finalMsg = item.message
        .replace("#value", item.value.toString())
        .replace("#unit", unit)
        .replace("#label", typeLabel);

      parts.push(finalMsg);
      return parts;
    }

    // Fallback automático
    switch (type) {
      case "exact":
        parts.push(`${typeLabel} exacto de ${item.value} ${unit}`);
        break;
      case "min":
        parts.push(`${typeLabel} mínimo ${item.value} ${unit}`);
        break;
      case "max":
        parts.push(`${typeLabel} máximo ${item.value} ${unit}`);
        break;
    }

    return parts;
  };
}
