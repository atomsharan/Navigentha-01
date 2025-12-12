import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Home, Monitor, Users } from 'lucide-react';

const EmergencySupport = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Emergency Support</h1>
          <p className="text-muted-foreground text-lg">Immediate help when you need it most</p>
        </div>

        {/* Crisis Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-700">Crisis Hotline</CardTitle>
                  <p className="text-red-600">24/7 immediate support</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                If you're having thoughts of self-harm or suicide, please reach out immediately.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Call 988 - Suicide & Crisis Lifeline
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-700">Text Support</CardTitle>
                  <p className="text-blue-600">Anonymous chat support</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Prefer texting? Get confidential support via text message.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Text HOME to 741741
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Campus Counseling</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Free counseling services available to students
              </p>
              <Button 
                variant="outline" 
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                Find Services
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Monitor className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Online Therapy</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Professional therapy from the comfort of your home
              </p>
              <Button 
                variant="outline" 
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Support Groups</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect with others who understand your experience
              </p>
              <Button 
                variant="outline" 
                className="w-full border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                Find Groups
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmergencySupport;