"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
// import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Camera,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/image-processing";
import { uploadPhoto, uploadVideo } from "@/lib/upload-utils";

interface UploadFormProps {
  eventId: string;
  contributorName: string;
  contributorEmail?: string;
  onUploadComplete: () => void;
  onCancel: () => void;
  allowVideos?: boolean;
  maxPhotosPerUser?: number;
  maxFileSize?: number; // in MB
}

interface UploadFile {
  file: File;
  preview: string;
  type: "photo" | "video";
  caption?: string;
  uploading: boolean;
  progress: number;
  error?: string;
  uploaded?: boolean;
}

export function UploadForm({
  eventId,
  contributorName,
  contributorEmail,
  onUploadComplete,
  onCancel,
  allowVideos = false,
  maxPhotosPerUser = 5,
  maxFileSize = 10,
}: UploadFormProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles
        .map((file) => {
          const isVideo = file.type.startsWith("video/");
          const isImage = file.type.startsWith("image/");

          if (!isVideo && !isImage) {
            toast.error("Please upload only images or videos");
            return null;
          }

          if (isVideo && !allowVideos) {
            toast.error("Video uploads are not allowed for this event");
            return null;
          }

          if (file.size > maxFileSize * 1024 * 1024) {
            toast.error(`File size must be less than ${maxFileSize}MB`);
            return null;
          }

          if (files.length >= maxPhotosPerUser) {
            toast.error(`Maximum ${maxPhotosPerUser} files allowed per user`);
            return null;
          }

          return {
            file,
            preview: URL.createObjectURL(file),
            type: isVideo ? "video" : "photo",
            uploading: false,
            progress: 0,
          };
        })
        .filter((file): file is UploadFile => file !== null);

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [allowVideos, maxFileSize, maxPhotosPerUser, files.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, caption } : file)),
    );
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let completedUploads = 0;

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];

        // Update file status to uploading
        setFiles((prev) =>
          prev.map((file, index) =>
            index === i ? { ...file, uploading: true, progress: 0 } : file,
          ),
        );

        try {
          // let uploadResult;

          if (fileData.type === "photo") {
            // Compress image before upload
            const compressedFile = await compressImage(fileData.file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });

            await uploadPhoto({
              file: compressedFile.file,
              eventId,
              contributorName,
              contributorEmail,
              caption: fileData.caption,
            });
          } else {
            await uploadVideo({
              file: fileData.file,
              eventId,
              contributorName,
              contributorEmail,
              message: fileData.caption,
            });
          }

          // Update file status to uploaded
          setFiles((prev) =>
            prev.map((file, index) =>
              index === i
                ? { ...file, uploading: false, uploaded: true, progress: 100 }
                : file,
            ),
          );

          completedUploads++;
          setUploadProgress((completedUploads / files.length) * 100);

          toast.success(
            `${fileData.type === "photo" ? "Photo" : "Video"} uploaded successfully!`,
          );
        } catch (error) {
          console.error(`Upload error for file ${i}:`, error);

          setFiles((prev) =>
            prev.map((file, index) =>
              index === i
                ? {
                    ...file,
                    uploading: false,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : file,
            ),
          );

          toast.error(
            `Failed to upload ${fileData.type}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Wait a moment for all uploads to complete
      setTimeout(() => {
        onUploadComplete();
      }, 1000);
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error("Upload process failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Photos {allowVideos && "& Videos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                {isDragActive ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {allowVideos
                    ? "Images and videos up to 10MB each"
                    : "Images up to 10MB each"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum {maxPhotosPerUser} files per person
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selected Files ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {/* Preview */}
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {fileData.type === "photo" ? (
                      <Image
                        src={fileData.preview}
                        alt={`Preview of ${fileData.file.name}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {fileData.type === "photo" ? (
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Video className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-medium truncate">
                        {fileData.file.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({formatFileSize(fileData.file.size)})
                      </span>
                    </div>

                    {/* Caption Input */}
                    <Textarea
                      placeholder={`Add a ${fileData.type === "photo" ? "caption" : "message"}...`}
                      value={fileData.caption || ""}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="mb-2"
                      rows={2}
                    />

                    {/* Status */}
                    {fileData.uploading && (
                      <div className="space-y-2">
                        <Progress value={fileData.progress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          Uploading... {fileData.progress}%
                        </p>
                      </div>
                    )}

                    {fileData.uploaded && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Uploaded successfully!</span>
                      </div>
                    )}

                    {fileData.error && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{fileData.error}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!fileData.uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={uploadFiles}
          disabled={files.length === 0 || isUploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading
            ? "Uploading..."
            : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
