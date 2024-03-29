'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //A user has many Todos and so the below code is wriiten
      User.hasMany(models.Todo,{
        foreignKey:'userId'
      })
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
      },
    },
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len:8
      },
    },
    password: {
      type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
      },
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};