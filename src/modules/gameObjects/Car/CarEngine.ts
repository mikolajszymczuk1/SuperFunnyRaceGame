export default class CarEngine {
  readonly enginePower: number;

  constructor(engHP: number) {
    this.enginePower = engHP;
  }

  public getEngineForce(): number {
    const HP_TO_WATTS = 746;
    return this.enginePower * HP_TO_WATTS;
  }
}
