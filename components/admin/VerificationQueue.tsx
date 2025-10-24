import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { CheckCircle, XCircle, Clock, Wifi, Truck, Sprout, Heart, Building } from 'lucide-react';
import { localDb } from '../../utils/localDb';
import { toast } from 'sonner@2.0.3';

interface VerificationItem {
  id: string;
  resourceType: 'hotspot' | 'partner' | 'farm' | 'healthcare' | 'tax_point';
  resourceId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resourceDetails?: any;
}

const RESOURCE_ICONS = {
  hotspot: Wifi,
  partner: Truck,
  farm: Sprout,
  healthcare: Heart,
  tax_point: Building,
};

const RESOURCE_LABELS = {
  hotspot: 'WiFi Hotspot',
  partner: 'Delivery Partner',
  farm: 'Agricultural Farm',
  healthcare: 'Healthcare Provider',
  tax_point: 'Tax Collection Point',
};

export function VerificationQueue() {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadQueue();
  }, [filter]);

  const loadQueue = () => {
    const items = filter === 'all' 
      ? localDb.getVerificationQueue()
      : localDb.getVerificationQueue(filter as any);
    
    // Enrich with resource details
    const enriched = items.map(item => {
      let resourceDetails;
      switch (item.resourceType) {
        case 'hotspot':
          resourceDetails = localDb.getHotspots().find(h => h.id === item.resourceId);
          break;
        case 'partner':
          resourceDetails = localDb.getDeliveryPartners().find(p => p.id === item.resourceId);
          break;
        case 'farm':
          resourceDetails = localDb.getFarms().find(f => f.id === item.resourceId);
          break;
        case 'healthcare':
          resourceDetails = localDb.getHealthcareProviders().find(p => p.id === item.resourceId);
          break;
        case 'tax_point':
          resourceDetails = localDb.getTaxCollectionPoints().find(t => t.id === item.resourceId);
          break;
      }
      return { ...item, resourceDetails };
    });

    setQueue(enriched);
  };

  const handleApprove = (item: VerificationItem) => {
    localDb.updateVerificationRequest(item.id, {
      status: 'approved',
      reviewedBy: 'admin-user',
      reviewNotes: reviewNotes || 'Approved after verification',
    });

    // Update resource status
    switch (item.resourceType) {
      case 'healthcare':
        localDb.updateHealthcareProvider(item.resourceId, { status: 'active' });
        break;
      case 'tax_point':
        localDb.updateTaxCollectionPoint(item.resourceId, { status: 'active' });
        break;
    }

    // Create notification
    localDb.createNotification({
      userId: item.requestedBy,
      type: 'verification',
      title: 'Verification Approved',
      message: `Your ${RESOURCE_LABELS[item.resourceType]} has been verified and activated.`,
      read: false,
    });

    toast.success('Item approved successfully');
    setSelectedItem(null);
    setReviewNotes('');
    loadQueue();
  };

  const handleReject = (item: VerificationItem) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    localDb.updateVerificationRequest(item.id, {
      status: 'rejected',
      reviewedBy: 'admin-user',
      reviewNotes,
    });

    // Create notification
    localDb.createNotification({
      userId: item.requestedBy,
      type: 'verification',
      title: 'Verification Rejected',
      message: `Your ${RESOURCE_LABELS[item.resourceType]} verification was rejected. Reason: ${reviewNotes}`,
      read: false,
    });

    toast.success('Item rejected');
    setSelectedItem(null);
    setReviewNotes('');
    loadQueue();
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          <Clock className="mr-2 h-4 w-4" />
          Pending
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approved
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Rejected
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Items in Queue</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'All verifications are complete!'
                : `No ${filter} verification requests found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queue.map((item) => {
            const Icon = RESOURCE_ICONS[item.resourceType];
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {RESOURCE_LABELS[item.resourceType]}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {item.resourceDetails?.name || 'Unknown Resource'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === 'approved' ? 'default' :
                        item.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                      className={
                        item.status === 'approved' ? 'bg-green-600' :
                        item.status === 'pending' ? 'bg-orange-600' : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Requested:</span>
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div>{item.resourceDetails?.location || 'N/A'}</div>
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setSelectedItem(item)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => {
        setSelectedItem(null);
        setReviewNotes('');
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this {selectedItem && RESOURCE_LABELS[selectedItem.resourceType]}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resource Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <div className="font-medium">{selectedItem.resourceDetails?.name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{selectedItem.resourceDetails?.location}</div>
                    </div>
                    {selectedItem.resourceType === 'healthcare' && (
                      <>
                        <div>
                          <span className="text-muted-foreground">License:</span>
                          <div className="font-medium">{selectedItem.resourceDetails?.license}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium">{selectedItem.resourceDetails?.type}</div>
                        </div>
                      </>
                    )}
                    {selectedItem.resourceType === 'tax_point' && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Office Code:</span>
                          <div className="font-medium">{selectedItem.resourceDetails?.officeCode || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Jurisdiction:</span>
                          <div className="font-medium">{selectedItem.resourceDetails?.jurisdiction}</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Notes (Required for rejection)
                </label>
                <Textarea
                  placeholder="Enter your review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItem(null);
                setReviewNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedItem && handleReject(selectedItem)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedItem && handleApprove(selectedItem)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
