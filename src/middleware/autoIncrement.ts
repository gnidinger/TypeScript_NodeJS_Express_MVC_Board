import { Document, Model } from 'mongoose';

interface IAutoIncrement {
  [key: string]: number;
}

export const autoIncrement = (field: string) => {
  return async function (this: Document & IAutoIncrement, next: () => void) {
    if (this.isNew) {
      const Model = this.constructor as Model<Document & IAutoIncrement>;
      const lastDoc: (Document & IAutoIncrement) | null = await Model.findOne({}, {}, { sort: { [field]: -1 } });
      if (lastDoc && lastDoc[field]) {
        this[field] = lastDoc[field] + 1;
      } else {
        this[field] = 1;
      }
    }
    next();
  };
};
