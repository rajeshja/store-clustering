'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getClusters } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { Store } from '@/types';
import { Loader2, Upload, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const formSchema = z.object({
  numClusters: z.number().min(5).max(10),
  csvFile: z
    .custom<FileList>()
    .refine(files => files?.length > 0, 'A CSV file is required.')
    .refine(
      (files) => files?.[0]?.name.toLowerCase().endsWith('.csv'),
      'File must be a CSV.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface StoreImporterProps {
  onClusteringComplete: (stores: Store[]) => void;
}

export function StoreImporter({ onClusteringComplete }: StoreImporterProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numClusters: 7,
      csvFile: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const file = values.csvFile[0];
      const csvData = await file.text();
      
      const result = await getClusters(csvData, values.numClusters);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Clustering Failed',
          description: result.error,
        });
        onClusteringComplete([]);
      } else {
        onClusteringComplete(result.stores);
        toast({
          title: 'Success!',
          description: `Successfully clustered ${result.stores.length} stores.`,
        });
      }
    });
  };

  const numClusters = form.watch('numClusters');

  return (
    <Card className="h-full shadow-none border-0 rounded-none">
      <CardHeader>
        <CardTitle>StoreMapper</CardTitle>
        <CardDescription>Upload a CSV to cluster your stores on the map.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Store Data CSV</Label>
            <div className="relative">
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                className="hidden"
                {...form.register('csvFile', {
                  onChange: (e) => setFileName(e.target.files?.[0]?.name || ''),
                })}
                disabled={isPending}
              />
              <Label htmlFor="csvFile" className="flex items-center gap-2 cursor-pointer rounded-md border border-input p-2.5 text-sm hover:bg-accent hover:text-accent-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{fileName || 'Select a file...'}</span>
              </Label>
            </div>
            {form.formState.errors.csvFile && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.csvFile.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Number of Clusters: {numClusters}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => form.setValue('numClusters', Math.max(5, numClusters - 1))}
                disabled={numClusters <= 5 || isPending}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease clusters</span>
              </Button>
              <Slider
                min={5}
                max={10}
                step={1}
                value={[numClusters]}
                onValueChange={(value) => form.setValue('numClusters', value[0])}
                disabled={isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => form.setValue('numClusters', Math.min(10, numClusters + 1))}
                disabled={numClusters >= 10 || isPending}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase clusters</span>
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clustering...
              </>
            ) : (
              'Cluster Stores'
            )}
          </Button>
          <div className="text-xs text-muted-foreground pt-4 space-y-1">
            <p className='font-medium'>Example CSV format:</p>
            <code className='block bg-muted p-2 rounded-md'>store-id,store-name,store-latitude,store-longitude,store-type,working_hours</code>
            <code className='block bg-muted p-2 rounded-md'>1,Main St Super,40.71,-74.00,supermarket,9am-5pm</code>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
