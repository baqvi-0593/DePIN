import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Truck, User, MapPin, Package, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface AddLogisticsPartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface LogisticsPartnerFormData {
  name: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  city: string;
  vehicle: string;
  vehicleRegistration: string;
  vehicleYear: string;
  license: string;
  experience: string;
  serviceAreas: string[];
  availability: string[];
  emergencyContact: string;
  emergencyPhone: string;
  bankAccount: string;
  bankName: string;
  description: string;
}

const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
  { value: 'pickup', label: 'Pickup Truck' },
  { value: 'truck', label: 'Truck' },
  { value: 'bicycle', label: 'Bicycle' },
];

const EXPERIENCE_LEVELS = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5+', label: '5+ years' },
];

const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
];

const SERVICE_AREAS = [
  'Food Delivery', 'E-commerce', 'Pharmaceuticals', 'Documents',
  'Electronics', 'Groceries', 'Fashion', 'Books', 'Auto Parts'
];

const AVAILABILITY_SLOTS = [
  'Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 
  'Evening (6 PM - 10 PM)', 'Night (10 PM - 6 AM)', 
  'Weekends Only', '24/7 Available'
];

export function AddLogisticsPartnerForm({ open, onOpenChange, onSuccess }: AddLogisticsPartnerFormProps) {
  const [formData, setFormData] = useState<LogisticsPartnerFormData>({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    city: '',
    vehicle: '',
    vehicleRegistration: '',
    vehicleYear: '',
    license: '',
    experience: '',
    serviceAreas: [],
    availability: [],
    emergencyContact: '',
    emergencyPhone: '',
    bankAccount: '',
    bankName: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof LogisticsPartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'serviceAreas' | 'availability', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.cnic.trim()) return 'CNIC is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city) return 'City selection is required';
    if (!formData.vehicle) return 'Vehicle type is required';
    if (!formData.vehicleRegistration.trim()) return 'Vehicle registration is required';
    if (!formData.license.trim()) return 'License number is required';
    if (!formData.experience) return 'Experience level is required';
    if (formData.serviceAreas.length === 0) return 'At least one service area is required';
    if (formData.availability.length === 0) return 'At least one availability slot is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Validate phone format (Pakistani format)
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      return 'Please enter a valid Pakistani phone number';
    }

    // Validate CNIC format
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    if (!cnicRegex.test(formData.cnic)) {
      return 'Please enter a valid CNIC (e.g., 12345-1234567-1)';
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
      const partnerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
        address: formData.address.trim(),
        city: formData.city,
        vehicle: formData.vehicle,
        vehicleRegistration: formData.vehicleRegistration.trim(),
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
        license: formData.license.trim(),
        experience: formData.experience,
        serviceAreas: formData.serviceAreas,
        availability: formData.availability,
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        bankAccount: formData.bankAccount.trim(),
        bankName: formData.bankName.trim(),
        description: formData.description.trim(),
        status: 'inactive', // New partners start inactive until verification
        rating: 0,
        deliveries: 0,
        earnings: 0,
      };

      await localApiClient.createDeliveryPartner(partnerData);
      
      toast.success('Logistics partner registered successfully! Verification process will begin shortly.');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cnic: '',
        address: '',
        city: '',
        vehicle: '',
        vehicleRegistration: '',
        vehicleYear: '',
        license: '',
        experience: '',
        serviceAreas: [],
        availability: [],
        emergencyContact: '',
        emergencyPhone: '',
        bankAccount: '',
        bankName: '',
        description: '',
      });
      
    } catch (error: any) {
      console.error('Failed to create logistics partner:', error);
      toast.error(`Failed to register logistics partner: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Register Logistics Partner
          </DialogTitle>
          <DialogDescription>
            Join the Pakistani DePIN logistics network as a delivery partner. Earn PKN tokens for data collection and delivery services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Basic personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Muhammad Ali Khan"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC *</Label>
                  <Input
                    id="cnic"
                    placeholder="12345-1234567-1"
                    value={formData.cnic}
                    onChange={(e) => handleInputChange('cnic', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    placeholder="partner@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Complete address with area and landmarks"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTANI_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-4 w-4" />
                Vehicle Information
              </CardTitle>
              <CardDescription>
                Details about your delivery vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Type *</Label>
                  <Select value={formData.vehicle} onValueChange={(value) => handleInputChange('vehicle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((vehicle) => (
                        <SelectItem key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleRegistration">Registration Number *</Label>
                  <Input
                    id="vehicleRegistration"
                    placeholder="ABC-123"
                    value={formData.vehicleRegistration}
                    onChange={(e) => handleInputChange('vehicleRegistration', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Vehicle Year</Label>
                  <Input
                    id="vehicleYear"
                    placeholder="2020"
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                    type="number"
                    min="1990"
                    max="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number *</Label>
                  <Input
                    id="license"
                    placeholder="License number"
                    value={formData.license}
                    onChange={(e) => handleInputChange('license', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience *</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-4 w-4" />
                Service Areas & Availability
              </CardTitle>
              <CardDescription>
                Choose your preferred service areas and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Areas * (Select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SERVICE_AREAS.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${area}`}
                        checked={formData.serviceAreas.includes(area)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('serviceAreas', area, checked as boolean)
                        }
                      />
                      <Label htmlFor={`service-${area}`} className="text-sm">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability * (Select at least one)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {AVAILABILITY_SLOTS.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={`availability-${slot}`}
                        checked={formData.availability.includes(slot)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('availability', slot, checked as boolean)
                        }
                      />
                      <Label htmlFor={`availability-${slot}`} className="text-sm">
                        {slot}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency & Banking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4" />
                Emergency Contact & Banking
              </CardTitle>
              <CardDescription>
                Emergency contact and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Emergency contact person"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    placeholder="+92 300 1234567"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., HBL, UBL, MCB"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Account number for payments"
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Information</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional information or special requirements..."
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Registering...' : 'Register Partner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}