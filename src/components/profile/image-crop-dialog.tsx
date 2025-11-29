'use client';

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CropIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageCropDialogProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onOpenChange: (open: boolean) => void;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

export function ImageCropDialog({
  imageUrl,
  onCropComplete,
  onOpenChange,
}: ImageCropDialogProps) {
  const { toast } = useToast();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const aspect = 1;

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  async function getCroppedImg(
    image: HTMLImageElement,
    crop: Crop,
  ) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
  
    canvas.width = cropWidth;
    canvas.height = cropHeight;
  
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      throw new Error('No 2d context');
    }
  
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
  
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        }
      }, 'image/jpeg');
    });
  }

  const handleCrop = async () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      toast({
        variant: 'destructive',
        title: 'Crop Error',
        description: 'Please select a crop area.',
      });
      return;
    }

    try {
        const base64Image = await getCroppedImg(imgRef.current, crop);
        onCropComplete(base64Image);

    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Crop Failed',
        description: 'An error occurred while cropping the image.',
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon />
            Crop Your Profile Picture
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center bg-muted/30 p-4 rounded-md">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={aspect}
                circularCrop
            >
                <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageUrl}
                    style={{ maxHeight: '60vh' }}
                    onLoad={onImageLoad}
                />
            </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCrop}>
            <Check className="mr-2" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
