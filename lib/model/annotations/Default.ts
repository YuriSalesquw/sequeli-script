import 'reflect-metadata';
import {addAttributeOptions} from "../models";

/**
 * Sets the specified default value for the annotated field
 */
export function Default(value: any): Function {

  return (target: any, propertyName: string) => {

    addAttributeOptions(target, propertyName, {
      defaultValue: value
    });
  };
}
