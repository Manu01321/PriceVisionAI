import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { saveUser } from '../../../utils/auth';

const inputCls =
  'w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

const ProfileHeader = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    saveUser(form);
    onUpdateProfile(form);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-border">
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-soft border-4 border-white">
            <span className="text-white text-3xl font-bold">{initial}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full border-2 border-white flex items-center justify-center">
            <Icon name="Check" size={12} color="white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Full Name', type: 'text', icon: 'User' },
                  { field: 'email', label: 'Email', type: 'email', icon: 'Mail' },
                  { field: 'phone', label: 'Phone', type: 'tel', icon: 'Phone' },
                  { field: 'location', label: 'Location', type: 'text', icon: 'MapPin' }
                ].map(({ field, label, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleSave} iconName="Check" iconPosition="left">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {user?.name || 'Guest User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Member since {user?.memberSince || 'Today'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  iconName="Edit"
                  iconPosition="left"
                >
                  Edit Profile
                </Button>
              </div>
              {saved && (
                <p className="text-xs text-success flex items-center gap-1 mb-2">
                  <Icon name="CheckCircle" size={12} /> Profile saved successfully
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  { icon: 'Mail', label: 'Email', value: user?.email },
                  { icon: 'Phone', label: 'Phone', value: user?.phone || 'Not set' },
                  { icon: 'MapPin', label: 'Location', value: user?.location || 'Not set' },
                  { icon: 'Calendar', label: 'Member since', value: user?.memberSince || 'Today' }
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center space-x-2">
                    <Icon name={icon} size={15} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="text-foreground truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">₹{user?.totalSavings || '0'}</div>
            <div className="text-xs text-muted-foreground">Total Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{user?.dealsFound || 0}</div>
            <div className="text-xs text-muted-foreground">Deals Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{user?.watchlistItems || 0}</div>
            <div className="text-xs text-muted-foreground">Watchlist</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
