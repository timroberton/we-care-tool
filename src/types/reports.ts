export type Report = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
  markdown: string;
  images: ReportImage[];
};

export type ReportImage = {
  id: string;
  data: string;
};

export type AvailableImage = {
  id: string;
  description: string;
  data: string;
};
