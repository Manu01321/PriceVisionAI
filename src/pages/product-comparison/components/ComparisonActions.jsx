import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ComparisonActions = ({
  selectedProducts,
  onExportComparison,
  onSaveComparison,
  onShareComparison,
  onClearAll,
  onAddProduct
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await onExportComparison(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveComparison();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = (platform) => {
    onShareComparison(platform);
    setShowShareMenu(false);
  };

  const shareOptions = [
    { id: 'link', label: 'Copy Link', icon: 'Link' },
    { id: 'email', label: 'Email', icon: 'Mail' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
    { id: 'twitter', label: 'Twitter', icon: 'Twitter' },
    { id: 'facebook', label: 'Facebook', icon: 'Facebook' }
  ];

  const exportFormats = [
    { id: 'pdf', label: 'PDF Report', icon: 'FileText' },
    { id: 'excel', label: 'Excel Sheet', icon: 'FileSpreadsheet' },
    { id: 'csv', label: 'CSV Data', icon: 'Database' },
    { id: 'image', label: 'Image', icon: 'Image' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Comparison Actions</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedProducts?.length} product{selectedProducts?.length !== 1 ? 's' : ''} selected
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-foreground">{selectedProducts?.length}</div>
          <div className="text-xs text-muted-foreground">Products</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-success">
            ₹
            {selectedProducts?.length
              ? Math.min(
                  ...selectedProducts.map((p) => Number(p?.currentPrice || 0))
                ).toLocaleString('en-IN')
              : 0}
          </div>
          <div className="text-xs text-muted-foreground">Lowest Price</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-error">
            ₹
            {selectedProducts?.length
              ? Math.max(
                  ...selectedProducts.map((p) => Number(p?.currentPrice || 0))
                ).toLocaleString('en-IN')
              : 0}
          </div>
          <div className="text-xs text-muted-foreground">Highest Price</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-warning">
            {selectedProducts?.length
              ? Math.round(
                  selectedProducts.reduce(
                    (sum, p) => sum + Number(p?.aiScores?.value || p?.confidence || 85),
                    0
                  ) / selectedProducts.length
                )
              : 0}
          </div>
          <div className="text-xs text-muted-foreground">Avg AI Score</div>
        </div>
      </div>
      {/* Primary Actions */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="default"
            onClick={onAddProduct}
            iconName="Plus"
            iconPosition="left"
            className="w-full"
          >
            Add Product
          </Button>

          <Button
            variant="outline"
            onClick={handleSave}
            loading={isSaving}
            iconName="Save"
            iconPosition="left"
            className="w-full"
            disabled={selectedProducts?.length === 0}
          >
            Save Comparison
          </Button>
        </div>

        {/* Export Options */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Export Comparison</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {exportFormats?.map((format) => (
              <Button
                key={format?.id}
                variant="ghost"
                size="sm"
                onClick={() => handleExport(format?.id)}
                loading={isExporting}
                iconName={format?.icon}
                iconPosition="left"
                className="text-xs justify-start"
                disabled={selectedProducts?.length === 0}
              >
                {format?.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Share Comparison</div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowShareMenu(!showShareMenu)}
              iconName="Share"
              iconPosition="left"
              className="w-full"
              disabled={selectedProducts?.length === 0}
            >
              Share Comparison
            </Button>

            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-200" onClick={() => setShowShareMenu(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-elevated z-300 animate-slide-up">
                  <div className="py-2">
                    {shareOptions?.map((option) => (
                      <button
                        key={option?.id}
                        onClick={() => handleShare(option?.id)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name={option?.icon} size={16} />
                        <span>{option?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            iconName="Trash2"
            iconPosition="left"
            className="text-error hover:text-error hover:bg-error/10"
            disabled={selectedProducts?.length === 0}
          >
            Clear All
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            iconPosition="left"
            className="text-muted-foreground"
          >
            Refresh Prices
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconName="Filter"
            iconPosition="left"
            className="text-muted-foreground"
          >
            Filter Results
          </Button>
        </div>
      </div>
      {/* AI Insights */}
      {selectedProducts?.length > 1 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Brain" size={16} className="text-accent" />
            <h4 className="font-medium text-foreground">AI Comparison Insights</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <Icon name="TrendingUp" size={14} className="text-success mt-0.5" />
              <span className="text-muted-foreground">
                Best value:{' '}
                {selectedProducts
                  ?.reduce((best, product) =>
                    product?.aiScores?.value > best?.aiScores?.value ? product : best
                  )
                  ?.name?.split(' ')
                  ?.slice(0, 2)
                  ?.join(' ')}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <Icon name="DollarSign" size={14} className="text-primary mt-0.5" />
              <span className="text-muted-foreground">
                Price difference: ₹
                {Math.max(...selectedProducts?.map((p) => p?.currentPrice)) -
                  Math.min(...selectedProducts?.map((p) => p?.currentPrice))}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <Icon name="Clock" size={14} className="text-warning mt-0.5" />
              <span className="text-muted-foreground">
                Best time to buy: Wait 2-3 weeks for seasonal discounts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonActions;
