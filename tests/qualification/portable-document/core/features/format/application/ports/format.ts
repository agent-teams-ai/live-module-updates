/** Both functions are pure; provider identity is separate from this contract. */
export interface FormatPort {
  readonly title: (revision: number) => string;
  readonly body: (text: string) => string;
}
