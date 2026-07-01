import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  @Prop()
  deletedAt?: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}
