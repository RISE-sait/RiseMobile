export type Product = {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  
  export const mockProducts: Product[] = [
    { id: "1", name: "RISE Hoodie", price: 49.99, image: "https://images.unsplash.com/photo-1615397587950-3cbb55f95b77?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: "2", name: "Athlete Water Bottle", price: 19.99, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: "3", name: "Performance Shorts", price: 29.99, image: "https://images.unsplash.com/photo-1617952385804-1da4f8d71ba9?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: "4", name: "Protein Powder", price: 39.99, image: "https://images.unsplash.com/photo-1595257842044-8f021a58c8a0?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ];
  