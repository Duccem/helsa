export interface Adapter<Input, Output> {
  build(input: Input): Output;
}
