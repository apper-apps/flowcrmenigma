import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No items found", 
  description = "Get started by creating your first item", 
  actionText = "Create New",
  onAction = null,
  icon = "Package",
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <ApperIcon name={icon} size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default Empty;