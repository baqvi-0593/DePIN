import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Building, FileText, Activity, Ship } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApiClient } from '../utils/localApi';

interface RegisterTaxPointFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface TaxPointFormData {
  name: string;
  type: string;
  location: string;
  address: string;
  jurisdiction: string;
  officeCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
}

const TAX_POINT_TYPES = [
  { value: 'fbr_office', label: 'FBR Office', icon: Building },
  { value: 'provincial_office', label: 'Provincial Revenue Authority', icon: FileText },
  { value: 'excise_office', label: 'Excise & Taxation Office', icon: Activity },
  { value: 'customs_office', label: 'Customs Office', icon: Ship },
];

export function RegisterTaxPointForm({ open, onOpenChange, onSuccess }: RegisterTaxPointFormProps) {
  const [formData, setFormData] = useState<TaxPointFormData>({
    name: '',
    type: '',
    location: '',
    address: '',
    jurisdiction: '',
    officeCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof TaxPointFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Office name is required';
    if (!formData.type) return 'Office type selection is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.jurisdiction.trim()) return 'Jurisdiction is required';
    if (!formData.officeCode.trim()) return 'Office code is required';
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
      const pointData = {
        name: formData.name.trim(),
        type: formData.type,
        location: formData.location.trim(),
        address: formData.address.trim(),
        jurisdiction: formData.jurisdiction.trim(),
        officeCode: formData.officeCode.trim(),
        contactPerson: formData.contactPerson.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        description: formData.description.trim(),
        status: 'active', // Government offices are typically active immediately
      };

      await localApiClient.createTaxCollectionPoint(pointData);
      
      toast.success('Tax collection point registered successfully! You earned 150 BUILD tokens 🎉');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        location: '',
        address: '',
        jurisdiction: '',
        officeCode: '',
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
            <Building className="h-5 w-5 text-blue-600" />
            Register Tax Collection Point
          </DialogTitle>
          <DialogDescription>
            Register your FBR office, provincial authority, or customs office to join Pakistan's transparent taxation network.
            Earn 150 BUILD tokens upon registration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Office Information */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Office Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Office Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., FBR Regional Tax Office Karachi"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="type">Office Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select office type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_POINT_TYPES.map((type) => (
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
                    placeholder="e.g., Karachi, Sindh"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="officeCode">Office Code *</Label>
                  <Input
                    id="officeCode"
                    placeholder="e.g., FBR-KHI-01"
                    value={formData.officeCode}
                    onChange={(e) => handleInputChange('officeCode', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Full address of the tax office"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                <Input
                  id="jurisdiction"
                  placeholder="e.g., Karachi Zone, Punjab Province"
                  value={formData.jurisdiction}
                  onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The geographic or administrative area covered by this office
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
                  placeholder="Name of the officer in charge"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Official Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="email@fbr.gov.pk"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+92-21-1234567"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional information about services and responsibilities"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Rewards Info */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <h3 className="font-semibold mb-2">BUILD Token Rewards</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ 150 BUILD tokens for collection point registration</li>
              <li>✓ 15 BUILD tokens per tax transaction logged</li>
              <li>✓ Create transparent and immutable tax records</li>
              <li>✓ Enable real-time revenue tracking and analytics</li>
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
              {loading ? 'Registering...' : 'Register Tax Point'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
