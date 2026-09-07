import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SchemaInput } from "./SchemaInput";

const noop = () => {};

describe("SchemaInput", () => {
  it("renders both schema-mode radios", () => {
    render(
      <SchemaInput
        mode="fields"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    expect(screen.getByRole("radio", { name: "Fields shorthand" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "JSON Schema" })).toBeInTheDocument();
  });

  it("marks the active radio as checked", () => {
    const { rerender } = render(
      <SchemaInput
        mode="fields"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    expect(screen.getByRole("radio", { name: "Fields shorthand" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "JSON Schema" })).not.toBeChecked();

    rerender(
      <SchemaInput
        mode="json"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    expect(screen.getByRole("radio", { name: "JSON Schema" })).toBeChecked();
  });

  it("shows the fields input with the documented placeholder and helper text", () => {
    render(
      <SchemaInput
        mode="fields"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    const input = screen.getByLabelText("Field definitions");
    expect(input).toHaveAttribute("placeholder", "name:string, age:number, tags:array{string}");
    expect(
      screen.getByText(/Separate fields with commas\. Types: string, number, boolean, array, enum/),
    ).toBeInTheDocument();
  });

  it("shows the JSON editor instead when mode is json", () => {
    render(
      <SchemaInput
        mode="json"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    expect(screen.queryByLabelText("Field definitions")).not.toBeInTheDocument();
    // The textarea is identified by its placeholder (the "JSON Schema" label is
    // shared with the radio group item).
    expect(
      screen.getByPlaceholderText('{"type": "object", "properties": {...}}'),
    ).toBeInTheDocument();
  });

  it("calls onModeChange when a radio is selected", () => {
    const onModeChange = vi.fn();
    render(
      <SchemaInput
        mode="fields"
        schemaJson=""
        fields=""
        onModeChange={onModeChange}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "JSON Schema" }));
    expect(onModeChange).toHaveBeenCalledWith("json");
  });

  it("calls onFieldsChange when the fields input changes", () => {
    const onFieldsChange = vi.fn();
    render(
      <SchemaInput
        mode="fields"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={onFieldsChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Field definitions"), {
      target: { value: "name:string" },
    });
    expect(onFieldsChange).toHaveBeenCalledWith("name:string");
  });

  it("calls onSchemaJsonChange when the JSON editor changes", () => {
    const onSchemaJsonChange = vi.fn();
    render(
      <SchemaInput
        mode="json"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={onSchemaJsonChange}
        onFieldsChange={noop}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('{"type": "object", "properties": {...}}'), {
      target: { value: '{"type":"object"}' },
    });
    expect(onSchemaJsonChange).toHaveBeenCalledWith('{"type":"object"}');
  });

  it("renders neither editor when mode is file", () => {
    render(
      <SchemaInput
        mode="file"
        schemaJson=""
        fields=""
        onModeChange={noop}
        onSchemaJsonChange={noop}
        onFieldsChange={noop}
      />,
    );
    expect(screen.queryByLabelText("Field definitions")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('{"type": "object", "properties": {...}}'),
    ).not.toBeInTheDocument();
  });
});
