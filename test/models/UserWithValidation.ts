import {Table, Model, Column, DataType} from "../../src";

@Table
export class UserWithValidation extends Model<UserWithValidation> {

  @Column
  name: string;

  @Column({
    type: DataType.TEXT
  })
  bio: string;

  @Column({
    validate: {
      isEmail: true
    }
  })
  email: string;

}
