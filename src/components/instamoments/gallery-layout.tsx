import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Grid,
  List,
  Download,
  Share2,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface GalleryLayoutProps {
  photos: Photo[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onPhotoClick?: (photo: Photo) => void;
  onLike?: (photoId: string) => void;
  onDownload?: (photoId: string) => void;
  onShare?: (photoId: string) => void;
  className?: string;
}

export function GalleryLayout({
  photos,
  viewMode = 'grid',
  onViewModeChange,
  onPhotoClick,
  onLike,
  onDownload,
  onShare,
  className,
}: GalleryLayoutProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="mobile-heading font-semibold">
            Event Photos ({photos.length})
          </h2>
          {selectedPhotos.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-golden/20 text-golden-foreground"
            >
              {selectedPhotos.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange?.('grid')}
            className="mobile-button"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange?.('list')}
            className="mobile-button"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPhotos.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-golden/10 border border-golden/20 rounded-lg">
          <span className="text-sm font-medium">
            {selectedPhotos.length} photos selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}

      {/* Photos Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className={cn(
                'group cursor-pointer transition-all duration-200',
                'border-2 hover:border-golden/30',
                selectedPhotos.includes(photo.id) && 'border-golden bg-golden/5'
              )}
              onClick={() => onPhotoClick?.(photo)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={photo.thumbnailUrl}
                    alt={`Photo by ${photo.uploadedBy}`}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-t-lg" />

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      className="w-4 h-4 text-golden bg-white border-gray-300 rounded focus:ring-golden"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload?.(photo.id);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare?.(photo.id);
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLike?.(photo.id);
                          }}
                        >
                          <Heart
                            className={cn(
                              'h-3 w-3',
                              photo.isLiked && 'fill-red-500'
                            )}
                          />
                          <span>{photo.likes}</span>
                        </Button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{photo.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    by {photo.uploadedBy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(photo.uploadedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className={cn(
                'group cursor-pointer transition-all duration-200',
                'border-2 hover:border-golden/30',
                selectedPhotos.includes(photo.id) && 'border-golden bg-golden/5'
              )}
              onClick={() => onPhotoClick?.(photo)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={photo.thumbnailUrl}
                      alt={`Photo by ${photo.uploadedBy}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="64px"
                    />
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      className="absolute -top-1 -left-1 w-4 h-4 text-golden bg-white border-gray-300 rounded focus:ring-golden"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Photo by {photo.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(photo.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike?.(photo.id);
                        }}
                      >
                        <Heart
                          className={cn(
                            'h-4 w-4',
                            photo.isLiked && 'fill-red-500'
                          )}
                        />
                        <span>{photo.likes}</span>
                      </Button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{photo.comments}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload?.(photo.id);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare?.(photo.id);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
