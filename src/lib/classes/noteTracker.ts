export class NoteTracker {
  currenValue: number;

  constructor(value: number = 0) {
    this.currenValue = value;
  }

  increment() {
    this.currenValue++;
    if (this.currenValue === 16) {
      this.currenValue = 0;
    }
  }

  setValue(value: number) {
    this.currenValue = this.clamp(value);
  }

  getValue() {
    return this.currenValue;
  }

  private clamp(value: number) {
    return Math.min(15, Math.max(0, value));
  }
}
