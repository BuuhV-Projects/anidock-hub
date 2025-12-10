import React from 'react';
import { Download, FileJson, Upload, Play, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@anidock/shared-ui';

const steps = [
  {
    icon: Download,
    title: '1. Download AniDock',
    description: 'First, download and install AniDock for Windows from our releases page.',
    link: {
      text: 'Download AniDock',
      url: 'https://github.com/BuuhV-Projects/anidock-hub/releases'
    }
  },
  {
    icon: FileJson,
    title: '2. Find a Driver',
    description: 'Browse the library and find a driver for your favorite anime site. Check the status badge for safety information.'
  },
  {
    icon: ExternalLink,
    title: '3. Click Install',
    description: 'Click the "Install" button on the driver card. This will open the driver JSON file in your browser.'
  },
  {
    icon: Upload,
    title: '4. Import in AniDock',
    description: 'Save the JSON file and import it in AniDock by going to Dashboard → My Drivers → Import Driver.'
  },
  {
    icon: Play,
    title: '5. Start Watching',
    description: 'Your driver is now ready! Browse the indexed anime catalog and start watching.'
  }
];

const GettingStartedGuide: React.FC = () => {
  return (
    <Card className="bg-card/50 border-border/50 mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
              {step.link && (
                <a 
                  href={step.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {step.link.text}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GettingStartedGuide;
