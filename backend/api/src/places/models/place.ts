interface Place {
  id: string;
  formattedAddress: string;
  geometry: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export {Place};
