export interface Product {
  id: string
  name: string
  description: string
  origin: string
  presentations: string[]
  weight: string
  image: string
  category: "quesos" | "carnicos" | "otros"
  status: "activo" | "inactivo"
  createdAt: string
  updatedAt: string
}
