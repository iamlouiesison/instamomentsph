"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EventTypeSelector,
  PackageSelector,
  LoadingSpinner,
} from "@/components/instamoments";
import {
  EventCreateSchema,
  type EventType,
  type SubscriptionTier,
} from "@/lib/validations/event";
import {
  getSubscriptionLimits,
  formatPrice,
  calculateTotalPrice,
} from "@/lib/business-logic/subscription-limits";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  PartyPopper,
  Gem,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  {
    id: 1,
    title: "Event Details",
    description: "Basic information about your event",
  },
  { id: 2, title: "Event Type", description: "Choose the type of celebration" },
  {
    id: 3,
    title: "Package Selection",
    description: "Select your event package",
  },
  {
    id: 4,
    title: "Review & Create",
    description: "Review and create your event",
  },
] as const;

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("free");
  const [hasVideoAddon, setHasVideoAddon] = useState(false);

  const form = useForm({
    resolver: zodResolver(EventCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      eventType: undefined,
      eventDate: "",
      location: "",
      subscriptionTier: "free",
      hasVideoAddon: false,
      requiresModeration: false,
      allowDownloads: true,
      isPublic: true,
      customMessage: "",
    },
  });

  const {
    // handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const watchedValues = watch();

  const nextStep = () => {
    console.log("nextStep called, current step:", currentStep);

    // Validate current step before proceeding
    if (currentStep === 1 && !watchedValues.name) {
      toast.error("Please enter an event name");
      return;
    }
    if (currentStep === 2 && !selectedEventType) {
      toast.error("Please select an event type");
      return;
    }
    if (currentStep === 3 && !selectedTier) {
      toast.error("Please select a package");
      return;
    }

    if (currentStep < STEPS.length) {
      console.log("Moving to step:", currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    console.log("onSubmit called with data:", data);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push(`/dashboard/events/${result.data.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create event",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = async () => {
    console.log("handleCreateEvent called, current step:", currentStep);
    if (currentStep !== 4) {
      console.log("Cannot create event - not on final step");
      return;
    }

    const formData = form.getValues();
    console.log("Form data:", formData);
    await onSubmit(formData);
  };

  const handleEventTypeSelect = (type: EventType) => {
    setSelectedEventType(type);
    setValue("eventType", type);
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setValue("subscriptionTier", tier);
  };

  const handleVideoAddonToggle = (enabled: boolean) => {
    setHasVideoAddon(enabled);
    setValue("hasVideoAddon", enabled);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-4 hidden sm:block">
                  <div className="text-sm font-semibold text-foreground">
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-6 hidden sm:block rounded-full transition-colors duration-200 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
        </div>

        {/* Form */}
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
                  {STEPS[currentStep - 1].id === 1 && (
                    <FileText className="w-6 h-6 text-primary" />
                  )}
                  {STEPS[currentStep - 1].id === 2 && (
                    <PartyPopper className="w-6 h-6 text-primary" />
                  )}
                  {STEPS[currentStep - 1].id === 3 && (
                    <Gem className="w-6 h-6 text-primary" />
                  )}
                  {STEPS[currentStep - 1].id === 4 && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                {STEPS[currentStep - 1].description}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Event Name and Date Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-foreground"
                      >
                        Event Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Maria's Wedding"
                        className="h-11 text-base"
                        {...form.register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="eventDate"
                        className="text-sm font-semibold text-foreground"
                      >
                        Event Date *
                      </Label>
                      <DatePicker
                        id="eventDate"
                        placeholder="Select event date"
                        value={
                          watchedValues.eventDate
                            ? new Date(watchedValues.eventDate)
                            : undefined
                        }
                        onChange={(date) => {
                          if (date) {
                            setValue(
                              "eventDate",
                              date.toISOString().split("T")[0],
                            );
                          }
                        }}
                        className="w-full"
                      />
                      {errors.eventDate && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.eventDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location Row */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="location"
                      className="text-sm font-semibold text-foreground"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Manila Hotel, Makati City"
                      className="h-11 text-base"
                      {...form.register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Description Row */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-foreground"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell your guests about your event..."
                      rows={4}
                      className="text-base resize-none"
                      {...form.register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">
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

              {/* Step 4: Review & Create */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                    <h4 className="font-bold text-xl mb-6 text-gray-900 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">
                          Event Name
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {watchedValues.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">
                          Event Type
                        </p>
                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {selectedEventType && (
                            <>
                              <PartyPopper className="w-5 h-5 text-blue-600" />
                              {selectedEventType.charAt(0).toUpperCase() +
                                selectedEventType.slice(1)}
                            </>
                          )}
                        </p>
                      </div>
                      {watchedValues.eventDate && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">
                            Event Date
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(
                              watchedValues.eventDate,
                            ).toLocaleDateString("en-PH", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      {watchedValues.location && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">
                            Location
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {watchedValues.location}
                          </p>
                        </div>
                      )}
                    </div>
                    {watchedValues.description && (
                      <div className="mt-6 space-y-1">
                        <p className="text-sm font-medium text-gray-600">
                          Description
                        </p>
                        <p className="text-gray-900">
                          {watchedValues.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
                    <h4 className="font-bold text-xl mb-6 text-gray-900 flex items-center gap-2">
                      <Gem className="w-6 h-6 text-purple-600" />
                      Package & Features
                    </h4>

                    {/* Package Overview */}
                    <div className="bg-white rounded-lg p-6 mb-6 border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-gray-900">
                            {selectedTier.charAt(0).toUpperCase() +
                              selectedTier.slice(1)}{" "}
                            Package
                          </h5>
                          <p className="text-sm text-gray-600">
                            Perfect for your {selectedEventType} celebration
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {formatPrice(
                              calculateTotalPrice(selectedTier, hasVideoAddon),
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            One-time payment
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Package Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Photo Limits */}
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-bold">
                              📸
                            </span>
                          </div>
                          <h6 className="font-semibold text-gray-900">
                            Photos
                          </h6>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {getSubscriptionLimits(selectedTier).maxPhotos}
                          </p>
                          <p className="text-sm text-gray-600">
                            Maximum photos
                          </p>
                          <p className="text-xs text-gray-500">
                            {
                              getSubscriptionLimits(selectedTier)
                                .maxPhotosPerUser
                            }{" "}
                            per person
                          </p>
                        </div>
                      </div>

                      {/* Video Limits */}
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-bold">
                              🎥
                            </span>
                          </div>
                          <h6 className="font-semibold text-gray-900">
                            Videos
                          </h6>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {hasVideoAddon
                              ? getSubscriptionLimits(selectedTier).maxVideos
                              : 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            {hasVideoAddon ? "Maximum videos" : "Not included"}
                          </p>
                          {hasVideoAddon && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ Video addon enabled
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Storage Duration */}
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm font-bold">
                              ⏰
                            </span>
                          </div>
                          <h6 className="font-semibold text-gray-900">
                            Storage
                          </h6>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {getSubscriptionLimits(selectedTier).storageDays}
                          </p>
                          <p className="text-sm text-gray-600">Days storage</p>
                          <p className="text-xs text-gray-500">
                            Auto-delete after expiry
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 bg-white rounded-lg p-4 border border-purple-100">
                      <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        What&apos;s Included
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>QR code for easy sharing</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Real-time photo gallery</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>No app download required</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Mobile-optimized interface</span>
                        </div>
                        {hasVideoAddon && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Video upload support</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Instant photo sharing</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-600 text-sm font-bold">
                          !
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Ready to create your event?
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Once created, you&apos;ll receive a QR code to share
                          with your guests for easy photo and video uploads.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-8 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !watchedValues.name) ||
                      (currentStep === 2 && !selectedEventType) ||
                      (currentStep === 3 && !selectedTier)
                    }
                    className="px-8"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleCreateEvent}
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Creating Event...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
