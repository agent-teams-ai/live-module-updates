/** Pure display formatting: title includes the decimal revision; body preserves the text verbatim. */
export interface FormatPort {
  readonly title: (revision: number) => string;
  readonly body: (text: string) => string;
}
