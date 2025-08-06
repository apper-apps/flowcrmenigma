import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactDeals, setContactDeals] = useState([]);
  const [contactActivities, setContactActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    notes: ""
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
      console.error("Contacts load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContactDetails = async (contactId) => {
    try {
      const [deals, activities] = await Promise.all([
        dealService.getByContactId(contactId),
        activityService.getByContactId(contactId)
      ]);
      setContactDeals(deals);
      setContactActivities(activities);
    } catch (err) {
      console.error("Failed to load contact details:", err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    loadContactDetails(contact.Id);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const newContact = await contactService.create(formData);
      setContacts([...contacts, newContact]);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        notes: ""
      });
      toast.success("Contact added successfully!");
    } catch (err) {
      toast.error("Failed to add contact");
      console.error("Add contact error:", err);
    }
  };

  const handleEditContact = async (e) => {
    e.preventDefault();
    try {
      const updatedContact = await contactService.update(selectedContact.Id, formData);
      setContacts(contacts.map(c => c.Id === updatedContact.Id ? updatedContact : c));
      setSelectedContact(updatedContact);
      setShowEditModal(false);
      toast.success("Contact updated successfully!");
    } catch (err) {
      toast.error("Failed to update contact");
      console.error("Update contact error:", err);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId);
        setContacts(contacts.filter(c => c.Id !== contactId));
        if (selectedContact && selectedContact.Id === contactId) {
          setSelectedContact(null);
        }
        toast.success("Contact deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete contact");
        console.error("Delete contact error:", err);
      }
    }
  };

  const openEditModal = (contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      notes: contact.notes || ""
    });
    setShowEditModal(true);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Users";
      case "note": return "FileText";
      default: return "Activity";
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Lead": return "default";
      case "Qualified": return "info";
      case "Proposal": return "warning";
      case "Negotiation": return "primary";
      case "Won": return "success";
      case "Lost": return "danger";
      default: return "default";
    }
  };

  if (loading) return <Loading className="p-8" />;
  if (error) return <Error message={error} onRetry={loadContacts} className="p-8" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Contact List */}
        <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <Button
                variant="primary"
                icon="Plus"
                onClick={() => setShowAddModal(true)}
              >
                Add
              </Button>
            </div>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <Empty
                title="No contacts found"
                description="Get started by adding your first contact"
                actionText="Add Contact"
                icon="Users"
                onAction={() => setShowAddModal(true)}
              />
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                      selectedContact?.Id === contact.Id ? "bg-primary-50 border-r-2 border-primary-500" : ""
                    }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{contact.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact.position}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(contact);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.Id);
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex-1 lg:flex overflow-hidden">
          {selectedContact ? (
            <div className="w-full bg-white overflow-y-auto">
              <div className="p-8">
                {/* Contact Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedContact.name}</h1>
                      <p className="text-lg text-gray-600">{selectedContact.position} at {selectedContact.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        icon="Edit"
                        onClick={() => openEditModal(selectedContact)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        icon="Trash2"
                        onClick={() => handleDeleteContact(selectedContact.Id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <div className="card p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ApperIcon name="Mail" size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedContact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ApperIcon name="Phone" size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedContact.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ApperIcon name="Building" size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedContact.company}</span>
                        </div>
                      </div>
                      {selectedContact.notes && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                          <p className="text-sm text-gray-700">{selectedContact.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Associated Deals */}
                    <div className="card p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Associated Deals</h2>
                      {contactDeals.length === 0 ? (
                        <p className="text-gray-500 text-sm">No deals associated with this contact</p>
                      ) : (
                        <div className="space-y-3">
                          {contactDeals.map((deal) => (
                            <div key={deal.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <h3 className="font-medium text-gray-900">{deal.title}</h3>
                                <p className="text-sm text-gray-600">${deal.value.toLocaleString()}</p>
                              </div>
                              <Badge variant={getStageColor(deal.stage)}>
                                {deal.stage}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
                    {contactActivities.length === 0 ? (
                      <p className="text-gray-500 text-sm">No activities recorded for this contact</p>
                    ) : (
                      <div className="space-y-4">
                        {contactActivities.map((activity, index) => (
                          <div key={activity.Id} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <ApperIcon name={getActivityIcon(activity.type)} size={14} className="text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Users" size={48} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a contact</h3>
                <p className="text-gray-600">Choose a contact from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
        size="md"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this contact..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        size="md"
      >
        <form onSubmit={handleEditContact} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this contact..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contacts;