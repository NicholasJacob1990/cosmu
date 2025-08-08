import { useCallback } from 'react';

interface ErrorDetails {
  message: string;
  code?: string;
  context?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((error: Error | unknown, context?: string) => {
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      context,
    };

    // Log error for debugging
    console.error('Error Handler:', errorDetails, error);

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { details: errorDetails } });
    }

    return errorDetails;
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    fallbackValue?: any,
    context?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return fallbackValue;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
}