import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
    open: boolean;
    imageFile: File | null;
    onClose: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
    aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export function ImageCropper({ open, imageFile, onClose, onCropComplete, aspectRatio }: ImageCropperProps) {
    const [imgSrc, setImgSrc] = useState<string>("");
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    React.useEffect(() => {
        if (imageFile) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener("load", () =>
                setImgSrc(reader.result?.toString() || "")
            );
            reader.readAsDataURL(imageFile);
        } else {
            setImgSrc("");
        }
    }, [imageFile]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspectRatio) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        } else {
            setCrop({
                unit: "%",
                width: 80,
                height: 80,
                x: 10,
                y: 10
            });
        }
    }

    const handleConfirm = useCallback(async () => {
        if (!completedCrop || !imgRef.current || !imageFile) return;

        const image = imgRef.current;
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
                onClose();
            }
        }, imageFile.type);
    }, [completedCrop, imageFile, onClose, onCropComplete]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>
                        Drag to emphasize the important part of the photo.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-100 rounded-md">
                    {!!imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                className="max-h-[60vh] object-contain"
                            />
                        </ReactCrop>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!completedCrop}>
                        Confirm Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
