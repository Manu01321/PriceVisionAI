import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const SecuritySettings = ({ securityData, onUpdateSecurity }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(securityData?.twoFactorEnabled);

  const loginHistory = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      timestamp: "2025-10-26 14:30:00",
      ipAddress: "192.168.1.100",
      status: "success"
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, NY",
      timestamp: "2025-10-26 09:15:00",
      ipAddress: "192.168.1.101",
      status: "success"
    },
    {
      id: 3,
      device: "Chrome on Android",
      location: "Boston, MA",
      timestamp: "2025-10-25 18:45:00",
      ipAddress: "10.0.0.50",
      status: "failed"
    }
  ];

  const connectedDevices = [
    {
      id: 1,
      name: "MacBook Pro",
      type: "desktop",
      lastActive: "Currently active",
      location: "New York, NY",
      isCurrent: true
    },
    {
      id: 2,
      name: "iPhone 15 Pro",
      type: "mobile",
      lastActive: "2 hours ago",
      location: "New York, NY",
      isCurrent: false
    },
    {
      id: 3,
      name: "iPad Air",
      type: "tablet",
      lastActive: "1 day ago",
      location: "New York, NY",
      isCurrent: false
    }
  ];

  const handlePasswordChange = () => {
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onUpdateSecurity({ type: 'password', data: passwordData });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(false);
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    onUpdateSecurity({ type: 'twoFactor', enabled: !twoFactorEnabled });
  };

  const handleDeviceRemove = (deviceId) => {
    onUpdateSecurity({ type: 'removeDevice', deviceId });
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'desktop': return 'Monitor';
      case 'mobile': return 'Smartphone';
      case 'tablet': return 'Tablet';
      default: return 'Monitor';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleDateString() + ' at ' + date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
          <Icon name="Shield" size={18} className="text-error" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
      </div>
      <div className="space-y-8">
        {/* Password Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground">Password</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePassword(!showChangePassword)}
              iconName="Key"
              iconPosition="left"
            >
              Change Password
            </Button>
          </div>

          {showChangePassword && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData?.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData?.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData?.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handlePasswordChange} iconName="Check" iconPosition="left">
                  Update Password
                </Button>
                <Button variant="outline" onClick={() => setShowChangePassword(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Two-Factor Authentication</h4>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                twoFactorEnabled ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <Icon 
                  name={twoFactorEnabled ? "ShieldCheck" : "ShieldAlert"} 
                  size={18} 
                  className={twoFactorEnabled ? 'text-success' : 'text-warning'} 
                />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {twoFactorEnabled 
                    ? 'Your account is protected with 2FA' :'Add an extra layer of security to your account'
                  }
                </div>
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? "outline" : "default"}
              size="sm"
              onClick={handleTwoFactorToggle}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        {/* Connected Devices */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Connected Devices</h4>
          <div className="space-y-3">
            {connectedDevices?.map((device) => (
              <div key={device?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={getDeviceIcon(device?.type)} size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{device?.name}</span>
                      {device?.isCurrent && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {device?.lastActive} • {device?.location}
                    </div>
                  </div>
                </div>
                {!device?.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeviceRemove(device?.id)}
                    iconName="X"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Login History */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Recent Login Activity</h4>
          <div className="space-y-3">
            {loginHistory?.map((login) => (
              <div key={login?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    login?.status === 'success' ? 'bg-success/10' : 'bg-error/10'
                  }`}>
                    <Icon 
                      name={login?.status === 'success' ? "CheckCircle" : "XCircle"} 
                      size={16} 
                      className={login?.status === 'success' ? 'text-success' : 'text-error'} 
                    />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{login?.device}</div>
                    <div className="text-sm text-muted-foreground">
                      {login?.location} • {formatTimestamp(login?.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{login?.ipAddress}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={18} className="text-primary mt-0.5" />
            <div>
              <h5 className="font-medium text-foreground mb-2">Security Recommendations</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use a strong, unique password for your account</li>
                <li>• Enable two-factor authentication for added security</li>
                <li>• Regularly review your connected devices and login history</li>
                <li>• Log out from devices you no longer use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;