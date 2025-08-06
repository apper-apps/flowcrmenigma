const { ApperClient } = window.ApperSDK;

class QuoteService {
  constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'quote';
  }

  async getAll(searchTerm = '', sortBy = 'Name', sortOrder = 'ASC', page = 0, limit = 20) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "companyId" } },
          { field: { Name: "contactId" } },
          { field: { Name: "dealId" } },
          { field: { Name: "quoteDate" } },
          { field: { Name: "status" } },
          { field: { Name: "deliveryMethod" } },
          { field: { Name: "expiresOn" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: sortBy,
            sorttype: sortOrder
          }
        ],
        pagingInfo: {
          limit: limit,
          offset: page * limit
        }
      };

      if (searchTerm) {
        params.where = [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [searchTerm]
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return { data: [], total: 0 };
      }

      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching quotes:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { data: [], total: 0 };
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "companyId" } },
          { field: { Name: "contactId" } },
          { field: { Name: "dealId" } },
          { field: { Name: "quoteDate" } },
          { field: { Name: "status" } },
          { field: { Name: "deliveryMethod" } },
          { field: { Name: "expiresOn" } },
          { field: { Name: "billingNameTo" } },
          { field: { Name: "billingStreet" } },
          { field: { Name: "billingCity" } },
          { field: { Name: "billingState" } },
          { field: { Name: "billingCountry" } },
          { field: { Name: "billingPincode" } },
          { field: { Name: "shippingNameTo" } },
          { field: { Name: "shippingStreet" } },
          { field: { Name: "shippingCity" } },
          { field: { Name: "shippingState" } },
          { field: { Name: "shippingCountry" } },
          { field: { Name: "shippingPincode" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching quote with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(quoteData) {
    try {
      const params = {
        records: [{
          Name: quoteData.Name,
          companyId: quoteData.companyId ? parseInt(quoteData.companyId) : null,
          contactId: quoteData.contactId ? parseInt(quoteData.contactId) : null,
          dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
          quoteDate: quoteData.quoteDate,
          status: quoteData.status,
          deliveryMethod: quoteData.deliveryMethod,
          expiresOn: quoteData.expiresOn,
          billingNameTo: quoteData.billingNameTo,
          billingStreet: quoteData.billingStreet,
          billingCity: quoteData.billingCity,
          billingState: quoteData.billingState,
          billingCountry: quoteData.billingCountry,
          billingPincode: quoteData.billingPincode,
          shippingNameTo: quoteData.shippingNameTo,
          shippingStreet: quoteData.shippingStreet,
          shippingCity: quoteData.shippingCity,
          shippingState: quoteData.shippingState,
          shippingCountry: quoteData.shippingCountry,
          shippingPincode: quoteData.shippingPincode,
          Tags: quoteData.Tags
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create quote ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }

        return successfulRecords[0]?.data;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating quote:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async update(id, quoteData) {
    try {
      const params = {
        records: [{
          Id: id,
          Name: quoteData.Name,
          companyId: quoteData.companyId ? parseInt(quoteData.companyId) : null,
          contactId: quoteData.contactId ? parseInt(quoteData.contactId) : null,
          dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
          quoteDate: quoteData.quoteDate,
          status: quoteData.status,
          deliveryMethod: quoteData.deliveryMethod,
          expiresOn: quoteData.expiresOn,
          billingNameTo: quoteData.billingNameTo,
          billingStreet: quoteData.billingStreet,
          billingCity: quoteData.billingCity,
          billingState: quoteData.billingState,
          billingCountry: quoteData.billingCountry,
          billingPincode: quoteData.billingPincode,
          shippingNameTo: quoteData.shippingNameTo,
          shippingStreet: quoteData.shippingStreet,
          shippingCity: quoteData.shippingCity,
          shippingState: quoteData.shippingState,
          shippingCountry: quoteData.shippingCountry,
          shippingPincode: quoteData.shippingPincode,
          Tags: quoteData.Tags
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update quote ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          return null;
        }

        return successfulUpdates[0]?.data;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating quote:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete quote ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          return false;
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting quote:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}

export default new QuoteService();