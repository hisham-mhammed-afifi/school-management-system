import type { Request, Response } from 'express';
import type { RequirementService } from './requirement.service.ts';
import { sectionIdParamSchema, setRequirementsSchema } from './requirement.schema.ts';

export class RequirementController {
  private readonly service: RequirementService;
  constructor(service: RequirementService) {
    this.service = service;
  }

  get = async (req: Request, res: Response) => {
    const { sectionId } = sectionIdParamSchema.parse(req.params);
    const requirements = await this.service.getBySectionId(sectionId);
    res.json({ success: true, data: requirements });
  };

  set = async (req: Request, res: Response) => {
    const { sectionId } = sectionIdParamSchema.parse(req.params);
    const input = setRequirementsSchema.parse(req.body);
    const requirements = await this.service.setForSection(sectionId, input);
    res.json({ success: true, data: requirements });
  };
}
