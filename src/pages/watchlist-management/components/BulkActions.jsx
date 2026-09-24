import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActions = ({ 
  selectedItems = [], 
  onSelectAll, 
  onDeselectAll, 
  onBulkRemove, 
  onBulkCategoryChange, 
  onBulkAlertChange,
  onExport,
  totalItems = 0,
  className = "" 
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkAlertThreshold, setBulkAlertThreshold] = useState('');

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports & Outdoors' }
  ];

  const alertThresholdOptions = [
    { value: '5', label: '5% price drop' },
    { value: '10', label: '10% price drop' },
    { value: '15', label: '15% price drop' },
    { value: '20', label: '20% price drop' },
    { value: '25', label: '25% price drop' }
  ];

  const exportOptions = [
    { value: 'csv', label: 'Export as CSV' },
    { value: 'pdf', label: 'Export as PDF' },
    { value: 'json', label: 'Export as JSON' }
  ];

  const handleBulkCategoryChange = () => {
    if (bulkCategory && onBulkCategoryChange) {
      onBulkCategoryChange(selectedItems, bulkCategory);
      setBulkCategory('');
      setIsActionsOpen(false);
    }
  };

  const handleBulkAlertChange = () => {
    if (bulkAlertThreshold && onBulkAlertChange) {
      onBulkAlertChange(selectedItems, bulkAlertThreshold);
      setBulkAlertThreshold('');
      setIsActionsOpen(false);
    }
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(selectedItems?.length > 0 ? selectedItems : 'all', format);
    }
    setIsActionsOpen(false);
  };

  const isAllSelected = selectedItems?.length === totalItems && totalItems > 0;
  const isPartiallySelected = selectedItems?.length > 0 && selectedItems?.length < totalItems;

  return (
    <div className={`bg-surface border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Selection Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onChange={(e) => {
                if (e?.target?.checked) {
                  onSelectAll();
                } else {
                  onDeselectAll();
                }
              }}
            />
            <span className="text-sm text-foreground">
              {selectedItems?.length > 0 
                ? `${selectedItems?.length} of ${totalItems} selected`
                : `Select all ${totalItems} items`
              }
            </span>
          </div>

          {selectedItems?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={onDeselectAll}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {selectedItems?.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                iconName="Settings"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
              >
                Bulk Actions
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                iconName="Trash2"
                onClick={() => onBulkRemove(selectedItems)}
              >
                Remove Selected
              </Button>
            </>
          )}

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      {/* Expanded Actions */}
      {isActionsOpen && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bulk Category Change */}
            {selectedItems?.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Change Category</label>
                <div className="flex space-x-2">
                  <Select
                    options={categoryOptions}
                    value={bulkCategory}
                    onChange={setBulkCategory}
                    placeholder="Select category"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkCategoryChange}
                    disabled={!bulkCategory}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {/* Bulk Alert Threshold */}
            {selectedItems?.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Alert Threshold</label>
                <div className="flex space-x-2">
                  <Select
                    options={alertThresholdOptions}
                    value={bulkAlertThreshold}
                    onChange={setBulkAlertThreshold}
                    placeholder="Select threshold"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkAlertChange}
                    disabled={!bulkAlertThreshold}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {/* Export Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Export Format</label>
              <div className="space-y-2">
                {exportOptions?.map((option) => (
                  <Button
                    key={option?.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(option?.value)}
                    className="w-full justify-start"
                  >
                    {option?.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {selectedItems?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground mr-2">Quick actions:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAlertChange(selectedItems, '10')}
                >
                  Set 10% Alert
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkCategoryChange(selectedItems, 'electronics')}
                >
                  Move to Electronics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  Quick CSV Export
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActions;