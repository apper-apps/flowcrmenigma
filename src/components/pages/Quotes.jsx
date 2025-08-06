import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import quoteService from '@/services/api/quoteService';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const statusOptions = ['Draft', 'Sent', 'Accepted', 'Rejected'];
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    Name: '',
    companyId: '',
    contactId: '',
    dealId: '',
    quoteDate: '',
    status: 'Draft',
    deliveryMethod: '',
    expiresOn: '',
    billingNameTo: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingPincode: '',
    shippingNameTo: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingPincode: '',
    Tags: ''
  });

  useEffect(() => {
    loadQuotes();
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await quoteService.getAll(searchTerm, sortBy, sortOrder, currentPage, itemsPerPage);
      setQuotes(result.data || []);
      setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
    } catch (err) {
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const result = await quoteService.create(formData);
      if (result) {
        toast.success('Quote created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        loadQuotes();
      } else {
        toast.error('Failed to create quote');
      }
    } catch (error) {
      toast.error('Failed to create quote');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;

    setFormLoading(true);

    try {
      const result = await quoteService.update(selectedQuote.Id, formData);
      if (result) {
        toast.success('Quote updated successfully');
        setIsEditModalOpen(false);
        setSelectedQuote(null);
        resetForm();
        loadQuotes();
      } else {
        toast.error('Failed to update quote');
      }
    } catch (error) {
      toast.error('Failed to update quote');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (quote) => {
    if (confirm(`Are you sure you want to delete "${quote.Name}"?`)) {
      try {
        const success = await quoteService.delete(quote.Id);
        if (success) {
          toast.success('Quote deleted successfully');
          loadQuotes();
        } else {
          toast.error('Failed to delete quote');
        }
      } catch (error) {
        toast.error('Failed to delete quote');
      }
    }
  };

  const openEditModal = async (quote) => {
    setSelectedQuote(quote);
    setFormLoading(true);
    
    try {
      const fullQuote = await quoteService.getById(quote.Id);
      if (fullQuote) {
        setFormData({
          Name: fullQuote.Name || '',
          companyId: fullQuote.companyId?.Id || '',
          contactId: fullQuote.contactId?.Id || '',
          dealId: fullQuote.dealId?.Id || '',
          quoteDate: fullQuote.quoteDate ? fullQuote.quoteDate.split('T')[0] : '',
          status: fullQuote.status || 'Draft',
          deliveryMethod: fullQuote.deliveryMethod || '',
          expiresOn: fullQuote.expiresOn || '',
          billingNameTo: fullQuote.billingNameTo || '',
          billingStreet: fullQuote.billingStreet || '',
          billingCity: fullQuote.billingCity || '',
          billingState: fullQuote.billingState || '',
          billingCountry: fullQuote.billingCountry || '',
          billingPincode: fullQuote.billingPincode || '',
          shippingNameTo: fullQuote.shippingNameTo || '',
          shippingStreet: fullQuote.shippingStreet || '',
          shippingCity: fullQuote.shippingCity || '',
          shippingState: fullQuote.shippingState || '',
          shippingCountry: fullQuote.shippingCountry || '',
          shippingPincode: fullQuote.shippingPincode || '',
          Tags: fullQuote.Tags || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load quote details');
    } finally {
      setFormLoading(false);
      setIsEditModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      companyId: '',
      contactId: '',
      dealId: '',
      quoteDate: '',
      status: 'Draft',
      deliveryMethod: '',
      expiresOn: '',
      billingNameTo: '',
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingCountry: '',
      billingPincode: '',
      shippingNameTo: '',
      shippingStreet: '',
      shippingCity: '',
      shippingState: '',
      shippingCountry: '',
      shippingPincode: '',
      Tags: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shippingNameTo: prev.billingNameTo,
      shippingStreet: prev.billingStreet,
      shippingCity: prev.billingCity,
      shippingState: prev.billingState,
      shippingCountry: prev.billingCountry,
      shippingPincode: prev.billingPincode
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const QuoteForm = ({ isEdit = false }) => (
    <form onSubmit={isEdit ? handleEdit : handleCreate} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="Name"
            label="Quote Name *"
            value={formData.Name}
            onChange={handleInputChange}
            required
            placeholder="Enter quote name"
          />
          <Select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions.map(status => ({ value: status, label: status }))}
          />
          <Input
            name="quoteDate"
            label="Quote Date"
            type="datetime-local"
            value={formData.quoteDate}
            onChange={handleInputChange}
          />
          <Input
            name="expiresOn"
            label="Expires On"
            type="date"
            value={formData.expiresOn}
            onChange={handleInputChange}
          />
          <Input
            name="deliveryMethod"
            label="Delivery Method"
            value={formData.deliveryMethod}
            onChange={handleInputChange}
            placeholder="e.g., Email, Postal Mail"
          />
          <Input
            name="Tags"
            label="Tags"
            value={formData.Tags}
            onChange={handleInputChange}
            placeholder="Comma-separated tags"
          />
        </div>
      </div>

      {/* Lookup Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Related Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="companyId"
            label="Company ID"
            type="number"
            value={formData.companyId}
            onChange={handleInputChange}
            placeholder="Company ID"
          />
          <Input
            name="contactId"
            label="Contact ID"
            type="number"
            value={formData.contactId}
            onChange={handleInputChange}
            placeholder="Contact ID"
          />
          <Input
            name="dealId"
            label="Deal ID"
            type="number"
            value={formData.dealId}
            onChange={handleInputChange}
            placeholder="Deal ID"
          />
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="billingNameTo"
            label="Bill To Name"
            value={formData.billingNameTo}
            onChange={handleInputChange}
            placeholder="Billing contact name"
          />
          <Input
            name="billingStreet"
            label="Street"
            value={formData.billingStreet}
            onChange={handleInputChange}
            placeholder="Street address"
          />
          <Input
            name="billingCity"
            label="City"
            value={formData.billingCity}
            onChange={handleInputChange}
            placeholder="City"
          />
          <Input
            name="billingState"
            label="State"
            value={formData.billingState}
            onChange={handleInputChange}
            placeholder="State/Province"
          />
          <Input
            name="billingCountry"
            label="Country"
            value={formData.billingCountry}
            onChange={handleInputChange}
            placeholder="Country"
          />
          <Input
            name="billingPincode"
            label="Pincode"
            value={formData.billingPincode}
            onChange={handleInputChange}
            placeholder="ZIP/Postal code"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyBillingToShipping}
            className="text-sm"
          >
            <ApperIcon name="Copy" size={16} className="mr-1" />
            Copy from Billing
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="shippingNameTo"
            label="Ship To Name"
            value={formData.shippingNameTo}
            onChange={handleInputChange}
            placeholder="Shipping contact name"
          />
          <Input
            name="shippingStreet"
            label="Street"
            value={formData.shippingStreet}
            onChange={handleInputChange}
            placeholder="Street address"
          />
          <Input
            name="shippingCity"
            label="City"
            value={formData.shippingCity}
            onChange={handleInputChange}
            placeholder="City"
          />
          <Input
            name="shippingState"
            label="State"
            value={formData.shippingState}
            onChange={handleInputChange}
            placeholder="State/Province"
          />
          <Input
            name="shippingCountry"
            label="Country"
            value={formData.shippingCountry}
            onChange={handleInputChange}
            placeholder="Country"
          />
          <Input
            name="shippingPincode"
            label="Pincode"
            value={formData.shippingPincode}
            onChange={handleInputChange}
            placeholder="ZIP/Postal code"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            isEdit ? setIsEditModalOpen(false) : setIsCreateModalOpen(false);
            resetForm();
            setSelectedQuote(null);
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={formLoading}
          className="min-w-[100px]"
        >
          {formLoading ? (
            <ApperIcon name="Loader2" size={16} className="animate-spin" />
          ) : (
            isEdit ? 'Update' : 'Create'
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your sales quotes and proposals</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search quotes..."
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            options={[
              { value: 'Name', label: 'Name' },
              { value: 'status', label: 'Status' },
              { value: 'quoteDate', label: 'Quote Date' },
              { value: 'expiresOn', label: 'Expires On' }
            ]}
            className="min-w-[140px]"
          />
        </div>
      </div>

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <Empty 
          message="No quotes found"
          description="Create your first quote to get started"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('Name')}
                  >
                    <div className="flex items-center">
                      Quote Name
                      <ApperIcon name="ArrowUpDown" size={16} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ApperIcon name="ArrowUpDown" size={16} className="ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('quoteDate')}
                  >
                    <div className="flex items-center">
                      Quote Date
                      <ApperIcon name="ArrowUpDown" size={16} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Expires On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <motion.tr
                    key={quote.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quote.Name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(quote.quoteDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(quote.expiresOn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.companyId?.Name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(quote)}
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quote)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {quotes.map((quote) => (
              <motion.div
                key={quote.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{quote.Name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Company: {quote.companyId?.Name || 'N/A'}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Quote Date: {formatDate(quote.quoteDate)}</div>
                  <div>Expires: {formatDate(quote.expiresOn)}</div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(quote)}
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(quote)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage + 1}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    <ApperIcon name="ChevronLeft" size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    <ApperIcon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Quote"
        size="xl"
      >
        <QuoteForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuote(null);
          resetForm();
        }}
        title="Edit Quote"
        size="xl"
      >
        <QuoteForm isEdit />
      </Modal>
    </div>
  );
};

export default Quotes;