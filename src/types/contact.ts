export interface ContactData { 
  id: string; 
  description: string; 
  isFavorite: boolean; 
  type: string; 
  value: string 
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Contact extends ContactData {}