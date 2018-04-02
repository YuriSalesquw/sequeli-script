import {Model} from "../models/Model";

/**
 * Based on "IncludeAssociation" type definitions from:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/6490e738919a47761850caaeb14517b8af60d2a1/types/sequelize/index.d.ts#L3189
 */

/**
 * Association Object for Include Options
 */
export interface IIncludeAssociation {
  source: typeof Model;
  target: typeof Model;
  identifier: string;
}
