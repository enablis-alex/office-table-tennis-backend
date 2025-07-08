const {
  Model,
  Attribute,
  DataTypes,
  PrimaryKey,
  AutoIncrement,
  NotNull,
} = require("@sequelize/core");

export class User extends Model {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  id;

  @Attribute(DataTypes.STRING)
  @NotNull
  firstName;

  @Attribute(DataTypes.STRING)
  lastName;

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
