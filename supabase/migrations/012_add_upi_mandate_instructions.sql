-- Migration 012: Add UPI Mandate Instructions to Cancellation Guides
-- Date: October 27, 2025
-- Description: Adds upi_mandate_instructions JSONB column to store UPI autopay cancellation instructions

-- Add upi_mandate_instructions column to cancellation_guides table
ALTER TABLE public.cancellation_guides
ADD COLUMN IF NOT EXISTS upi_mandate_instructions JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN public.cancellation_guides.upi_mandate_instructions IS
'Array of UPI provider instructions: [{"provider": "gpay", "steps": ["step1", "step2", ...]}, ...]';

-- Add constraint to ensure valid JSON structure
ALTER TABLE public.cancellation_guides
ADD CONSTRAINT upi_mandate_json_shape CHECK (
  upi_mandate_instructions IS NULL
  OR (
    jsonb_typeof(upi_mandate_instructions) = 'array' AND
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(upi_mandate_instructions) AS elem
      WHERE jsonb_typeof(elem->'provider') <> 'string'
         OR jsonb_typeof(elem->'steps') <> 'array'
    )
  )
);

-- Add constraint to ensure provider is from allowed list
ALTER TABLE public.cancellation_guides
ADD CONSTRAINT upi_mandate_provider_allowed CHECK (
  upi_mandate_instructions IS NULL
  OR NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(upi_mandate_instructions) AS elem
    WHERE (elem->>'provider') NOT IN ('gpay', 'phonepe', 'paytm', 'amazonpay')
  )
);
