'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User,{
        foreignKey:'userId'
      })
      // define association here
    }
    static addTodo({title ,dueDate,userId}){
      return this.create({title:title,dueDate:dueDate,completed:false,userId});
    }
    static getTodos(){
      return this.findAll();
    }
    markAsCompleted(){
      return this.update({completed:true})
    }
    static async remove(id,userId){
      return this.destroy({
        where:{
          id,
          userId
        }
      })
    }
    static getAllTodos(userId){
      return this.findAll({
        where:{
          userId,
        }
      });
    }
    setCompletionStatus(status){
      return this.update({completed :status});
    }
  }
  Todo.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull:false,
    validate:{
      notNull:true,
    }
  },
  completed:  {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};