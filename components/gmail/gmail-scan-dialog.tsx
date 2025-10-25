'use client';

/**
 * Gmail Scan Dialog Component
 * Handles Gmail scanning, results display, and bulk import
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfidenceBadge } from './confidence-badge';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { bulkImportSubscriptions, type ImportSubscriptionData } from '@/lib/gmail/import-actions';
import type { ParsedSubscription } from '@/lib/gmail/parser';

interface GmailScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ScanState = 'idle' | 'scanning' | 'results' | 'importing';

interface ScanResult extends ParsedSubscription {
  selected: boolean;
  detectedFrom?: string;
  lastBilled?: string;
}

export function GmailScanDialog({ open, onOpenChange, onSuccess }: GmailScanDialogProps) {
  const [state, setState] = useState<ScanState>('idle');
  const [progress, setProgress] = useState({ scanned: 0, found: 0 });
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStartScan = async () => {
    setState('scanning');
    setProgress({ scanned: 0, found: 0 });
    setError(null);

    try {
      // Call scan API
      const response = await fetch('/api/gmail/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysBack: 90,
          maxResults: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Scan failed');
      }

      // Transform results
      const scanResults: ScanResult[] = data.subscriptions.map((sub: ParsedSubscription) => ({
        ...sub,
        selected: sub.confidence === 'high' || sub.confidence === 'medium', // Auto-select high/medium confidence
        lastBilled: 'Recent', // TODO: Extract from email date
      }));

      setResults(scanResults);
      setProgress({ scanned: data.messagesScanned, found: data.subscriptionsFound });
      setState('results');

      // Track scan completion
      if (data.subscriptionsFound > 0) {
        toast.success(`Found ${data.subscriptionsFound} subscriptions!`);
      } else {
        toast.info('No subscriptions found in your Gmail inbox');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan Gmail';
      setError(message);
      toast.error(message);
      setState('idle');
    }
  };

  const handleImportSelected = async () => {
    const selectedSubs = results.filter((r) => r.selected);

    if (selectedSubs.length === 0) {
      toast.error('Please select at least one subscription to import');
      return;
    }

    setState('importing');

    try {
      // Transform to import format
      const importData: ImportSubscriptionData[] = selectedSubs.map((sub) => ({
        serviceId: sub.serviceId,
        serviceName: sub.serviceName,
        customServiceName: !sub.serviceId ? sub.serviceName : undefined,
        category: sub.category,
        cost: sub.cost || 0,
        currency: sub.currency,
        originalCost: sub.originalCost,
        originalCurrency: sub.currency,
        billingCycle: inferBillingCycle(sub.cost || 0),
        status: 'active' as const,
        notes: `Confidence: ${sub.confidence}`,
      }));

      const result = await bulkImportSubscriptions(importData);

      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      toast.success(`Successfully imported ${result.imported} subscriptions!`, {
        description: result.errors
          ? `${result.errors.length} subscriptions failed to import`
          : undefined,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import subscriptions';
      toast.error(message);
      setState('results');
    }
  };

  const toggleSelection = (index: number) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectAll = () => {
    setResults((prev) => prev.map((r) => ({ ...r, selected: true })));
  };

  const deselectAll = () => {
    setResults((prev) => prev.map((r) => ({ ...r, selected: false })));
  };

  const selectedCount = results.filter((r) => r.selected).length;
  const totalCost = results
    .filter((r) => r.selected)
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {state === 'idle' && 'Scan Gmail for Subscriptions'}
            {state === 'scanning' && 'Scanning Your Gmail Inbox'}
            {state === 'results' &&
              `Found ${results.length} Subscription${results.length !== 1 ? 's' : ''}`}
            {state === 'importing' && 'Importing Subscriptions'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Idle State */}
          {state === 'idle' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-base text-foreground">
                  We&apos;ll scan your Gmail inbox for subscription receipts
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Last 90 days • Up to 100 emails • Read-only access
                </p>
              </div>
              {error && (
                <div className="flex items-center gap-2 justify-center text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <Button onClick={handleStartScan} className="mt-4">
                Start Scanning
              </Button>
            </div>
          )}

          {/* Scanning State */}
          {state === 'scanning' && (
            <div className="text-center py-8 space-y-6">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min((progress.scanned / 100) * 100, 100)}%` }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    📧 Emails Checked: {progress.scanned} / 100
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🎯 Subscriptions Found: {progress.found}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results State */}
          {state === 'results' && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No subscriptions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adding subscriptions manually
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Select subscriptions to import to your dashboard:
                  </p>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-colors ${
                          result.selected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={result.selected}
                            onCheckedChange={() => toggleSelection(index)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-foreground">
                                {result.serviceName}
                              </h4>
                              <ConfidenceBadge confidence={result.confidence} size="sm" />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                              <span>₹{result.cost?.toFixed(2) || '0.00'}/month</span>
                              <span>•</span>
                              <span>{result.category}</span>
                              {result.lastBilled && (
                                <>
                                  <span>•</span>
                                  <span>Last billed: {result.lastBilled}</span>
                                </>
                              )}
                            </div>
                            {result.confidence === 'low' && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                ⓘ Low confidence - please verify details after import
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Importing State */}
          {state === 'importing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground mt-4">Importing subscriptions...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {state === 'results' && results.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
              <div className="text-muted-foreground">
                {selectedCount} selected • Total: ₹{totalCost.toFixed(2)}/month
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImportSelected}
                disabled={selectedCount === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Import Selected ({selectedCount})
              </Button>
            </div>
          </div>
        )}

        {state === 'idle' && (
          <div className="border-t pt-4 flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Infer billing cycle from cost (simple heuristic)
 */
function inferBillingCycle(cost: number): 'monthly' | 'yearly' {
  // If cost > ₹3000, likely yearly
  return cost > 3000 ? 'yearly' : 'monthly';
}
