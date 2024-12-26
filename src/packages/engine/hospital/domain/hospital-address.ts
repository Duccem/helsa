import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Latitude } from '@helsa/ddd/core/value-objects/latitude';
import { Longitude } from '@helsa/ddd/core/value-objects/longitude';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';

export class HospitalAddress {
  constructor(
    public id: Uuid,
    public street: StringValueObject,
    public city: StringValueObject,
    public country: StringValueObject,
    public zipCode: StringValueObject,
    public coordinates: HospitalAddressCoordinates
  ) {}

  toPrimitives(): Primitives<HospitalAddress> {
    return {
      id: this.id.value,
      street: this.street.value,
      city: this.city.value,
      country: this.country.value,
      zipCode: this.zipCode.value,
      coordinates: this.coordinates.toPrimitives(),
    };
  }

  static fromPrimitives(primitives: Primitives<HospitalAddress>): HospitalAddress {
    return new HospitalAddress(
      new Uuid(primitives.id),
      new StringValueObject(primitives.street),
      new StringValueObject(primitives.city),
      new StringValueObject(primitives.country),
      new StringValueObject(primitives.zipCode),
      HospitalAddressCoordinates.fromPrimitives(primitives.coordinates)
    );
  }

  static create(
    street: string,
    city: string,
    country: string,
    zipCode: string,
    coordinates: Primitives<HospitalAddressCoordinates>
  ): HospitalAddress {
    return new HospitalAddress(
      Uuid.random(),
      new StringValueObject(street),
      new StringValueObject(city),
      new StringValueObject(country),
      new StringValueObject(zipCode),
      HospitalAddressCoordinates.fromPrimitives(coordinates)
    );
  }

  update(data: Partial<Primitives<HospitalAddress>>): HospitalAddress {
    return new HospitalAddress(
      this.id,
      data.street ? new StringValueObject(data.street) : this.street,
      data.city ? new StringValueObject(data.city) : this.city,
      data.country ? new StringValueObject(data.country) : this.country,
      data.zipCode ? new StringValueObject(data.zipCode) : this.zipCode,
      data.coordinates ? HospitalAddressCoordinates.fromPrimitives(data.coordinates) : this.coordinates
    );
  }
}

export class HospitalAddressCoordinates {
  constructor(public latitude: Latitude, public longitude: Longitude) {}

  toPrimitives(): Primitives<HospitalAddressCoordinates> {
    return {
      latitude: this.latitude.value,
      longitude: this.longitude.value,
    };
  }

  static fromPrimitives(primitives: Primitives<HospitalAddressCoordinates>): HospitalAddressCoordinates {
    return new HospitalAddressCoordinates(new Latitude(primitives.latitude), new Longitude(primitives.longitude));
  }
}
