import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wifi, MapPin, DollarSign, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface AddWiFiNetworkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface WiFiNetworkFormData {
  name: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  bandwidth: string;
  coverage: string;
  equipmentCost: string;
  monthlyCost: string;
  operatorName: string;
  operatorPhone: string;
  operatorEmail: string;
  description: string;
}

const BANDWIDTH_OPTIONS = [
  { value: '10', label: '10 Mbps' },
  { value: '25', label: '25 Mbps' },
  { value: '50', label: '50 Mbps' },
  { value: '100', label: '100 Mbps' },
  { value: '200', label: '200 Mbps' },
];

const COVERAGE_OPTIONS = [
  { value: '100', label: '100 meters' },
  { value: '200', label: '200 meters' },
  { value: '300', label: '300 meters' },
  { value: '500', label: '500 meters' },
  { value: '1000', label: '1 kilometer' },
];

export function AddWiFiNetworkForm({ open, onOpenChange, onSuccess }: AddWiFiNetworkFormProps) {
  const [formData, setFormData] = useState<WiFiNetworkFormData>({
    name: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    bandwidth: '',
    coverage: '',
    equipmentCost: '',
    monthlyCost: '',
    operatorName: '',
    operatorPhone: '',
    operatorEmail: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof WiFiNetworkFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Network name is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.operatorName.trim()) return 'Operator name is required';
    if (!formData.operatorPhone.trim()) return 'Operator phone is required';
    if (!formData.operatorEmail.trim()) return 'Operator email is required';
    if (!formData.bandwidth) return 'Bandwidth selection is required';
    if (!formData.coverage) return 'Coverage area selection is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.operatorEmail)) {
      return 'Please enter a valid email address';
    }

    // Validate phone format (Pakistani format)
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.operatorPhone)) {
      return 'Please enter a valid Pakistani phone number';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for API
      const networkData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        bandwidth: parseInt(formData.bandwidth),
        coverage: parseInt(formData.coverage),
        equipmentCost: formData.equipmentCost ? parseFloat(formData.equipmentCost) : 0,
        monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : 0,
        operatorName: formData.operatorName.trim(),
        operatorPhone: formData.operatorPhone.trim(),
        operatorEmail: formData.operatorEmail.trim(),
        description: formData.description.trim(),
        status: 'offline', // New networks start offline
        users: 0,
        earnings: 0,
        uptime: 0,
      };

      await localApiClient.createHotspot(networkData);
      
      toast.success('WiFi network registered successfully! Network operator will receive setup instructions via email.');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        bandwidth: '',
        coverage: '',
        equipmentCost: '',
        monthlyCost: '',
        operatorName: '',
        operatorPhone: '',
        operatorEmail: '',
        description: '',
      });
      
    } catch (error: any) {
      console.error('Failed to create WiFi network:', error);
      toast.error(`Failed to register WiFi network: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-emerald-600" />
            Register New WiFi Network
          </DialogTitle>
          <DialogDescription>
            Add a new community WiFi hotspot to the Pakistani DePIN network. Operators earn PKN tokens based on usage and uptime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-4 w-4" />
                Network Information
              </CardTitle>
              <CardDescription>
                Basic details about the WiFi network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Network Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Gulberg Community WiFi"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Area/District *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Gulberg, Lahore"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Complete address with landmarks"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    placeholder="31.5497"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    type="number"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    placeholder="74.3436"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    type="number"
                    step="any"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bandwidth">Bandwidth *</Label>
                  <Select value={formData.bandwidth} onValueChange={(value) => handleInputChange('bandwidth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bandwidth" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANDWIDTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage Area *</Label>
                  <Select value={formData.coverage} onValueChange={(value) => handleInputChange('coverage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coverage" />
                    </SelectTrigger>
                    <SelectContent>
                      {COVERAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Cost Information
              </CardTitle>
              <CardDescription>
                Optional cost details for network economics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentCost">Equipment Cost (PKR)</Label>
                  <Input
                    id="equipmentCost"
                    placeholder="50000"
                    value={formData.equipmentCost}
                    onChange={(e) => handleInputChange('equipmentCost', e.target.value)}
                    type="number"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyCost">Monthly Operating Cost (PKR)</Label>
                  <Input
                    id="monthlyCost"
                    placeholder="5000"
                    value={formData.monthlyCost}
                    onChange={(e) => handleInputChange('monthlyCost', e.target.value)}
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4" />
                Network Operator
              </CardTitle>
              <CardDescription>
                Contact information for the network operator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operatorName">Operator Name *</Label>
                <Input
                  id="operatorName"
                  placeholder="Full name of network operator"
                  value={formData.operatorName}
                  onChange={(e) => handleInputChange('operatorName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operatorPhone">Phone Number *</Label>
                  <Input
                    id="operatorPhone"
                    placeholder="+92 300 1234567"
                    value={formData.operatorPhone}
                    onChange={(e) => handleInputChange('operatorPhone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatorEmail">Email Address *</Label>
                  <Input
                    id="operatorEmail"
                    placeholder="operator@example.com"
                    value={formData.operatorEmail}
                    onChange={(e) => handleInputChange('operatorEmail', e.target.value)}
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Notes</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional information about the network setup..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Registering...' : 'Register Network'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}