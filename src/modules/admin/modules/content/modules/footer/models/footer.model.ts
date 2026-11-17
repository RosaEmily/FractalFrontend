import type { FooterBodyDTO, FooterColumnDTO } from "../dto/footer.dto";

export interface Footer {
  form: FooterBodyDTO;
  columns: FooterColumnDTO[];
}
