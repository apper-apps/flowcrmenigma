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
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    contactId: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksData, contactsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load tasks data");
      console.error("Tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "completed") {
      filtered = filtered.filter(task => task.completed);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterStatus === "overdue") {
      filtered = filtered.filter(task => !task.completed && isPast(new Date(task.dueDate)));
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const getContactName = (contactId) => {
    if (!contactId) return "No contact";
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : "Unknown Contact";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getTaskDateLabel = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return { label: "Today", variant: "warning" };
    if (isTomorrow(date)) return { label: "Tomorrow", variant: "info" };
    if (isPast(date)) return { label: "Overdue", variant: "danger" };
    if (isThisWeek(date)) return { label: "This week", variant: "default" };
    return { label: format(date, "MMM d"), variant: "default" };
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(tasks.map(t => t.Id === updatedTask.Id ? updatedTask : t));
      toast.success(updatedTask.completed ? "Task completed!" : "Task reopened");
    } catch (err) {
      toast.error("Failed to update task");
      console.error("Toggle complete error:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        contactId: formData.contactId ? parseInt(formData.contactId) : null
      };
      const newTask = await taskService.create(taskData);
      setTasks([...tasks, newTask]);
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        contactId: ""
      });
      toast.success("Task added successfully!");
    } catch (err) {
      toast.error("Failed to add task");
      console.error("Add task error:", err);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        contactId: formData.contactId ? parseInt(formData.contactId) : null
      };
      const updatedTask = await taskService.update(selectedTask.Id, taskData);
      setTasks(tasks.map(t => t.Id === updatedTask.Id ? updatedTask : t));
      setShowEditModal(false);
      setSelectedTask(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      toast.error("Failed to update task");
      console.error("Update task error:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.delete(taskId);
        setTasks(tasks.filter(t => t.Id !== taskId));
        toast.success("Task deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete task");
        console.error("Delete task error:", err);
      }
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: format(new Date(task.dueDate), "yyyy-MM-dd"),
      priority: task.priority,
      contactId: task.contactId ? task.contactId.toString() : ""
    });
    setShowEditModal(true);
  };

  if (loading) return <Loading className="p-8" />;
  if (error) return <Error message={error} onRetry={loadData} className="p-8" />;

  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.filter(task => !task.completed).length;
  const overdueCount = tasks.filter(task => !task.completed && isPast(new Date(task.dueDate))).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage your tasks and stay organized</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddModal(true)}
        >
          Add Task
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
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <ApperIcon name="CheckSquare" size={24} className="text-white" />
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-white" />
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={24} className="text-white" />
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
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertCircle" size={24} className="text-white" />
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
            placeholder="Search tasks..."
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select
            label="Priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <div className="flex items-end">
            <Button
              variant="secondary"
              icon="RotateCcw"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterPriority("all");
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks found"
          description="Create your first task to start organizing your work"
          actionText="Add Task"
          icon="CheckSquare"
          onAction={() => setShowAddModal(true)}
          className="mt-12"
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const dateInfo = getTaskDateLabel(task.dueDate);
            return (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card p-6 hover:shadow-card-hover transition-all duration-200 ${
                  task.completed ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task.Id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 hover:border-primary-500"
                    }`}
                  >
                    {task.completed && (
                      <ApperIcon name="Check" size={12} className="text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${
                          task.completed ? "text-gray-500 line-through" : "text-gray-900"
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mt-1 ${
                            task.completed ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={dateInfo.variant}>
                          {dateInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Calendar" size={14} />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </div>
                        {task.contactId && (
                          <div className="flex items-center gap-2">
                            <ApperIcon name="User" size={14} />
                            {getContactName(task.contactId)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit"
                          onClick={() => openEditModal(task)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDeleteTask(task.Id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Task"
        size="md"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional task description..."
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Select
            label="Contact (Optional)"
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
          >
            <option value="">No contact</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {contact.name} - {contact.company}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        size="md"
      >
        <form onSubmit={handleEditTask} className="space-y-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional task description..."
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Select
            label="Contact (Optional)"
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
          >
            <option value="">No contact</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {contact.name} - {contact.company}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;