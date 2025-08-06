import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "call",
    contactId: "",
    dealId: "",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    duration: ""
  });

  const activityTypes = [
    { value: "call", label: "Phone Call", icon: "Phone" },
    { value: "email", label: "Email", icon: "Mail" },
    { value: "meeting", label: "Meeting", icon: "Users" },
    { value: "note", label: "Note", icon: "FileText" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities data");
      console.error("Activities load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getContactName(activity.contactId).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Date filter
    if (filterDate !== "all") {
      const now = new Date();
      let startDate, endDate;

      switch (filterDate) {
        case "today": {
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        }
        case "yesterday": {
          const yesterday = subDays(now, 1);
          startDate = startOfDay(yesterday);
          endDate = endOfDay(yesterday);
          break;
        }
        case "week": {
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        }
        case "lastWeek": {
          const lastWeekStart = startOfWeek(subDays(now, 7));
          startDate = lastWeekStart;
          endDate = endOfWeek(lastWeekStart);
          break;
        }
        default:
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= startDate && activityDate <= endDate;
        });
      }
    }

    setFilteredActivities(filtered);
  }, [activities, searchQuery, filterType, filterDate]);

const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? (contact.Name?.Name || contact.Name) : "Unknown Contact";
  };

  const getDealTitle = (dealId) => {
    if (!dealId) return null;
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title : "Unknown Deal";
  };

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : "Activity";
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "call": return "text-blue-600 bg-blue-100";
      case "email": return "text-green-600 bg-green-100";
      case "meeting": return "text-purple-600 bg-purple-100";
      case "note": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        dealId: formData.dealId ? parseInt(formData.dealId) : null,
        duration: formData.duration ? parseInt(formData.duration) : 0
      };
      const newActivity = await activityService.create(activityData);
      setActivities([newActivity, ...activities]);
      setShowAddModal(false);
      setFormData({
        type: "call",
        contactId: "",
        dealId: "",
        description: "",
        date: new Date().toISOString().slice(0, 16),
        duration: ""
      });
      toast.success("Activity logged successfully!");
    } catch (err) {
      toast.error("Failed to log activity");
      console.error("Add activity error:", err);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.delete(activityId);
        setActivities(activities.filter(a => a.Id !== activityId));
        toast.success("Activity deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete activity");
        console.error("Delete activity error:", err);
      }
    }
  };

  const getContactDeals = (contactId) => {
    return deals.filter(deal => deal.contactId === parseInt(contactId));
  };

  if (loading) return <Loading className="p-8" />;
  if (error) return <Error message={error} onRetry={loadData} className="p-8" />;

  const totalActivities = activities.length;
  const callsCount = activities.filter(a => a.type === "call").length;
  const emailsCount = activities.filter(a => a.type === "email").length;
  const meetingsCount = activities.filter(a => a.type === "meeting").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-2">Track all customer interactions and communications</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddModal(true)}
        >
          Log Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Activity" size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Phone Calls</p>
              <p className="text-2xl font-bold text-blue-600">{callsCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Phone" size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails</p>
              <p className="text-2xl font-bold text-green-600">{emailsCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Mail" size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meetings</p>
              <p className="text-2xl font-bold text-purple-600">{meetingsCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Users" size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
          />
          <Select
            label="Activity Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
          <Select
            label="Time Period"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="lastWeek">Last Week</option>
          </Select>
          <div className="flex items-end">
            <Button
              variant="secondary"
              icon="RotateCcw"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setFilterDate("all");
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Activities Timeline */}
      {filteredActivities.length === 0 ? (
        <Empty
          title="No activities found"
          description="Start logging your customer interactions to build a comprehensive activity timeline"
          actionText="Log Activity"
          icon="Clock"
          onAction={() => setShowAddModal(true)}
          className="mt-12"
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <ApperIcon name={getActivityIcon(activity.type)} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="default" className="capitalize">
                          {activity.type}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getContactName(activity.contactId)}
                        </h3>
                        {activity.dealId && (
                          <Badge variant="info">
                            {getDealTitle(activity.dealId)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Calendar" size={14} />
                          {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        {activity.duration > 0 && (
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Clock" size={14} />
                            {activity.duration} minutes
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleDeleteActivity(activity.Id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log New Activity"
        size="md"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          <Select
            label="Activity Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
          <Select
            label="Contact"
            value={formData.contactId}
            onChange={(e) => {
              const contactId = e.target.value;
              setFormData({ ...formData, contactId, dealId: "" });
            }}
            required
          >
            <option value="">Select a contact</option>
{contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {(contact.Name?.Name || contact.Name)} - {contact.company}
              </option>
            ))}
          </Select>
          {formData.contactId && (
            <Select
              label="Related Deal (Optional)"
              value={formData.dealId}
              onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
            >
              <option value="">No deal</option>
              {getContactDeals(parseInt(formData.contactId)).map(deal => (
                <option key={deal.Id} value={deal.Id}>
                  {deal.title} - ${deal.value.toLocaleString()}
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what happened during this interaction..."
            required
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          {(formData.type === "call" || formData.type === "meeting") && (
            <Input
              label="Duration (minutes)"
              type="number"
              min="0"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="How long did this interaction last?"
            />
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;