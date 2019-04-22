import {InitOptions, Sequelize as OriginSequelize} from 'sequelize';
import {ModelNotInitializedError} from "../../model/shared/model-not-initialized-error";
import {ModelMatch, SequelizeOptions} from "./sequelize-options";
import {getModels, prepareArgs} from "./sequelize-service";
import {Model} from "../../model/model/model";
import {getModelName, getOptions} from "../../model/shared/model-service";
import {resolveScopes} from "../../scopes/scope-service";
import {installHooks} from "../../hooks/shared/hooks-service";
import {getAssociations} from "../../associations/shared/association-service";
import {getAttributes} from "../../model/column/attribute-service";
import {Repository} from "../..";

export class Sequelize extends OriginSequelize {

  options: SequelizeOptions;
  repositoryMode: boolean;

  constructor(database: string, username: string, password?: string, options?: SequelizeOptions);
  constructor(database: string, username: string, options?: SequelizeOptions);
  constructor(options?: SequelizeOptions);
  constructor(uri: string, options?: SequelizeOptions);
  constructor(...args: any[]) {
    const {preparedArgs, options} = prepareArgs(...args);
    super(...preparedArgs);

    if (options) {
      this.repositoryMode = !!options.repositoryMode;
      if (options.models) this.addModels(options.models);
      if (options.modelPaths) this.addModels(options.modelPaths);
    } else {
      this.repositoryMode = false;
    }
  }

  model(model: string | typeof Model) {
    if (typeof model !== 'string') {
      return super.model(getModelName(model.prototype)) as typeof Model;
    }
    return super.model(model) as typeof Model;
  }

  addModels(models: Array<typeof Model>);
  addModels(modelPaths: string[]);
  addModels(modelPaths: string[], modelMatch?: ModelMatch);
  addModels(arg: Array<typeof Model | string>);
  addModels(arg: Array<typeof Model | string>, modelMatch?: ModelMatch) {
    const defaultModelMatch = (filename, member) => filename === member;
    const models = getModels(arg, modelMatch || this.options.modelMatch || defaultModelMatch);

    const definedModels = this.defineModels(models);
    this.associateModels(definedModels);
    resolveScopes(definedModels);
    installHooks(definedModels);
  }

  getRepository<M extends Model>(modelClass: (new() => M)): Repository<M> {
    return this.model(modelClass as any) as Repository<M>;
  }

  private associateModels(models: Array<typeof Model>): void {

    models.forEach(model => {
      const associations = getAssociations(model.prototype);

      if (!associations) return;

      associations.forEach(association => {
        const options = association.getSequelizeOptions(model, this);
        const associatedClass = this.model(association.getAssociatedClass());

        if (!associatedClass.isInitialized) {
          throw new ModelNotInitializedError(
            associatedClass,
            `Association between ${associatedClass.name} and ${model.name} cannot be resolved.`
          );
        }
        model[association.getAssociation()](associatedClass, options as any);
      });
    });
  }

  private defineModels(models: Array<typeof Model>): Array<typeof Model> {

    return models.map(model => {
      const modelName = getModelName(model.prototype);
      const attributes = getAttributes(model.prototype);
      const modelOptions = getOptions(model.prototype);

      if (!modelOptions) throw new Error(`@Table annotation is missing on class "${model['name']}"`);

      const initOptions: InitOptions & {modelName} = {
        ...modelOptions,
        modelName,
        sequelize: this,
      };
      const definedModel = this.repositoryMode
        ? this.createRepositoryModel(model)
        : model;

      definedModel.init(attributes, initOptions);

      return definedModel;
    });
  }

  private createRepositoryModel(modelClass: typeof Model): typeof Model {
    return class extends modelClass<any> {
    };
  }

}
