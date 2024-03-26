interface PlaceRow {
  id: string;
  googlePlaceId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export {PlaceRow};
