export interface ContactItem {
  label: string;
  value: string;
  href: string;
}

export interface ItemHref {
  name: string;
  href: string;
}

export interface SocialNetwork {
  name: string;
  href: string;
  logo: string;
}

export interface Footer {
  contact: ContactItem[];
  social_networks: SocialNetwork[];
  information: ItemHref[];
  company: ItemHref[];
}
