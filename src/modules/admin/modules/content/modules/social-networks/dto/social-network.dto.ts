export interface SocialNetworkDTO {
  id: string;
  name: string;
  url: string;
}

export interface SocialNetworkBodyDTO {
  name: string | null;
  url: string | null;
}
