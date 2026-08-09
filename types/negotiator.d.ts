declare module 'negotiator' {
  interface NegotiatorOptions {
    headers: Record<string, string | string[] | undefined>;
  }

  export default class Negotiator {
    constructor(options: NegotiatorOptions);
    languages(available?: string[]): string[];
    language(available?: string[]): string | undefined;
    mediaTypes(available?: string[]): string[];
    mediaType(available?: string[]): string | undefined;
    encodings(available?: string[]): string[];
    encoding(available?: string[]): string | undefined;
    charsets(available?: string[]): string[];
    charset(available?: string[]): string | undefined;
  }
}
