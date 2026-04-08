export abstract class Adapter<Input, Output> {
  abstract build(input: Input): Output;
}
