export interface ContactDTO {
  label: string;
  value: string;
  href: string;
}

export interface ItemHrefDTO {
  name: string;
  href: string;
}

export interface FooterDTO {
  contact: ContactDTO[];
  social_networks: ItemHrefDTO[];
  information: ItemHrefDTO[];
  company: ItemHrefDTO[];
}
