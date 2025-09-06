'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Tag,
  Lock,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  ContributorInfoSchema,
  validateContributorInfo,
  sanitizeFileName,
  containsInappropriateContent,
} from '@/lib/validations/upload';

type ContributorFormData = {
  name: string;
  email?: string;
  phone?: string;
  caption?: string;
  tags?: string[];
  isPrivate?: boolean;
  allowDownload?: boolean;
};

interface UploadFormProps {
  eventName: string;
  maxPhotosPerUser: number;
  requiresModeration: boolean;
  isPublic: boolean;
  onSubmit: (data: ContributorFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<ContributorFormData>;
  showAdvancedOptions?: boolean;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  eventName,
  maxPhotosPerUser,
  requiresModeration,
  isPublic,
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData,
  showAdvancedOptions = false,
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const form = useForm<ContributorFormData>({
    resolver: zodResolver(
      ContributorInfoSchema.extend({
        caption: z
          .string()
          .max(200, 'Caption must be less than 200 characters')
          .optional(),
        tags: z
          .array(z.string().max(20))
          .max(5, 'Maximum 5 tags allowed')
          .optional(),
        isPrivate: z.boolean().default(false),
        allowDownload: z.boolean().default(true),
      })
    ),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      caption: initialData?.caption || '',
      tags: initialData?.tags || [],
      isPrivate: initialData?.isPrivate || false,
      allowDownload: initialData?.allowDownload ?? true,
    },
  });

  // Validate form data
  const validateForm = useCallback((data: ContributorFormData) => {
    const errors: string[] = [];

    // Validate contributor info
    const contributorValidation = validateContributorInfo({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });

    if (!contributorValidation.isValid) {
      errors.push(...contributorValidation.errors);
    }

    // Validate caption content
    if (data.caption && containsInappropriateContent(data.caption)) {
      errors.push('Caption contains inappropriate content');
    }

    // Validate tags
    if (data.tags && data.tags.length > 5) {
      errors.push('Maximum 5 tags allowed');
    }

    data.tags?.forEach((tag, index) => {
      if (tag.length > 20) {
        errors.push(`Tag ${index + 1} is too long (max 20 characters)`);
      }
      if (containsInappropriateContent(tag)) {
        errors.push(`Tag ${index + 1} contains inappropriate content`);
      }
    });

    setValidationErrors(errors);
    setShowValidation(errors.length > 0);

    return errors.length === 0;
  }, []);

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    if (validateForm(data)) {
      onSubmit(data);
    }
  });

  // Add tag
  const addTag = useCallback(() => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim())) {
      const sanitizedTag = sanitizeFileName(newTag.trim());
      if (sanitizedTag && !containsInappropriateContent(sanitizedTag)) {
        const newTags = [...tags, sanitizedTag];
        setTags(newTags);
        form.setValue('tags', newTags);
        setNewTag('');
      }
    }
  }, [newTag, tags, form]);

  // Remove tag
  const removeTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      form.setValue('tags', newTags);
    },
    [tags, form]
  );

  // Handle tag input key press
  const handleTagKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    },
    [addTag]
  );

  // Real-time validation
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (showValidation) {
        validateForm(data as ContributorFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, showValidation, validateForm]);

  const isFormValid = validationErrors.length === 0 && form.formState.isValid;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Contributor Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your photos for <strong>{eventName}</strong>
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {showValidation && validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Name *
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  className={form.formState.errors.name ? 'border-red-500' : ''}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  className={
                    form.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  We&apos;ll notify you when your photos are approved
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="+63 912 345 6789"
                disabled={isSubmitting}
                className={form.formState.errors.phone ? 'border-red-500' : ''}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Content Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Information</h3>

            <div className="space-y-2">
              <Label htmlFor="caption" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Caption (Optional)
              </Label>
              <Textarea
                id="caption"
                {...form.register('caption')}
                placeholder="Add a caption for your photos..."
                rows={3}
                disabled={isSubmitting}
                className={
                  form.formState.errors.caption ? 'border-red-500' : ''
                }
              />
              {form.formState.errors.caption && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.caption.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.watch('caption')?.length || 0}/200 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag..."
                  disabled={isSubmitting || tags.length >= 5}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={isSubmitting || !newTag.trim() || tags.length >= 5}
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        disabled={isSubmitting}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {tags.length}/5 tags • Help others find your photos
              </p>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Advanced Options</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private Upload
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only you and the event host can see these photos
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('isPrivate')}
                    onCheckedChange={(checked) =>
                      form.setValue('isPrivate', checked)
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Allow Downloads
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let others download your photos
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('allowDownload')}
                    onCheckedChange={(checked) =>
                      form.setValue('allowDownload', checked)
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Event Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>Event:</strong> {eventName}
                </p>
                <p>
                  <strong>Upload Limit:</strong> {maxPhotosPerUser} photos per
                  person
                </p>
                {requiresModeration && (
                  <p>
                    <strong>Moderation:</strong> Photos will be reviewed before
                    appearing in the gallery
                  </p>
                )}
                {!isPublic && (
                  <p>
                    <strong>Privacy:</strong> This is a private event
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continue Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
