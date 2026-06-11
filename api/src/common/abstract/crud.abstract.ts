import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

export abstract class AbstractCrudService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findOne(id: string): Promise<T> {
    return await this.repository.findOneByOrFail({ id } as any);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const createdEntity = this.repository.create(data);
    return await this.repository.save(createdEntity);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const entityToUpdate = await this.findOne(id);
    Object.assign(entityToUpdate, data);
    return await this.repository.save(entityToUpdate);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
