export const config = {
  API_KEY: process.env.API_KEY || "",
  PORT: parseInt(process.env.PORT || "3031"),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  OPENCODE_API_KEY: process.env.OPENCODE_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
} as const;
