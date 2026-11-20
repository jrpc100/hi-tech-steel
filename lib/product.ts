
export type Product = {
  id: number;
  name: string;
  category: "Door" | "Window";
  size: string;
  option: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Steel Door 4 × 3",
    category: "Door",
    size: "4 × 3",
    option: "Without Kurumbadi",
    description: "Premium GI steel door frame."
  },
  {
    id: 2,
    name: "Steel Door 4 × 3",
    category: "Door",
    size: "4 × 3",
    option: "With Kurumbadi",
    description: "Premium GI steel door frame."
  },
  {
    id: 3,
    name: "Steel Door 4 × 2.5",
    category: "Door",
    size: "4 × 2.5",
    option: "Without Kurumbadi",
    description: "Durable steel door frame."
  },
  {
    id: 4,
    name: "Steel Door 4 × 2.5",
    category: "Door",
    size: "4 × 2.5",
    option: "With Kurumbadi",
    description: "Durable steel door frame."
  },
  {
    id: 5,
    name: "Steel Door 9 × 4",
    category: "Door",
    size: "9 × 4",
    option: "Without Kurumbadi",
    description: "Premium steel door."
  },
  {
    id: 6,
    name: "Steel Door 9 × 4",
    category: "Door",
    size: "9 × 4",
    option: "With Kurumbadi",
    description: "Premium steel door."
  },
  {
    id: 7,
    name: "Steel Door 6 × 4",
    category: "Door",
    size: "6 × 4",
    option: "Without Kurumbadi",
    description: "Strong steel door."
  },
  {
    id: 8,
    name: "Steel Door 6 × 4",
    category: "Door",
    size: "6 × 4",
    option: "With Kurumbadi",
    description: "Strong steel door."
  },
  {
    id: 9,
    name: "Steel Door 5 × 3",
    category: "Door",
    size: "5 × 3",
    option: "Without Kurumbadi",
    description: "Modern steel door."
  },
  {
    id: 10,
    name: "Steel Door 5 × 3",
    category: "Door",
    size: "5 × 3",
    option: "With Kurumbadi",
    description: "Modern steel door."
  },
  {
    id: 11,
    name: "Steel Window 4 × 3",
    category: "Window",
    size: "4 × 3",
    option: "With Poli",
    description: "Premium steel window."
  },
  {
    id: 12,
    name: "Steel Window 4 × 3",
    category: "Window",
    size: "4 × 3",
    option: "Without Poli",
    description: "Premium steel window."
  },
  {
    id: 13,
    name: "Steel Window 4 × 2.5",
    category: "Window",
    size: "4 × 2.5",
    option: "With Poli",
    description: "Modern steel window."
  },
  {
    id: 14,
    name: "Steel Window 4 × 2.5",
    category: "Window",
    size: "4 × 2.5",
    option: "Without Poli",
    description: "Modern steel window."
  }
];
