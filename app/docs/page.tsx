'use client';

import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">CariAir API Documentation</h1>
          <p className="text-muted-foreground">
            Malaysia Mineral & Drinking Water Source Registry API
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading API documentation...</div>
        </div>
      </div>
    );
  }

  // Dynamically import SwaggerUI only on client side
  const SwaggerUIComponent = require('swagger-ui-react').default;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">CariAir API Documentation</h1>
        <p className="text-muted-foreground">
          Malaysia Mineral & Drinking Water Source Registry API
        </p>
      </div>
      <SwaggerUIComponent url="/api/openapi" />
    </div>
  );
}
