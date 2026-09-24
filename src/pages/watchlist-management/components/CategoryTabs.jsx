import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CategoryTabs = ({
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  onAddCategory,
  onEditCategory
}) => {
  const defaultCategories = [
    { id: 'all', name: 'All Items', count: 24, icon: 'Grid3X3' },
    { id: 'electronics', name: 'Electronics', count: 12, icon: 'Smartphone' },
    { id: 'fashion', name: 'Fashion', count: 8, icon: 'Shirt' },
    { id: 'home', name: 'Home & Garden', count: 4, icon: 'Home' }
  ];

  const categoryList = categories?.length > 0 ? categories : defaultCategories;

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <Button
          variant="outline"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={onAddCategory}
        >
          Add Category
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categoryList?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
              ${
                activeCategory === category?.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }
            `}
          >
            <Icon name={category?.icon} size={16} />
            <span className="font-medium">{category?.name}</span>
            <div
              className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${
                activeCategory === category?.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            `}
            >
              {category?.count}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Drag to reorder categories</span>
        <button
          onClick={onEditCategory}
          className="flex items-center space-x-1 hover:text-foreground transition-colors"
        >
          <Icon name="Settings" size={14} />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryTabs;
