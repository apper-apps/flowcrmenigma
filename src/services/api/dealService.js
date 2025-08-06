import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

export const dealService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...deals];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return deals.find(deal => deal.Id === parseInt(id));
  },

  async create(dealData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newDeal = {
      Id: Math.max(...deals.map(d => d.Id), 0) + 1,
      ...dealData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        ...dealData,
        updatedAt: new Date().toISOString()
      };
      return { ...deals[index] };
    }
    throw new Error("Deal not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      const deletedDeal = deals.splice(index, 1)[0];
      return { ...deletedDeal };
    }
    throw new Error("Deal not found");
  },

  async updateStage(id, stage) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = deals.findIndex(deal => deal.Id === parseInt(id));
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        stage,
        updatedAt: new Date().toISOString()
      };
      return { ...deals[index] };
    }
    throw new Error("Deal not found");
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return deals.filter(deal => deal.contactId === parseInt(contactId));
  }
};