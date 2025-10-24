import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { CheckCircle, Circle, Wifi, Truck, Sprout, DollarSign, Shield, Users, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface PartnerOnboardingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const pakistaniCities = [
  'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Peshawar',
  'Multan', 'Hyderabad', 'Islamabad', 'Quetta', 'Bahawalpur', 'Sargodha',
  'Sialkot', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur'
];

const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'];

export function PartnerOnboardingForm({ open, onOpenChange, onSuccess }: PartnerOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    city: '',
    province: '',
    
    // Partnership Type
    partnershipType: '', // 'wifi', 'logistics', 'agriculture', 'multi'
    
    // Business Information
    businessName: '',
    businessType: '',
    experience: '',
    monthlyInvestment: '',
    expectedEarnings: '',
    
    // WiFi Network Details
    wifiExperience: '',
    technicalSkills: [],
    equipmentOwnership: '',
    coverageAreas: [],
    internetProvider: '',
    
    // Logistics Details
    vehicleType: '',
    vehicleRegistration: '',
    licenseType: '',
    deliveryExperience: '',
    serviceAreas: [],
    availableHours: [],
    
    // Agriculture Details
    farmSize: '',
    farmSizeUnit: 'acres',
    cropTypes: [],
    farmingExperience: '',
    irrigationType: '',
    sensorInterest: [],
    landOwnership: '',
    
    // Financial & Commitment
    walletAddress: '',
    monthlyCommitment: '',
    growthPlan: '',
    referralSource: '',
    
    // Agreements
    termsAgreed: false,
    dataSharing: false,
    marketingConsent: false,
    backgroundCheck: false,
  });

  const steps = [
    { id: 0, title: 'Personal Info', icon: Users },
    { id: 1, title: 'Partnership Type', icon: Star },
    { id: 2, title: 'Business Details', icon: DollarSign },
    { id: 3, title: 'Technical Setup', icon: Shield },
    { id: 4, title: 'Commitment', icon: CheckCircle },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? prev[field as keyof typeof prev].filter((item: string) => item !== value)
        : [...prev[field as keyof typeof prev], value]
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return formData.fullName && formData.email && formData.phone && formData.city;
      case 1:
        return formData.partnershipType;
      case 2:
        return formData.businessName && formData.experience && formData.monthlyInvestment;
      case 3:
        if (formData.partnershipType === 'wifi') {
          return formData.technicalSkills.length > 0 && formData.equipmentOwnership;
        } else if (formData.partnershipType === 'logistics') {
          return formData.vehicleType && formData.licenseType && formData.serviceAreas.length > 0;
        } else if (formData.partnershipType === 'agriculture') {
          return formData.farmSize && formData.cropTypes.length > 0 && formData.sensorInterest.length > 0;
        }
        return true;
      case 4:
        return formData.termsAgreed && formData.dataSharing;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields before continuing');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      // Submit different applications based on partnership type
      if (formData.partnershipType === 'wifi' || formData.partnershipType === 'multi') {
        await localApiClient.createHotspot({
          name: `${formData.businessName} - ${formData.city}`,
          location: `${formData.address}, ${formData.city}`,
          latitude: 24.8607 + (Math.random() - 0.5) * 10, // Random coordinate for demo
          longitude: 67.0011 + (Math.random() - 0.5) * 10,
          operatorId: formData.fullName,
          status: 'offline', // Starts offline until setup
        });
      }

      if (formData.partnershipType === 'logistics' || formData.partnershipType === 'multi') {
        await localApiClient.createDeliveryPartner({
          name: formData.fullName,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          area: formData.city,
          status: 'inactive', // Starts inactive until verification
        });
      }

      if (formData.partnershipType === 'agriculture' || formData.partnershipType === 'multi') {
        await localApiClient.createFarm({
          name: formData.businessName,
          location: `${formData.city}, ${formData.province}`,
          size: `${formData.farmSize} ${formData.farmSizeUnit}`,
          cropType: formData.cropTypes.join(', '),
          ownerId: formData.fullName,
          sensors: formData.sensorInterest.length,
        });
      }

      toast.success('Partner application submitted successfully! Our team will contact you within 2-3 business days.');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setCurrentStep(0);
      setFormData({
        fullName: '', email: '', phone: '', cnic: '', address: '', city: '', province: '',
        partnershipType: '', businessName: '', businessType: '', experience: '', monthlyInvestment: '',
        expectedEarnings: '', wifiExperience: '', technicalSkills: [], equipmentOwnership: '',
        coverageAreas: [], internetProvider: '', vehicleType: '', vehicleRegistration: '',
        licenseType: '', deliveryExperience: '', serviceAreas: [], availableHours: [],
        farmSize: '', farmSizeUnit: 'acres', cropTypes: [], farmingExperience: '',
        irrigationType: '', sensorInterest: [], landOwnership: '', walletAddress: '',
        monthlyCommitment: '', growthPlan: '', referralSource: '', termsAgreed: false,
        dataSharing: false, marketingConsent: false, backgroundCheck: false,
      });
    } catch (error: any) {
      toast.error(`Failed to submit application: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipBenefits = (type: string) => {
    switch (type) {
      case 'wifi':
        return {
          title: 'WiFi Network Partner',
          benefits: ['50-100 PKN per hotspot setup', 'Monthly earnings from data usage', '24/7 technical support', 'Equipment financing available'],
          commitment: '$200-500 initial investment',
          icon: Wifi
        };
      case 'logistics':
        return {
          title: 'Logistics Data Partner',
          benefits: ['5-25 PKN per delivery', 'Route optimization insights', 'Fuel efficiency tracking', 'Performance bonuses'],
          commitment: 'Active vehicle & license required',
          icon: Truck
        };
      case 'agriculture':
        return {
          title: 'Agriculture Monitor Partner',
          benefits: ['75 PKN per farm registration', 'Free sensor installation', 'Crop optimization data', 'Yield improvement insights'],
          commitment: 'Minimum 1 acre farmland',
          icon: Sprout
        };
      case 'multi':
        return {
          title: 'Multi-Phase Partner',
          benefits: ['All phase benefits', 'Priority support', 'Bulk setup discounts', 'Leadership opportunities'],
          commitment: 'Multi-sector involvement',
          icon: Star
        };
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-600" />
            Join Pakistani DePIN Network - Partner Onboarding
          </DialogTitle>
          <DialogDescription>
            Complete this multi-step form to become a partner in Pakistan's decentralized infrastructure network. 
            Join thousands of partners earning PKN tokens through WiFi networks, logistics data, and agricultural monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
            
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1">
                    <div className={`p-2 rounded-full border-2 ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? 'bg-emerald-100 border-emerald-500 text-emerald-600' :
                      'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs ${isCurrent ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {/* Step 0: Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cnic">CNIC (Optional)</Label>
                        <Input
                          id="cnic"
                          value={formData.cnic}
                          onChange={(e) => updateFormData('cnic', e.target.value)}
                          placeholder="12345-1234567-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                          placeholder="Enter your complete address"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Select value={formData.city} onValueChange={(value) => updateFormData('city', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {pakistaniCities.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Select value={formData.province} onValueChange={(value) => updateFormData('province', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Partnership Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Choose Your Partnership Type</h3>
                    <RadioGroup
                      value={formData.partnershipType}
                      onValueChange={(value) => updateFormData('partnershipType', value)}
                      className="space-y-4"
                    >
                      {['wifi', 'logistics', 'agriculture', 'multi'].map((type) => {
                        const benefits = getPartnershipBenefits(type);
                        if (!benefits) return null;
                        
                        const Icon = benefits.icon;
                        return (
                          <div key={type} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={type} id={type} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-5 w-5 text-emerald-600" />
                                <Label htmlFor={type} className="text-base font-medium cursor-pointer">
                                  {benefits.title}
                                </Label>
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {benefits.benefits.map((benefit, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Commitment:</strong> {benefits.commitment}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessName">Business/Project Name *</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => updateFormData('businessName', e.target.value)}
                          placeholder="Your business or project name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="pvt_ltd">Private Limited</SelectItem>
                            <SelectItem value="cooperative">Cooperative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience">Relevant Experience *</Label>
                        <Select value={formData.experience} onValueChange={(value) => updateFormData('experience', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                            <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                            <SelectItem value="expert">Expert (10+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="monthlyInvestment">Monthly Investment Capacity *</Label>
                        <Select value={formData.monthlyInvestment} onValueChange={(value) => updateFormData('monthlyInvestment', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investment range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">₨10,000 - ₨25,000</SelectItem>
                            <SelectItem value="medium">₨25,000 - ₨50,000</SelectItem>
                            <SelectItem value="high">₨50,000 - ₨100,000</SelectItem>
                            <SelectItem value="premium">₨100,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expectedEarnings">Expected Monthly Earnings</Label>
                        <Select value={formData.expectedEarnings} onValueChange={(value) => updateFormData('expectedEarnings', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expected earnings" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">₨15,000 - ₨30,000</SelectItem>
                            <SelectItem value="medium">₨30,000 - ₨60,000</SelectItem>
                            <SelectItem value="high">₨60,000 - ₨120,000</SelectItem>
                            <SelectItem value="premium">₨120,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referralSource">How did you hear about us?</Label>
                        <Select value={formData.referralSource} onValueChange={(value) => updateFormData('referralSource', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select referral source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend_referral">Friend/Family Referral</SelectItem>
                            <SelectItem value="online_search">Online Search</SelectItem>
                            <SelectItem value="business_network">Business Network</SelectItem>
                            <SelectItem value="advertisement">Advertisement</SelectItem>
                            <SelectItem value="conference">Conference/Event</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Technical Setup (varies by partnership type) */}
              {currentStep === 3 && formData.partnershipType && (
                <div className="space-y-6">
                  <Tabs defaultValue={formData.partnershipType} className="w-full">
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value={formData.partnershipType} className="capitalize">
                        {formData.partnershipType === 'multi' ? 'All Phases Setup' : `${formData.partnershipType} Setup`}
                      </TabsTrigger>
                    </TabsList>

                    {(formData.partnershipType === 'wifi' || formData.partnershipType === 'multi') && (
                      <TabsContent value="wifi" className="space-y-4">
                        <h4 className="font-medium">WiFi Network Technical Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Technical Skills *</Label>
                            <div className="space-y-2 mt-2">
                              {['Basic Networking', 'Router Configuration', 'Network Troubleshooting', 'System Administration', 'Customer Support'].map((skill) => (
                                <div key={skill} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={skill}
                                    checked={formData.technicalSkills.includes(skill)}
                                    onCheckedChange={() => toggleArrayValue('technicalSkills', skill)}
                                  />
                                  <Label htmlFor={skill} className="text-sm">{skill}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="equipmentOwnership">Equipment Ownership *</Label>
                            <Select value={formData.equipmentOwnership} onValueChange={(value) => updateFormData('equipmentOwnership', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select equipment status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="own">I own networking equipment</SelectItem>
                                <SelectItem value="purchase">I can purchase equipment</SelectItem>
                                <SelectItem value="financing">I need equipment financing</SelectItem>
                                <SelectItem value="rental">I prefer equipment rental</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {(formData.partnershipType === 'logistics' || formData.partnershipType === 'multi') && (
                      <TabsContent value="logistics" className="space-y-4">
                        <h4 className="font-medium">Logistics Partnership Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vehicleType">Vehicle Type *</Label>
                            <Select value={formData.vehicleType} onValueChange={(value) => updateFormData('vehicleType', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="rickshaw">Rickshaw</SelectItem>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="van">Van</SelectItem>
                                <SelectItem value="truck">Truck</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="licenseType">License Type *</Label>
                            <Select value={formData.licenseType} onValueChange={(value) => updateFormData('licenseType', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="motorcycle">Motorcycle License</SelectItem>
                                <SelectItem value="light">Light Vehicle License</SelectItem>
                                <SelectItem value="heavy">Heavy Vehicle License</SelectItem>
                                <SelectItem value="commercial">Commercial License</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Service Areas *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Food Delivery', 'E-commerce', 'Pharmaceuticals', 'Documents', 'Groceries', 'Electronics'].map((area) => (
                              <div key={area} className="flex items-center space-x-2">
                                <Checkbox
                                  id={area}
                                  checked={formData.serviceAreas.includes(area)}
                                  onCheckedChange={() => toggleArrayValue('serviceAreas', area)}
                                />
                                <Label htmlFor={area} className="text-sm">{area}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {(formData.partnershipType === 'agriculture' || formData.partnershipType === 'multi') && (
                      <TabsContent value="agriculture" className="space-y-4">
                        <h4 className="font-medium">Agriculture Monitoring Details</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="farmSize">Farm Size *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="farmSize"
                                type="number"
                                value={formData.farmSize}
                                onChange={(e) => updateFormData('farmSize', e.target.value)}
                                placeholder="Enter size"
                              />
                              <Select value={formData.farmSizeUnit} onValueChange={(value) => updateFormData('farmSizeUnit', value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="acres">Acres</SelectItem>
                                  <SelectItem value="kanals">Kanals</SelectItem>
                                  <SelectItem value="marlas">Marlas</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="landOwnership">Land Ownership</Label>
                            <Select value={formData.landOwnership} onValueChange={(value) => updateFormData('landOwnership', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ownership type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owned">Owned</SelectItem>
                                <SelectItem value="leased">Leased</SelectItem>
                                <SelectItem value="family">Family Land</SelectItem>
                                <SelectItem value="cooperative">Cooperative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Crop Types *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Vegetables', 'Fruits', 'Pulses'].map((crop) => (
                              <div key={crop} className="flex items-center space-x-2">
                                <Checkbox
                                  id={crop}
                                  checked={formData.cropTypes.includes(crop)}
                                  onCheckedChange={() => toggleArrayValue('cropTypes', crop)}
                                />
                                <Label htmlFor={crop} className="text-sm">{crop}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Sensor Interest *</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {['Soil Moisture', 'pH Level', 'Temperature', 'Humidity', 'Weather Station', 'Irrigation Control'].map((sensor) => (
                              <div key={sensor} className="flex items-center space-x-2">
                                <Checkbox
                                  id={sensor}
                                  checked={formData.sensorInterest.includes(sensor)}
                                  onCheckedChange={() => toggleArrayValue('sensorInterest', sensor)}
                                />
                                <Label htmlFor={sensor} className="text-sm">{sensor}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              )}

              {/* Step 4: Commitment & Agreements */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Commitment & Agreements</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="monthlyCommitment">Monthly Time Commitment</Label>
                        <Select value={formData.monthlyCommitment} onValueChange={(value) => updateFormData('monthlyCommitment', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time commitment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="part_time">Part-time (10-20 hours/week)</SelectItem>
                            <SelectItem value="full_time">Full-time (40+ hours/week)</SelectItem>
                            <SelectItem value="flexible">Flexible schedule</SelectItem>
                            <SelectItem value="seasonal">Seasonal commitment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="growthPlan">Growth Plan (Optional)</Label>
                        <Textarea
                          id="growthPlan"
                          value={formData.growthPlan}
                          onChange={(e) => updateFormData('growthPlan', e.target.value)}
                          placeholder="Describe your plans for scaling your participation in the network..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="walletAddress">Solana Wallet Address (Optional)</Label>
                        <Input
                          id="walletAddress"
                          value={formData.walletAddress}
                          onChange={(e) => updateFormData('walletAddress', e.target.value)}
                          placeholder="Your Solana wallet address for PKN token rewards"
                        />
                      </div>

                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">Required Agreements</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="termsAgreed"
                              checked={formData.termsAgreed}
                              onCheckedChange={(checked) => updateFormData('termsAgreed', checked)}
                            />
                            <Label htmlFor="termsAgreed" className="text-sm leading-relaxed">
                              I agree to the <span className="text-emerald-600 underline cursor-pointer">Terms of Service</span> and 
                              <span className="text-emerald-600 underline cursor-pointer"> Partner Agreement</span> *
                            </Label>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="dataSharing"
                              checked={formData.dataSharing}
                              onCheckedChange={(checked) => updateFormData('dataSharing', checked)}
                            />
                            <Label htmlFor="dataSharing" className="text-sm leading-relaxed">
                              I consent to data collection and sharing as outlined in the 
                              <span className="text-emerald-600 underline cursor-pointer"> Privacy Policy</span> *
                            </Label>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="backgroundCheck"
                              checked={formData.backgroundCheck}
                              onCheckedChange={(checked) => updateFormData('backgroundCheck', checked)}
                            />
                            <Label htmlFor="backgroundCheck" className="text-sm leading-relaxed">
                              I consent to background verification checks as required for partnership
                            </Label>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="marketingConsent"
                              checked={formData.marketingConsent}
                              onCheckedChange={(checked) => updateFormData('marketingConsent', checked)}
                            />
                            <Label htmlFor="marketingConsent" className="text-sm leading-relaxed">
                              I agree to receive marketing communications about network updates and opportunities
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}