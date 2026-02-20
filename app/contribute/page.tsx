'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Brand, Manufacturer, Source } from '@/lib/types/pocketbase';

const formSchema = z.object({
  product_name: z.string().min(2, "Product name must be at least 2 characters"),
  barcode: z.string().optional(),
  brand: z.string().min(1, "Brand is required"), // ID
  manufacturer: z.string().min(1, "Manufacturer is required"), // ID
  source: z.string().min(1, "Source is required"), // ID
  ph_level: z.string().refine((val) => !isNaN(parseFloat(val)), "Must be a number").optional(),
  tds: z.string().refine((val) => !isNaN(parseFloat(val)), "Must be a number").optional(),
  image: z.any().optional(),
});

export default function ContributePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  
  // Data for selects
  const [brands, setBrands] = useState<Brand[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: "",
      barcode: "",
      brand: "",
      manufacturer: "",
      source: "",
      ph_level: "",
      tds: "",
    },
  });

  useEffect(() => {
    // Load data for selects
    const loadData = async () => {
      try {
        const [brandsRes, manufacturersRes, sourcesRes] = await Promise.all([
          pb.collection('brands').getFullList<Brand>({ requestKey: null }),
          pb.collection('manufacturers').getFullList<Manufacturer>({ requestKey: null }),
          pb.collection('sources').getFullList<Source>({ requestKey: null }),
        ]);
        setBrands(brandsRes);
        setManufacturers(manufacturersRes);
        setSources(sourcesRes);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not load options for the form.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Simple client-side rate limiting to prevent spamming submissions
    const now = Date.now();
    const RATE_LIMIT_WINDOW_MS = 30_000; // 30 seconds

    if (lastSubmittedAt && now - lastSubmittedAt < RATE_LIMIT_WINDOW_MS) {
      const secondsLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastSubmittedAt)) / 1000);
      toast({
        variant: "destructive",
        title: "You're going too fast",
        description: `Please wait ${secondsLeft} more second${secondsLeft !== 1 ? 's' : ''} before submitting again.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product_name', values.product_name);
      if (values.barcode) formData.append('barcode', values.barcode);
      formData.append('brand', values.brand);
      formData.append('manufacturer', values.manufacturer);
      formData.append('source', values.source);
      if (values.ph_level) formData.append('ph_level', values.ph_level);
      if (values.tds) formData.append('tds', values.tds);
      formData.append('status', 'pending');
      // submitted_by is optional when user is not logged in
      if (pb.authStore.model?.id) {
        formData.append('submitted_by', pb.authStore.model.id);
      }

      // Handle image
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput?.files?.length) {
        formData.append('images', fileInput.files[0]);
      }

      await pb.collection('products').create(formData);

      toast({
        title: "Submission Successful",
        description: "Your product has been submitted for review.",
      });
      
      form.reset();
      setLastSubmittedAt(now);
      // Optional: redirect to listing or show success state
      
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Hero Section */}
          <div className="mb-12 space-y-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Upload className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Submit a Water Product
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Add a new bottled water to our registry. All submissions are reviewed.
            </p>
          </div>

          <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Product Details</CardTitle>
              <CardDescription className="text-base">Enter the details as seen on the bottle.</CardDescription>
            </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Spritzer Natural Mineral Water" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Scan or type barcode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.brand_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Brand not listed? <a href="#" className="text-primary hover:underline">Add it here</a>.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a manufacturer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {manufacturers.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sources.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.source_name || s.location_address || "Unknown Source"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ph_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>pH Level (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g. 7.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TDS (mg/L) (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Input id="image-upload" type="file" accept="image/*" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a clear photo of the bottle/label.
                  </FormDescription>
                </FormItem>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Product
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
