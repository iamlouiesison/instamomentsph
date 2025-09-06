import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Contrast,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

interface AccessibilitySettingsProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  className?: string;
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  audioDescriptions: boolean;
}

export function AccessibilitySettings({
  onSettingsChange,
  className,
}: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    audioDescriptions: false,
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);

    // Apply settings to document
    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", value);
    }
    if (key === "largeText") {
      document.documentElement.classList.toggle("large-text", value);
    }
    if (key === "reducedMotion") {
      document.documentElement.classList.toggle("reduced-motion", value);
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold mobile-heading">
            Accessibility Settings
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Contrast className="h-5 w-5" />
              <div>
                <p className="font-medium">High Contrast</p>
                <p className="text-sm text-muted-foreground">
                  Enhanced visibility
                </p>
              </div>
            </div>
            <Button
              variant={settings.highContrast ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSetting("highContrast", !settings.highContrast)
              }
              className="mobile-button"
            >
              {settings.highContrast ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5" />
              <div>
                <p className="font-medium">Large Text</p>
                <p className="text-sm text-muted-foreground">Easier to read</p>
              </div>
            </div>
            <Button
              variant={settings.largeText ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("largeText", !settings.largeText)}
              className="mobile-button"
            >
              {settings.largeText ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Audio Descriptions</p>
                <p className="text-sm text-muted-foreground">Voice guidance</p>
              </div>
            </div>
            <Button
              variant={settings.audioDescriptions ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSetting("audioDescriptions", !settings.audioDescriptions)
              }
              className="mobile-button"
            >
              {settings.audioDescriptions ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Settings are saved automatically</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AccessibilityHelperProps {
  children: React.ReactNode;
  description: string;
  className?: string;
}

export function AccessibilityHelper({
  children,
  description,
  className,
}: AccessibilityHelperProps) {
  return (
    <div className={cn("relative group", className)}>
      {children}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge
          variant="secondary"
          className="text-xs bg-golden/20 text-golden-foreground max-w-48"
        >
          {description}
        </Badge>
      </div>
    </div>
  );
}

interface VoiceGuidanceProps {
  text: string;
  className?: string;
}

export function VoiceGuidance({ text, className }: VoiceGuidanceProps) {
  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-PH"; // Filipino English
      utterance.rate = 0.8; // Slower for better understanding
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={speak}
      className={cn("h-8 w-8 p-0", className)}
      aria-label={`Read aloud: ${text}`}
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}

interface LargeTouchTargetProps {
  children: React.ReactNode;
  className?: string;
}

export function LargeTouchTarget({
  children,
  className,
}: LargeTouchTargetProps) {
  return (
    <div
      className={cn(
        "min-h-[44px] min-w-[44px] flex items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return <span className="sr-only">{children}</span>;
}

interface FilipinoLanguageSupportProps {
  children: React.ReactNode;
  englishText: string;
  filipinoText: string;
  className?: string;
}

export function FilipinoLanguageSupport({
  children,
  englishText,
  filipinoText,
  className,
}: FilipinoLanguageSupportProps) {
  const [showFilipino, setShowFilipino] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {children}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilipino(!showFilipino)}
          className="text-xs"
        >
          {showFilipino ? "English" : "Filipino"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {showFilipino ? filipinoText : englishText}
        </span>
      </div>
    </div>
  );
}

interface AccessibilityAnnouncementProps {
  message: string;
  priority?: "polite" | "assertive";
}

export function AccessibilityAnnouncement({
  message,
  priority = "polite",
}: AccessibilityAnnouncementProps) {
  return (
    <div role="status" aria-live={priority} className="sr-only">
      {message}
    </div>
  );
}

// Accessibility utilities for forms
interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleFormField({
  label,
  error,
  helpText,
  required,
  children,
  className,
}: AccessibleFormFieldProps) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {helpText && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      <div>{children}</div>

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// High contrast mode styles
export const highContrastStyles = `
  .high-contrast {
    --background: #ffffff;
    --foreground: #000000;
    --primary: #0000ff;
    --primary-foreground: #ffffff;
    --secondary: #000000;
    --secondary-foreground: #ffffff;
    --border: #000000;
    --input: #ffffff;
    --ring: #0000ff;
  }
  
  .high-contrast .dark {
    --background: #000000;
    --foreground: #ffffff;
    --primary: #00ffff;
    --primary-foreground: #000000;
    --secondary: #ffffff;
    --secondary-foreground: #000000;
    --border: #ffffff;
    --input: #000000;
    --ring: #00ffff;
  }
`;

// Large text mode styles
export const largeTextStyles = `
  .large-text {
    font-size: 1.125rem;
    line-height: 1.75;
  }
  
  .large-text h1 { font-size: 2.5rem; }
  .large-text h2 { font-size: 2rem; }
  .large-text h3 { font-size: 1.75rem; }
  .large-text h4 { font-size: 1.5rem; }
  .large-text h5 { font-size: 1.25rem; }
  .large-text h6 { font-size: 1.125rem; }
`;

// Reduced motion styles
export const reducedMotionStyles = `
  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;
