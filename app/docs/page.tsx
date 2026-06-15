'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">CariAir API Documentation</h1>
        <p className="text-muted-foreground">
          Malaysia Mineral & Drinking Water Source Registry API
        </p>
      </div>
      <SwaggerUI url="/api/openapi" />
    </div>
  );
}
