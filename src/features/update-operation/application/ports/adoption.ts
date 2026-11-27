/** Application-owned useful behavior, checked after the requested generation is admitted. */
export interface AdoptionProbe<Args extends readonly unknown[], Result> {
  readonly args: Args;
  readonly accept: (value: Result) => boolean;
}
