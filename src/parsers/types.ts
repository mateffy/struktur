import type { Artifact } from "../types";

export type NpmParserDef = {
  type: "npm";
  package: string; // e.g. "@myorg/pdf-parser"
};

export type CommandFileDef = {
  type: "command-file";
  command: string; // must contain FILE_PATH placeholder
};

export type CommandStdinDef = {
  type: "command-stdin";
  command: string;
};

export type InlineParserDef = {
  type: "inline";
  handler: (buffer: Buffer) => Promise<Artifact>;
};

export type ParserDef = NpmParserDef | CommandFileDef | CommandStdinDef | InlineParserDef;

export type ParsersConfig = Record<string, ParserDef>; // keyed by MIME type

export type ParserInput =
  | { kind: "file"; path: string }
  | { kind: "buffer"; buffer: Buffer };
