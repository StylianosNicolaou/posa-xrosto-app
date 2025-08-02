export interface Item {
  id: string
  name: string
  price: number
  participants: string[]
}

export interface PersonTotal {
  name: string
  total: number
  items: { name: string; share: number }[]
}

export interface AppState {
  step: number
  numberOfPeople: string
  names: string[]
  currentNames: string[]
  items: Item[]
  currentItem: { name: string; price: string }
  selectedParticipants: string[]
  results: PersonTotal[]
}
