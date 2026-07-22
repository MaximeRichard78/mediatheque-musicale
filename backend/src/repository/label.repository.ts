import { Label } from '../model/label.model';

export interface LabelRepository {
  findAll(): Promise<Label[]>;
  findById(id: string): Promise<Label | null>;
}
