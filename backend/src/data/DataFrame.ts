export default class<T> {
  public data: T[] = [];

  constructor(data?: T[]) {
    if (data) this.data = data;
  }

  getAll(predicate: (obj: T) => boolean): T[] {
    let result: T[] = [];
    this.data.forEach((o, index) => {
      if (predicate(o)) {
        result.push(o);
      }
    });

    return result;
  }
}
