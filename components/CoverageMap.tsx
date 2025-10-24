import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Wifi, Users, DollarSign, Activity, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner@2.0.3';

interface MapHotspot {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  users: number;
  earnings: number;
  uptime: number;
}

interface CoverageMapProps {
  demoMode?: boolean;
}

export function CoverageMap({ demoMode = false }: CoverageMapProps) {
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<MapHotspot | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 30.3753, lng: 69.3451 }); // Pakistan center
  const [zoomLevel, setZoomLevel] = useState(6);
  const [showCoverageAreas, setShowCoverageAreas] = useState(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const data = await localApiClient.getHotspots();
        setHotspots(data || []);
      } catch (error) {
        console.error('Failed to fetch hotspots:', error);
        toast.error('Failed to load hotspot data');
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 3));
  };

  const focusOnHotspot = (hotspot: MapHotspot) => {
    setMapCenter({ lat: hotspot.latitude, lng: hotspot.longitude });
    setZoomLevel(12);
    setSelectedHotspot(hotspot);
  };

  const resetView = () => {
    setMapCenter({ lat: 30.3753, lng: 69.3451 });
    setZoomLevel(6);
    setSelectedHotspot(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCoverageRadius = (users: number) => {
    // Calculate coverage radius based on user count (simulated)
    return Math.max(20, Math.min(100, users * 2));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Network Coverage Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pakistan DePIN Network Coverage Map
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoverageAreas(!showCoverageAreas)}
              >
                <Layers className="h-4 w-4 mr-1" />
                {showCoverageAreas ? 'Hide' : 'Show'} Coverage
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                Reset View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-white shadow-md"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-white shadow-md"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Map Legend */}
            <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-md border">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Legend</h4>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Offline</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Maintenance</span>
                </div>
                {showCoverageAreas && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100 opacity-50"></div>
                    <span>Coverage Area</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simplified Map Container */}
            <div 
              className="w-full h-96 bg-gradient-to-br from-emerald-50 to-blue-50 border rounded-lg relative overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
                `
              }}
            >
              {/* Pakistan Map Outline (Simplified) */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
              >
                <path
                  d="M50,150 Q100,120 150,140 Q200,130 250,150 Q300,140 350,160 Q340,200 300,220 Q250,230 200,210 Q150,200 100,190 Q60,180 50,150 Z"
                  fill="none"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="2"
                />
              </svg>

              {/* Hotspots */}
              {hotspots.map((hotspot) => {
                const x = ((hotspot.longitude - 60) / 15) * 100; // Approximate positioning
                const y = ((40 - hotspot.latitude) / 15) * 100;
                const isSelected = selectedHotspot?.id === hotspot.id;
                
                return (
                  <div key={hotspot.id}>
                    {/* Coverage Area */}
                    {showCoverageAreas && (
                      <div
                        className={`absolute rounded-full border-2 border-opacity-30 bg-opacity-10 ${
                          hotspot.status === 'online' ? 'border-green-500 bg-green-500' :
                          hotspot.status === 'offline' ? 'border-red-500 bg-red-500' :
                          'border-yellow-500 bg-yellow-500'
                        }`}
                        style={{
                          left: `${x - getCoverageRadius(hotspot.users) / 8}%`,
                          top: `${y - getCoverageRadius(hotspot.users) / 8}%`,
                          width: `${getCoverageRadius(hotspot.users) / 4}%`,
                          height: `${getCoverageRadius(hotspot.users) / 4}%`,
                        }}
                      />
                    )}
                    
                    {/* Hotspot Marker */}
                    <button
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                        isSelected ? 'scale-125 z-20' : 'z-10 hover:scale-110'
                      }`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                      onClick={() => focusOnHotspot(hotspot)}
                    >
                      <div className={`relative p-2 rounded-full shadow-lg ${
                        hotspot.status === 'online' ? 'bg-green-500' :
                        hotspot.status === 'offline' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}>
                        <Wifi className="h-4 w-4 text-white" />
                        
                        {/* Pulse animation for online hotspots */}
                        {hotspot.status === 'online' && (
                          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                        )}
                      </div>
                    </button>

                    {/* Hotspot Info Popup */}
                    {isSelected && (
                      <div
                        className="absolute z-30 bg-white p-4 rounded-lg shadow-lg border min-w-64 transform -translate-x-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y - 15}%`,
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{hotspot.name}</h4>
                            <Badge className={getStatusColor(hotspot.status)}>
                              {hotspot.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{hotspot.location}</p>
                          
                          <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="h-3 w-3 text-blue-600" />
                                <span className="text-sm font-medium">{hotspot.users}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Users</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="text-sm font-medium">{hotspot.earnings}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">PKN Earned</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Activity className="h-3 w-3 text-emerald-600" />
                                <span className="text-sm font-medium">{hotspot.uptime}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Uptime</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {hotspots.filter(h => h.status === 'online').length}
              </div>
              <p className="text-sm text-green-700">Online Hotspots</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {hotspots.reduce((sum, h) => sum + h.users, 0)}
              </div>
              <p className="text-sm text-blue-700">Total Users</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {hotspots.reduce((sum, h) => sum + h.earnings, 0)}
              </div>
              <p className="text-sm text-emerald-700">Total PKN Earned</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {hotspots.length > 0 ? Math.round(hotspots.reduce((sum, h) => sum + h.uptime, 0) / hotspots.length) : 0}%
              </div>
              <p className="text-sm text-purple-700">Average Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}