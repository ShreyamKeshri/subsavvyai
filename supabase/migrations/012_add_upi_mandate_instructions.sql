-- Migration 012: Add UPI Mandate Instructions to Cancellation Guides
-- Date: October 27, 2025
-- Description: Adds upi_mandate_instructions JSONB column to store UPI autopay cancellation instructions

-- Add upi_mandate_instructions column to cancellation_guides table
ALTER TABLE public.cancellation_guides
ADD COLUMN IF NOT EXISTS upi_mandate_instructions JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN public.cancellation_guides.upi_mandate_instructions IS
'Array of UPI provider instructions: [{"provider": "gpay", "steps": ["step1", "step2", ...]}, ...]';
