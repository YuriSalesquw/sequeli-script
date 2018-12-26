import {Model, ModelClassGetter} from '../../model';
import {Association, AssociationOptions, PreparedThroughOptions} from '..';
import {BelongsToManyAssociationOptions} from './belongs-to-many-association-options';
import {PreparedBelongsToManyAssociationOptions} from './prepared-belongs-to-many-association-options';
import {ModelNotInitializedError} from '../../model/shared/model-not-initialized-error';
import {BaseAssociation} from '../shared/base-association';
import {getForeignKeyOptions} from "../foreign-key/foreign-key-service";

export class BelongsToManyAssociation extends BaseAssociation {

  constructor(associatedClassGetter: ModelClassGetter,
              protected options: BelongsToManyAssociationOptions) {
    super(associatedClassGetter, options);
  }

  getAssociation(): Association {
    return Association.BelongsToMany;
  }

  getSequelizeOptions(model: typeof Model): AssociationOptions {
    const options: PreparedBelongsToManyAssociationOptions = {...this.options as any};
    const associatedClass = this.getAssociatedClass();
    const throughOptions = this.getThroughOptions();

    const throughModel = typeof throughOptions === 'object' ? throughOptions.model : undefined;
    options.through = throughOptions;
    options.foreignKey = getForeignKeyOptions(model, throughModel, this.options.foreignKey);
    options.otherKey = getForeignKeyOptions(associatedClass, throughModel, this.options.otherKey);

    return options;
  }

  private getThroughOptions(): PreparedThroughOptions | string {
    const through = this.options.through;
    const throughModel = typeof through === 'object' ? through.model : through;
    const throughOptions: PreparedThroughOptions =
      typeof through === 'object' ? {...through} : {} as any;

    if (typeof throughModel === 'function') {
      const throughModelClass = throughModel();
      if (!throughModelClass.isInitialized) {
        throw new ModelNotInitializedError(throughModelClass, {
          cause: 'before association can be resolved.',
        });
      }
      throughOptions.model = throughModelClass;
    } else {
      return throughModel;
    }

    return throughOptions;
  }
}
