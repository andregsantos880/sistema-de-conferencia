/**
 * Form utilities for react-hook-form integration
 */

import type { FieldError } from 'react-hook-form';
import type { FieldStatus } from '@/components/forms/core/FieldControl';

/**
 * Converts react-hook-form error to field status props
 */
export function getFieldStatus(error?: FieldError): {
  status: FieldStatus;
  statusMessage?: string;
} {
  if (!error) {
    return { status: 'default' };
  }
  
  return {
    status: 'error',
    statusMessage: error.message,
  };
}
