export class DocumentDoesNotExist extends Error {
  public constructor() {
    super('Document does not exist in global context')
  }
}