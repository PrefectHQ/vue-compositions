// https://github.com/microsoft/TypeScript/issues/14829#issuecomment-504042546
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never]

export type NonArray<T> = T extends (infer V)[] ? V : T