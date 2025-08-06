import activitiesData from "@/services/mockData/activities.json";

let activities = [...activitiesData];

export const activityService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return activities.find(activity => activity.Id === parseInt(id));
  },

  async create(activityData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newActivity = {
      Id: Math.max(...activities.map(a => a.Id), 0) + 1,
      ...activityData,
      date: activityData.date || new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      activities[index] = {
        ...activities[index],
        ...activityData
      };
      return { ...activities[index] };
    }
    throw new Error("Activity not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = activities.findIndex(activity => activity.Id === parseInt(id));
    if (index !== -1) {
      const deletedActivity = activities.splice(index, 1)[0];
      return { ...deletedActivity };
    }
    throw new Error("Activity not found");
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return activities
      .filter(activity => activity.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByDealId(dealId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return activities
      .filter(activity => activity.dealId === parseInt(dealId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};