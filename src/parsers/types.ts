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

export type ParserDef = NpmParserDef | CommandFileDef | CommandStdinDef;

export type ParsersConfig = Record<string, ParserDef>; // keyed by MIME type

export type ParserInput =
  | { kind: "file"; path: string }
  | { kind: "buffer"; buffer: Buffer };
