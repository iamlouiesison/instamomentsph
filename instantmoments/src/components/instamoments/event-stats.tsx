'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Camera, 
  Video, 
  Users, 
  TrendingUp, 
  Clock,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventStatsProps {
  eventId: string
  stats: {
    totalPhotos: number
    totalVideos: number
    totalContributors: number
    maxPhotos: number
    maxVideos?: number
    storageDays: number
    daysRemaining: number
    totalViews?: number
    totalDownloads?: number
  }
  className?: string
}

export const EventStats: React.FC<EventStatsProps> = ({
  eventId,
  stats,
  className
}) => {
  const photoUsagePercent = (stats.totalPhotos / stats.maxPhotos) * 100
  const videoUsagePercent = stats.maxVideos ? (stats.totalVideos / stats.maxVideos) * 100 : 0
  const storageUsagePercent = ((stats.storageDays - stats.daysRemaining) / stats.storageDays) * 100

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageStatus = (percent: number) => {
    if (percent >= 90) return 'Critical'
    if (percent >= 75) return 'High'
    if (percent >= 50) return 'Medium'
    return 'Low'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPhotos}</div>
                <div className="text-sm text-muted-foreground">Photos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalVideos}</div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalContributors}</div>
                <div className="text-sm text-muted-foreground">Contributors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.daysRemaining}</div>
                <div className="text-sm text-muted-foreground">Days Left</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {stats.totalPhotos} of {stats.maxPhotos} photos
              </span>
              <Badge 
                variant={photoUsagePercent >= 90 ? 'destructive' : photoUsagePercent >= 75 ? 'secondary' : 'default'}
              >
                {getUsageStatus(photoUsagePercent)}
              </Badge>
            </div>
            <Progress 
              value={photoUsagePercent} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(photoUsagePercent)}% of limit used
            </div>
          </CardContent>
        </Card>

        {/* Video Usage */}
        {stats.maxVideos && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stats.totalVideos} of {stats.maxVideos} videos
                </span>
                <Badge 
                  variant={videoUsagePercent >= 90 ? 'destructive' : videoUsagePercent >= 75 ? 'secondary' : 'default'}
                >
                  {getUsageStatus(videoUsagePercent)}
                </Badge>
              </div>
              <Progress 
                value={videoUsagePercent} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {Math.round(videoUsagePercent)}% of limit used
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storage Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Storage Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {stats.daysRemaining} of {stats.storageDays} days remaining
              </span>
              <Badge 
                variant={storageUsagePercent >= 90 ? 'destructive' : storageUsagePercent >= 75 ? 'secondary' : 'default'}
              >
                {getUsageStatus(storageUsagePercent)}
              </Badge>
            </div>
            <Progress 
              value={storageUsagePercent} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(storageUsagePercent)}% of storage period used
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Views</span>
                </div>
                <span className="font-semibold">{stats.totalViews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Downloads</span>
                </div>
                <span className="font-semibold">{stats.totalDownloads || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
