import { Label } from '../module/label';

export interface LabelRepository {
  findAll(): Promise<Label[]>;
  findById(id: string): Promise<Label | null>;
}
