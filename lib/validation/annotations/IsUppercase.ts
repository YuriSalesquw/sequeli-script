import 'reflect-metadata';
import {addAttributeOptions} from "../../model/models";

/**
 * Checks for uppercase
 */
export function IsUppercase(target: any, propertyName: string): void {

  addAttributeOptions(target, propertyName, {
    validate: {
      isUppercase: true
    }
  });
}
