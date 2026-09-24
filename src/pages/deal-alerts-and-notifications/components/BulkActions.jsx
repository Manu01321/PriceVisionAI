import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';


const BulkActions = ({ selectedAlerts, onBulkAction, totalAlerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const actionOptions = [
    { value: '', label: 'Select action...' },
    { value: 'mark_read', label: 'Mark as Read' },
    { value: 'mark_unread', label: 'Mark as Unread' },
    { value: 'archive', label: 'Archive' },
    { value: 'delete', label: 'Delete' },
    { value: 'change_priority', label: 'Change Priority' },
    { value: 'export', label: 'Export to CSV' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const [newPriority, setNewPriority] = useState('medium');

  const handleBulkAction = async () => {
    if (!bulkActionType || selectedAlerts?.length === 0) return;

    setIsProcessing(true);
    
    try {
      const actionData = {
        type: bulkActionType,
        alertIds: selectedAlerts,
        ...(bulkActionType === 'change_priority' && { priority: newPriority })
      };

      if (onBulkAction) {
        await onBulkAction(actionData);
      }

      // Reset after successful action
      setBulkActionType('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'mark_read':
        return 'Check';
      case 'mark_unread':
        return 'Mail';
      case 'archive':
        return 'Archive';
      case 'delete':
        return 'Trash2';
      case 'change_priority':
        return 'Flag';
      case 'export':
        return 'Download';
      default:
        return 'Settings';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'delete':
        return 'text-error';
      case 'archive':
        return 'text-warning';
      case 'mark_read':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  if (selectedAlerts?.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="CheckSquare" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">
              {selectedAlerts?.length} of {totalAlerts} alerts selected
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setBulkActionType('mark_read');
            handleBulkAction();
          }}
          disabled={isProcessing}
          iconName="Check"
          iconPosition="left"
        >
          Mark Read
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setBulkActionType('archive');
            handleBulkAction();
          }}
          disabled={isProcessing}
          iconName="Archive"
          iconPosition="left"
        >
          Archive
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setBulkActionType('export');
            handleBulkAction();
          }}
          disabled={isProcessing}
          iconName="Download"
          iconPosition="left"
        >
          Export
        </Button>
      </div>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Bulk Action"
              options={actionOptions}
              value={bulkActionType}
              onChange={setBulkActionType}
            />

            {bulkActionType === 'change_priority' && (
              <Select
                label="New Priority"
                options={priorityOptions}
                value={newPriority}
                onChange={setNewPriority}
              />
            )}
          </div>

          {/* Action Preview */}
          {bulkActionType && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon 
                  name={getActionIcon(bulkActionType)} 
                  size={16} 
                  className={getActionColor(bulkActionType)} 
                />
                <span className="text-sm font-medium text-foreground">Action Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This will {bulkActionType?.replace('_', ' ')} {selectedAlerts?.length} selected alert{selectedAlerts?.length !== 1 ? 's' : ''}.
                {bulkActionType === 'delete' && ' This action cannot be undone.'}
                {bulkActionType === 'change_priority' && ` Priority will be set to ${newPriority}.`}
              </p>
            </div>
          )}

          {/* Execute Button */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkActionType('');
                setIsExpanded(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              variant={bulkActionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={!bulkActionType || isProcessing}
              loading={isProcessing}
              iconName={getActionIcon(bulkActionType)}
              iconPosition="left"
            >
              {isProcessing ? 'Processing...' : `Apply to ${selectedAlerts?.length} alerts`}
            </Button>
          </div>
        </div>
      )}
      {/* Selection Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Selected: {selectedAlerts?.length} alerts
          </span>
          <div className="flex items-center space-x-4">
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={() => onBulkAction && onBulkAction({ type: 'select_all' })}
            >
              Select All
            </button>
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onBulkAction && onBulkAction({ type: 'clear_selection' })}
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;