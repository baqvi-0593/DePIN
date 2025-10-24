import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Sprout, User, MapPin, Thermometer, Droplets } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface RegisterFarmFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FarmFormData {
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerCnic: string;
  location: string;
  district: string;
  address: string;
  latitude: string;
  longitude: string;
  size: string;
  sizeUnit: string;
  cropType: string;
  irrigationType: string;
  soilType: string;
  farmingType: string;
  experience: string;
  sensorsInterested: string[];
  currentChallenges: string[];
  expectedBenefit: string;
  internetAvailable: boolean;
  powerAvailable: boolean;
  description: string;
}

const PAKISTANI_DISTRICTS = [
  'Lahore', 'Karachi Central', 'Faisalabad', 'Rawalpindi', 'Multan',
  'Gujranwala', 'Peshawar', 'Quetta', 'Islamabad', 'Sialkot',
  'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana', 'Mardan',
  'Kasur', 'Rahim Yar Khan', 'Gujrat', 'Sheikhupura', 'Jhang'
];

const CROP_TYPES = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Potato',
  'Onion', 'Tomato', 'Citrus', 'Mango', 'Date Palm', 'Vegetables',
  'Pulses', 'Oilseeds', 'Fodder Crops', 'Mixed Farming'
];

const IRRIGATION_TYPES = [
  'Canal Irrigation', 'Tube Well', 'Drip Irrigation', 'Sprinkler',
  'Flood Irrigation', 'Furrow Irrigation', 'Rain-fed', 'Mixed'
];

const SOIL_TYPES = [
  'Alluvial', 'Clay', 'Sandy', 'Loamy', 'Saline', 'Desert', 'Black Cotton'
];

const FARMING_TYPES = [
  'Traditional', 'Semi-Modern', 'Modern', 'Organic', 'Precision Agriculture'
];

const EXPERIENCE_LEVELS = [
  'Less than 1 year', '1-5 years', '5-10 years', '10-20 years', '20+ years'
];

const SENSOR_TYPES = [
  'Soil Moisture', 'Temperature & Humidity', 'pH Level', 'Nutrient Monitoring',
  'Weather Station', 'Pest Detection', 'Crop Health Monitoring', 'Water Level'
];

const FARMING_CHALLENGES = [
  'Water Scarcity', 'Pest Control', 'Disease Management', 'Weather Prediction',
  'Soil Health', 'Fertilizer Management', 'Crop Planning', 'Market Access',
  'Storage Issues', 'Labor Shortage', 'Equipment Maintenance', 'Financial Planning'
];

const SIZE_UNITS = [
  { value: 'acres', label: 'Acres' },
  { value: 'hectares', label: 'Hectares' },
  { value: 'kanals', label: 'Kanals' },
  { value: 'marlas', label: 'Marlas' }
];

export function RegisterFarmForm({ open, onOpenChange, onSuccess }: RegisterFarmFormProps) {
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerCnic: '',
    location: '',
    district: '',
    address: '',
    latitude: '',
    longitude: '',
    size: '',
    sizeUnit: 'acres',
    cropType: '',
    irrigationType: '',
    soilType: '',
    farmingType: '',
    experience: '',
    sensorsInterested: [],
    currentChallenges: [],
    expectedBenefit: '',
    internetAvailable: false,
    powerAvailable: false,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FarmFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'sensorsInterested' | 'currentChallenges', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Farm name is required';
    if (!formData.ownerName.trim()) return 'Owner name is required';
    if (!formData.ownerPhone.trim()) return 'Phone number is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.district) return 'District selection is required';
    if (!formData.size.trim()) return 'Farm size is required';
    if (!formData.cropType) return 'Crop type is required';
    if (!formData.irrigationType) return 'Irrigation type is required';
    if (!formData.farmingType) return 'Farming type is required';
    if (!formData.experience) return 'Experience level is required';
    
    // Validate phone format (Pakistani format)
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.ownerPhone)) {
      return 'Please enter a valid Pakistani phone number';
    }

    // Validate email if provided
    if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      return 'Please enter a valid email address';
    }

    // Validate CNIC if provided
    if (formData.ownerCnic && !/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(formData.ownerCnic)) {
      return 'Please enter a valid CNIC (e.g., 12345-1234567-1)';
    }

    // Validate farm size is positive number
    if (parseFloat(formData.size) <= 0) {
      return 'Farm size must be a positive number';
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
      const farmData = {
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerCnic: formData.ownerCnic.trim(),
        location: formData.location.trim(),
        district: formData.district,
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
        cropType: formData.cropType,
        irrigationType: formData.irrigationType,
        soilType: formData.soilType,
        farmingType: formData.farmingType,
        experience: formData.experience,
        sensorsInterested: formData.sensorsInterested,
        currentChallenges: formData.currentChallenges,
        expectedBenefit: formData.expectedBenefit.trim(),
        internetAvailable: formData.internetAvailable,
        powerAvailable: formData.powerAvailable,
        description: formData.description.trim(),
        sensors: 0, // New farms start with 0 sensors
        lastUpdate: new Date().toISOString(),
        earnings: 0,
      };

      await localApiClient.createFarm(farmData);
      
      toast.success('Farm registered successfully! Our team will contact you for sensor installation planning.');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        ownerCnic: '',
        location: '',
        district: '',
        address: '',
        latitude: '',
        longitude: '',
        size: '',
        sizeUnit: 'acres',
        cropType: '',
        irrigationType: '',
        soilType: '',
        farmingType: '',
        experience: '',
        sensorsInterested: [],
        currentChallenges: [],
        expectedBenefit: '',
        internetAvailable: false,
        powerAvailable: false,
        description: '',
      });
      
    } catch (error: any) {
      console.error('Failed to register farm:', error);
      toast.error(`Failed to register farm: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            Register Farm for Agriculture Monitoring
          </DialogTitle>
          <DialogDescription>
            Join the Pakistani DePIN agriculture network. Install sensors to monitor your farm and earn PKN tokens for sharing valuable agricultural data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sprout className="h-4 w-4" />
                Farm Information
              </CardTitle>
              <CardDescription>
                Basic details about your farm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Farm Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Green Valley Farm"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Village/Area *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Chak No. 123, Tehsil XYZ"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAKISTANI_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  placeholder="Full address with nearby landmarks"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Farm Size *</Label>
                  <Input
                    id="size"
                    placeholder="e.g., 10"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizeUnit">Unit</Label>
                  <Select value={formData.sizeUnit} onValueChange={(value) => handleInputChange('sizeUnit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropType">Primary Crop *</Label>
                  <Select value={formData.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Farm Owner Information
              </CardTitle>
              <CardDescription>
                Contact details of the farm owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="Muhammad Ahmed Khan"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerCnic">CNIC (Optional)</Label>
                  <Input
                    id="ownerCnic"
                    placeholder="12345-1234567-1"
                    value={formData.ownerCnic}
                    onChange={(e) => handleInputChange('ownerCnic', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Phone Number *</Label>
                  <Input
                    id="ownerPhone"
                    placeholder="+92 300 1234567"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email Address (Optional)</Label>
                  <Input
                    id="ownerEmail"
                    placeholder="farmer@example.com"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    type="email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farming Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="h-4 w-4" />
                Farming Details
              </CardTitle>
              <CardDescription>
                Technical details about your farming practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="irrigationType">Irrigation Type *</Label>
                  <Select value={formData.irrigationType} onValueChange={(value) => handleInputChange('irrigationType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select irrigation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {IRRIGATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOIL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmingType">Farming Type *</Label>
                  <Select value={formData.farmingType} onValueChange={(value) => handleInputChange('farmingType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select farming type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FARMING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Farming Experience *</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internetAvailable"
                    checked={formData.internetAvailable}
                    onCheckedChange={(checked) => handleInputChange('internetAvailable', checked as boolean)}
                  />
                  <Label htmlFor="internetAvailable">
                    Internet connectivity available at farm
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="powerAvailable"
                    checked={formData.powerAvailable}
                    onCheckedChange={(checked) => handleInputChange('powerAvailable', checked as boolean)}
                  />
                  <Label htmlFor="powerAvailable">
                    Reliable power supply available
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensors & Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="h-4 w-4" />
                Sensor Interest & Current Challenges
              </CardTitle>
              <CardDescription>
                Tell us about your monitoring needs and challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sensors of Interest (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SENSOR_TYPES.map((sensor) => (
                    <div key={sensor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensor-${sensor}`}
                        checked={formData.sensorsInterested.includes(sensor)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('sensorsInterested', sensor, checked as boolean)
                        }
                      />
                      <Label htmlFor={`sensor-${sensor}`} className="text-sm">
                        {sensor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Farming Challenges (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FARMING_CHALLENGES.map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        id={`challenge-${challenge}`}
                        checked={formData.currentChallenges.includes(challenge)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('currentChallenges', challenge, checked as boolean)
                        }
                      />
                      <Label htmlFor={`challenge-${challenge}`} className="text-sm">
                        {challenge}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedBenefit">Expected Benefits from Sensor Monitoring</Label>
                <Textarea
                  id="expectedBenefit"
                  placeholder="Describe what you hope to achieve with sensor monitoring..."
                  value={formData.expectedBenefit}
                  onChange={(e) => handleInputChange('expectedBenefit', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Information</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional information about your farm or special requirements..."
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Registering...' : 'Register Farm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}