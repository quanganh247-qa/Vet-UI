import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, Image, Check, PlusCircle, Maximize } from "lucide-react";

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string, notes?: string) => void;
  maxPhotos?: number;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCapture,
  maxPhotos = 5
}) => {
  const [mode, setMode] = useState<"idle" | "capturing" | "preview">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoNotes, setPhotoNotes] = useState("");
  const [recentPhotos, setRecentPhotos] = useState<Array<{ data: string; notes: string }>>([]);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    return () => {
      // Clean up stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setMode("capturing");
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };
  
  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setMode("idle");
  };
  
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Draw the video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the data URL from the canvas
    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoData);
    
    // Switch to preview mode
    setMode("preview");
  };
  
  const discardPhoto = () => {
    setCapturedPhoto(null);
    setPhotoNotes("");
    
    // Go back to capturing mode if stream is still active
    if (stream && stream.active) {
      setMode("capturing");
    } else {
      setMode("idle");
    }
  };
  
  const savePhoto = () => {
    if (capturedPhoto) {
      const newPhoto = { data: capturedPhoto, notes: photoNotes };
      
      // Add to recent photos
      setRecentPhotos([newPhoto, ...recentPhotos].slice(0, maxPhotos));
      
      // Call the callback
      onPhotoCapture(capturedPhoto, photoNotes);
      
      // Reset state
      setCapturedPhoto(null);
      setPhotoNotes("");
      setMode("idle");
      
      // Stop the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  
  const viewFullscreen = (photoData: string) => {
    setFullscreenPhoto(photoData);
  };
  
  const closeFullscreen = () => {
    setFullscreenPhoto(null);
  };
  
  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex justify-between items-center">
            <span>Patient Photos</span>
            {mode === "idle" && recentPhotos.length < maxPhotos && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startCapture}
                className="text-blue-600"
              >
                <Camera size={16} className="mr-1" /> Capture
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {mode === "idle" && (
            <div>
              {recentPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {recentPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo.data} 
                        alt={`Patient photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md cursor-pointer"
                        onClick={() => viewFullscreen(photo.data)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-white p-1 h-auto"
                          onClick={() => viewFullscreen(photo.data)}
                        >
                          <Maximize size={14} />
                        </Button>
                      </div>
                      {photo.notes && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                          {photo.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {recentPhotos.length < maxPhotos && (
                    <button 
                      onClick={startCapture}
                      className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <PlusCircle size={24} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                  <p>No photos captured yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={startCapture}
                  >
                    <Camera size={14} className="mr-1" />
                    Capture Photo
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {mode === "capturing" && (
            <div className="space-y-2">
              <div className="relative bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-48 object-cover"
                />
                
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white"
                    onClick={stopCapture}
                  >
                    <X size={14} className="mr-1" />
                    Cancel
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={takePhoto}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <Camera size={14} className="mr-1" />
                    Take Photo
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Position camera to frame the area clearly
              </div>
            </div>
          )}
          
          {mode === "preview" && capturedPhoto && (
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={capturedPhoto} 
                  alt="Captured" 
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
              
              <textarea
                placeholder="Add notes about this photo (optional)"
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                className="w-full text-sm rounded-md border border-gray-300 px-3 py-1 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={discardPhoto}
                >
                  <X size={14} className="mr-1" />
                  Discard
                </Button>
                
                <Button 
                  size="sm"
                  onClick={savePhoto}
                >
                  <Check size={14} className="mr-1" />
                  Save Photo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Fullscreen photo viewer */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-full">
            <img 
              src={fullscreenPhoto} 
              alt="Fullscreen view" 
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            <button 
              onClick={closeFullscreen}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoCapture; 