'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  EventTypeSelector,
  PackageSelector,
  LoadingSpinner,
} from '@/components/instamoments';
import { MainNavigation } from '@/components/layout';
import {
  EventCreateSchema,
  type EventType,
  type SubscriptionTier,
} from '@/lib/validations/event';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  PartyPopper,
  Gem,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 1,
    title: 'Event Details',
    description: 'Basic information about your event',
  },
  { id: 2, title: 'Event Type', description: 'Choose the type of celebration' },
  {
    id: 3,
    title: 'Package Selection',
    description: 'Select your event package',
  },
  {
    id: 4,
    title: 'Review & Create',
    description: 'Review and create your event',
  },
] as const;

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');
  const [hasVideoAddon, setHasVideoAddon] = useState(false);

  const form = useForm({
    resolver: zodResolver(EventCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      eventType: undefined,
      eventDate: '',
      location: '',
      subscriptionTier: 'free',
      hasVideoAddon: false,
      requiresModeration: false,
      allowDownloads: true,
      isPublic: true,
      customMessage: '',
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const watchedValues = watch();

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      router.push(`/dashboard/events/${result.data.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventTypeSelect = (type: EventType) => {
    setSelectedEventType(type);
    setValue('eventType', type);
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setValue('subscriptionTier', tier);
  };

  const handleVideoAddonToggle = (enabled: boolean) => {
    setHasVideoAddon(enabled);
    setValue('hasVideoAddon', enabled);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600">
            Set up your event gallery in just a few simple steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-4 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  {STEPS[currentStep - 1].id === 1 && (
                    <FileText className="w-6 h-6 text-gray-700" />
                  )}
                  {STEPS[currentStep - 1].id === 2 && (
                    <PartyPopper className="w-6 h-6 text-gray-700" />
                  )}
                  {STEPS[currentStep - 1].id === 3 && (
                    <Gem className="w-6 h-6 text-gray-700" />
                  )}
                  {STEPS[currentStep - 1].id === 4 && (
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                  )}
                </div>
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <p className="text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Maria's Wedding"
                        {...form.register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        {...form.register('eventDate')}
                      />
                      {errors.eventDate && (
                        <p className="text-sm text-red-500">
                          {errors.eventDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Manila Hotel, Makati City"
                      {...form.register('location')}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell your guests about your event..."
                      rows={3}
                      {...form.register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Event Type */}
              {currentStep === 2 && (
                <div>
                  <EventTypeSelector
                    selectedType={selectedEventType}
                    onSelect={handleEventTypeSelect}
                  />
                  {errors.eventType && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.eventType.message}
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Package Selection */}
              {currentStep === 3 && (
                <div>
                  <PackageSelector
                    selectedTier={selectedTier}
                    hasVideoAddon={hasVideoAddon}
                    onSelectTier={handleTierSelect}
                    onToggleVideoAddon={handleVideoAddonToggle}
                  />
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">
                      Event Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Event Name</p>
                        <p className="font-medium">{watchedValues.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Event Type</p>
                        <p className="font-medium flex items-center gap-2">
                          {selectedEventType && (
                            <>
                              <PartyPopper className="w-4 h-4 text-gray-700" />
                              {selectedEventType.charAt(0).toUpperCase() +
                                selectedEventType.slice(1)}
                            </>
                          )}
                        </p>
                      </div>
                      {watchedValues.eventDate && (
                        <div>
                          <p className="text-sm text-gray-600">Event Date</p>
                          <p className="font-medium">
                            {new Date(
                              watchedValues.eventDate
                            ).toLocaleDateString('en-PH')}
                          </p>
                        </div>
                      )}
                      {watchedValues.location && (
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium">
                            {watchedValues.location}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Package</p>
                        <p className="font-medium">
                          {selectedTier.charAt(0).toUpperCase() +
                            selectedTier.slice(1)}
                          {hasVideoAddon && ' + Video Add-on'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !watchedValues.name) ||
                      (currentStep === 2 && !selectedEventType)
                    }
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Creating Event...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
