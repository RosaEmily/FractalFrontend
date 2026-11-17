import { BaseService } from "@/modules/admin/services/base.service";
import ComplaintRepository from "../repositories/complaint.repository";
import type { ComplaintRepositoryTypes } from "../models/complaint.model";
import type { ComplaintRespondBodyDTO } from "../dto/complaint.dto";

class ComplaintService extends BaseService<typeof ComplaintRepository, ComplaintRepositoryTypes> {
  constructor() {
    super(ComplaintRepository);
  }

  async respond(id: number | string, body: ComplaintRespondBodyDTO): Promise<null> {
    await ComplaintRepository.respond(id, body);
    return null;
  }
}

export default new ComplaintService();
