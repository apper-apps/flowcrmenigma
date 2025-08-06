import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];

export const taskService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return tasks.find(task => task.Id === parseInt(id));
  },

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTask = {
      Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
      ...taskData,
      completed: false
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = tasks.findIndex(task => task.Id === parseInt(id));
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...taskData
      };
      return { ...tasks[index] };
    }
    throw new Error("Task not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = tasks.findIndex(task => task.Id === parseInt(id));
    if (index !== -1) {
      const deletedTask = tasks.splice(index, 1)[0];
      return { ...deletedTask };
    }
    throw new Error("Task not found");
  },

  async toggleComplete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = tasks.findIndex(task => task.Id === parseInt(id));
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        completed: !tasks[index].completed
      };
      return { ...tasks[index] };
    }
    throw new Error("Task not found");
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return tasks
      .filter(task => task.contactId === parseInt(contactId))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
};