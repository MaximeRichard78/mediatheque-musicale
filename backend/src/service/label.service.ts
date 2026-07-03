import { Label } from '../model/label.model';
import { LabelRepository } from '../repository/label.repository';

export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async getAll(): Promise<Label[]> {
    return this.labelRepository.findAll();
  }

  async getById(id: string): Promise<Label | null> {
    return this.labelRepository.findById(id);
  }

  async filterByCountry(country: string): Promise<Label[]> {
    const labels = await this.labelRepository.findAll();
    const target = country.toLowerCase();

    return labels.filter((label) => label.country?.toLowerCase() === target);
  }

  async searchByCountryOfOrigin(query: string): Promise<Label[]> {
    const labels = await this.labelRepository.findAll();
    const target = query.toLowerCase();

    return labels.filter((label) => label.country?.toLowerCase().includes(target));
  }
}
