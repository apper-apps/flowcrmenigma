import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "Lead",
    contactId: "",
    probability: "",
    expectedCloseDate: ""
  });

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals data");
      console.error("Deals load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? (contact.Name?.Name || contact.Name) : "Unknown Contact";
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

  const handleAddDeal = async (e) => {
    e.preventDefault();
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        contactId: parseInt(formData.contactId),
        probability: parseInt(formData.probability)
      };
      const newDeal = await dealService.create(dealData);
      setDeals([...deals, newDeal]);
      setShowAddModal(false);
      setFormData({
        title: "",
        value: "",
        stage: "Lead",
        contactId: "",
        probability: "",
        expectedCloseDate: ""
      });
      toast.success("Deal added successfully!");
    } catch (err) {
      toast.error("Failed to add deal");
      console.error("Add deal error:", err);
    }
  };

  const handleEditDeal = async (e) => {
    e.preventDefault();
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        contactId: parseInt(formData.contactId),
        probability: parseInt(formData.probability)
      };
      const updatedDeal = await dealService.update(selectedDeal.Id, dealData);
      setDeals(deals.map(d => d.Id === updatedDeal.Id ? updatedDeal : d));
      setShowEditModal(false);
      setSelectedDeal(null);
      toast.success("Deal updated successfully!");
    } catch (err) {
      toast.error("Failed to update deal");
      console.error("Update deal error:", err);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(dealId);
        setDeals(deals.filter(d => d.Id !== dealId));
        toast.success("Deal deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete deal");
        console.error("Delete deal error:", err);
      }
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      const updatedDeal = await dealService.updateStage(dealId, newStage);
      setDeals(deals.map(d => d.Id === updatedDeal.Id ? updatedDeal : d));
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update deal stage");
      console.error("Update stage error:", err);
    }
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      value: deal.value.toString(),
      stage: deal.stage,
      contactId: deal.contactId.toString(),
      probability: deal.probability.toString(),
      expectedCloseDate: deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd") : ""
    });
    setShowEditModal(true);
  };

  const getDealsForStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const calculateStageValue = (stage) => {
    return getDealsForStage(stage).reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) return <Loading className="p-8" />;
  if (error) return <Error message={error} onRetry={loadData} className="p-8" />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">Track and manage your deals through the sales process</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddModal(true)}
        >
          Add Deal
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage, index) => {
          const stageDeals = getDealsForStage(stage);
          const stageValue = calculateStageValue(stage);
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 text-center"
            >
              <h3 className="font-medium text-gray-900 mb-2">{stage}</h3>
              <p className="text-2xl font-bold gradient-text">{stageDeals.length}</p>
              <p className="text-sm text-gray-600">${stageValue.toLocaleString()}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {deals.length === 0 ? (
        <Empty
          title="No deals yet"
          description="Start building your sales pipeline by adding your first deal"
          actionText="Add Deal"
          icon="Target"
          onAction={() => setShowAddModal(true)}
          className="mt-12"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6 overflow-x-auto">
          {stages.map((stage, stageIndex) => {
            const stageDeals = getDealsForStage(stage);
            return (
              <div key={stage} className="min-w-[280px]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    {stage}
                    <Badge variant={getStageColor(stage)}>
                      {stageDeals.length}
                    </Badge>
                  </h2>
                  <span className="text-sm text-gray-600">
                    ${calculateStageValue(stage).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {stageDeals.map((deal, dealIndex) => (
                    <motion.div
                      key={deal.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (stageIndex * 0.1) + (dealIndex * 0.05) }}
                      className="card p-4 cursor-pointer hover:shadow-card-hover transition-all duration-200"
                    >
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 mb-1">{deal.title}</h3>
                        <p className="text-sm text-gray-600">{getContactName(deal.contactId)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-emerald-600">
                          ${deal.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {deal.probability}%
                        </span>
                      </div>
                      
                      {deal.expectedCloseDate && (
                        <p className="text-xs text-gray-500 mb-3">
                          Expected: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {stage !== "Won" && stage !== "Lost" && (
                            <select
                              value={deal.stage}
                              onChange={(e) => handleStageChange(deal.Id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {stages.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          >
                            <ApperIcon name="Edit" size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeal(deal.Id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Deal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Deal"
        size="md"
      >
        <form onSubmit={handleAddDeal} className="space-y-4">
          <Input
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Deal Value"
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
          <Select
            label="Contact"
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
            required
>
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {(contact.Name?.Name || contact.Name)} - {contact.company}
              </option>
            ))}
          </Select>
          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            required
          >
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </Select>
          <Input
            label="Probability (%)"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            required
          />
          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Deal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Deal"
        size="md"
      >
        <form onSubmit={handleEditDeal} className="space-y-4">
          <Input
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Deal Value"
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
          <Select
            label="Contact"
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
            required
>
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {(contact.Name?.Name || contact.Name)} - {contact.company}
              </option>
            ))}
          </Select>
          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            required
          >
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </Select>
          <Input
            label="Probability (%)"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            required
          />
          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deals;