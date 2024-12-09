import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  DatabaseIcon, 
  SparklesIcon 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function WebScrapingLandingPage() {
  const features = [
    {
      id: 'data-extraction',
      title: "Advanced Data Extraction",
      description: "Leverage cutting-edge web scraping technology to extract precise data from any website.",
      icon: <DatabaseIcon className="w-12 h-12 text-blue-600" />,
      color: 'blue'
    },
    {
      id: 'security',
      title: "Robust Security",
      description: "State-of-the-art encryption and proxy management to ensure seamless and secure scraping.",
      icon: <ShieldCheckIcon className="w-12 h-12 text-green-600" />,
      color: 'green'
    },
    {
      id: 'intelligent-parsing',
      title: "Intelligent Parsing",
      description: "Smart algorithms that transform raw web data into clean, structured information.",
      icon: <SparklesIcon className="w-12 h-12 text-purple-600" />,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <Badge variant="outline" className="mb-4">New Platform</Badge>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            DataWeave: Intelligent Web Scraping
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform unstructured web data into actionable insights with our advanced scraping platform.
          </p>
        </header>

        {/* Hero CTA */}
        <div className="flex justify-center space-x-4 mb-16">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href='/auth/signup'>Sign Up</Link>
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start your web scraping journey</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button 
            variant="outline" 
            size="lg" 
            className="border-gray-300 hover:bg-gray-100"
          >
           <Link href='/auth/signin'>Log In</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        {/* Alert Section */}
        <Alert className="mb-16">
          <AlertTitle>Ready to Transform Your Data Strategy?</AlertTitle>
          <AlertDescription>
            Our platform offers unparalleled web scraping capabilities with advanced security and intelligent parsing.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}