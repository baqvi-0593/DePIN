import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Heart, Building2, Activity, Pill } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface RegisterHealthcareProviderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface HealthcareProviderFormData {
  name: string;
  type: string;
  location: string;
  address: string;
  license: string;
  capacity: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
}

const PROVIDER_TYPES = [
  { value: 'hospital', label: 'Hospital', icon: Building2 },
  { value: 'clinic', label: 'Clinic', icon: Heart },
  { value: 'diagnostic_center', label: 'Diagnostic Center', icon: Activity },
  { value: 'pharmacy', label: 'Pharmacy', icon: Pill },
];

export function RegisterHealthcareProviderForm({ open, onOpenChange, onSuccess }: RegisterHealthcareProviderFormProps) {
  const [formData, setFormData] = useState<HealthcareProviderFormData>({
    name: '',
    type: '',
    location: '',
    address: '',
    license: '',
    capacity: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof HealthcareProviderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Provider name is required';
    if (!formData.type) return 'Provider type selection is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.license.trim()) return 'License number is required';
    if (!formData.capacity.trim()) return 'Capacity is required';
    if (!formData.contactPerson.trim()) return 'Contact person name is required';
    if (!formData.contactEmail.trim()) return 'Contact email is required';
    if (!formData.contactPhone.trim()) return 'Contact phone is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }

    // Validate phone format (Pakistani format)
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      return 'Please enter a valid Pakistani phone number';
    }

    // Validate capacity is a number
    if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      return 'Capacity must be a positive number';
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
      const providerData = {
        name: formData.name.trim(),
        type: formData.type,
        location: formData.location.trim(),
        address: formData.address.trim(),
        license: formData.license.trim(),
        capacity: parseInt(formData.capacity),
        contactPerson: formData.contactPerson.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        description: formData.description.trim(),
        status: 'pending', // Requires verification
      };

      await localApiClient.createHealthcareProvider(providerData);
      
      toast.success('Healthcare provider registered successfully! You earned 100 BUILD tokens 🎉');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        location: '',
        address: '',
        license: '',
        capacity: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        description: '',
      });
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600" />
            Register Healthcare Provider
          </DialogTitle>
          <DialogDescription>
            Register your hospital, clinic, or diagnostic center to join Pakistan's decentralized healthcare data network.
            Earn 100 BUILD tokens upon registration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Information */}
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Provider Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Provider Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Shaukat Khanum Hospital"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="type">Provider Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">City/Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Lahore, Punjab"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="license">License Number *</Label>
                  <Input
                    id="license"
                    placeholder="e.g., PMA-LHR-001234"
                    value={formData.license}
                    onChange={(e) => handleInputChange('license', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Full address of the healthcare facility"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="capacity">Daily Capacity (patients/day) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 200"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Average number of patients that can be handled per day
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person Name *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Full name of administrator"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="email@hospital.pk"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+92-300-1234567"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of services and specialties"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Rewards Info */}
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <h3 className="font-semibold mb-2">BUILD Token Rewards</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ 100 BUILD tokens for provider registration</li>
              <li>✓ 10 BUILD tokens per anonymized data record submitted</li>
              <li>✓ Contribute to medical research while maintaining privacy</li>
              <li>✓ Access aggregated health insights from the network</li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Provider'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
