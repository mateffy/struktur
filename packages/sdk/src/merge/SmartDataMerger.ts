import type { AnyJSONSchema } from "../types";

const isArraySchema = (schema: Record<string, unknown>) => {
  if (schema.type === "array") {
    return true;
  }
  return false;
};

const isObjectSchema = (schema: Record<string, unknown>) => {
  return schema.type === "object" && typeof schema.properties === "object";
};

export class SmartDataMerger {
  private schema: AnyJSONSchema;

  constructor(schema: AnyJSONSchema) {
    this.schema = schema;
  }

  merge(currentData: Record<string, unknown>, newData: Record<string, unknown>) {
    const merged: Record<string, unknown> = { ...currentData };
    const properties =
      (this.schema as { properties?: Record<string, Record<string, unknown>> })
        .properties ?? {};

    for (const [key, propSchema] of Object.entries(properties)) {
      const currentValue = currentData[key];
      const newValue = newData[key];

      if (isArraySchema(propSchema)) {
        merged[key] = [
          ...(Array.isArray(currentValue) ? currentValue : []),
          ...(Array.isArray(newValue) ? newValue : []),
        ];
        continue;
      }

      if (isObjectSchema(propSchema)) {
        merged[key] = {
          ...(typeof currentValue === "object" && currentValue ? currentValue : {}),
          ...(typeof newValue === "object" && newValue ? newValue : {}),
        };
        continue;
      }

      if (newValue !== undefined && newValue !== null && newValue !== "") {
        merged[key] = newValue;
      } else if (currentValue !== undefined) {
        merged[key] = currentValue;
      }
    }

    return merged;
  }
}
