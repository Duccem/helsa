import { Latitude } from '@/modules/shared/domain/core/value-objects/latitude';
import { Primitives } from '@/modules/shared/domain/types/primitives';

export class RoomCoordinates {
  constructor(public latitude: Latitude, public longitude: Latitude) {}
  static fromPrimitives(data: Primitives<RoomCoordinates>) {
    return new RoomCoordinates(new Latitude(data.latitude), new Latitude(data.longitude));
  }

  toPrimitives() {
    return {
      latitude: this.latitude.value,
      longitude: this.longitude.value,
    };
  }
}
