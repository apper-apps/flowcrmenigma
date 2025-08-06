import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

export const contactService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...contacts];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return contacts.find(contact => contact.Id === parseInt(id));
  },

  async create(contactData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newContact = {
      Id: Math.max(...contacts.map(c => c.Id), 0) + 1,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, contactData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...contactData,
        updatedAt: new Date().toISOString()
      };
      return { ...contacts[index] };
    }
    throw new Error("Contact not found");
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index !== -1) {
      const deletedContact = contacts.splice(index, 1)[0];
      return { ...deletedContact };
    }
    throw new Error("Contact not found");
  },

  async search(query) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company.toLowerCase().includes(lowercaseQuery)
    );
  }
};