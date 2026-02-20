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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Plus } from 'lucide-react';
import { Brand, Manufacturer, Source } from '@/lib/types/pocketbase';

const formSchema = z.object({
  product_name: z.string().min(2, "Product name must be at least 2 characters"),
  barcode: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  source: z.string().min(1, "Source is required"),
  ph_level: z.string().optional(),
  tds: z.string().optional(),
  image: z.any().optional(),
});

// ── Inline-create dialog types ───────────────────────────────────────────────

type AddBrandValues = { brand_name: string; website_url?: string };
type AddManufacturerValues = { name: string; address?: string };
type AddSourceValues = { source_name: string; location_address?: string; country?: string };

// ── Main component ────────────────────────────────────────────────────────────

export default function ContributePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data for selects
  const [brands, setBrands] = useState<Brand[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  // Dialog open states
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [manufacturerDialogOpen, setManufacturerDialogOpen] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);

  // Dialog submitting states
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingManufacturer, setAddingManufacturer] = useState(false);
  const [addingSource, setAddingSource] = useState(false);

  // Dialog field values
  const [newBrand, setNewBrand] = useState<AddBrandValues>({ brand_name: '' });
  const [newManufacturer, setNewManufacturer] = useState<AddManufacturerValues>({ name: '' });
  const [newSource, setNewSource] = useState<AddSourceValues>({ source_name: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: '',
      barcode: '',
      brand: '',
      manufacturer: '',
      source: '',
      ph_level: '',
      tds: '',
    },
  });

  useEffect(() => {
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
        console.error('Error loading data:', error);
        toast({ variant: 'destructive', title: 'Error loading data', description: 'Could not load options for the form.' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

  // ── Inline-create handlers ─────────────────────────────────────────────────

  const handleAddBrand = async () => {
    if (!newBrand.brand_name.trim()) return;
    setAddingBrand(true);
    try {
      const created = await pb.collection('brands').create<Brand>(newBrand);
      setBrands((prev) => [...prev, created]);
      form.setValue('brand', created.id);
      setBrandDialogOpen(false);
      setNewBrand({ brand_name: '' });
      toast({ title: 'Brand added', description: `"${created.brand_name}" has been added.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to add brand', description: err.message });
    } finally {
      setAddingBrand(false);
    }
  };

  const handleAddManufacturer = async () => {
    if (!newManufacturer.name.trim()) return;
    setAddingManufacturer(true);
    try {
      const created = await pb.collection('manufacturers').create<Manufacturer>(newManufacturer);
      setManufacturers((prev) => [...prev, created]);
      form.setValue('manufacturer', created.id);
      setManufacturerDialogOpen(false);
      setNewManufacturer({ name: '' });
      toast({ title: 'Manufacturer added', description: `"${created.name}" has been added.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to add manufacturer', description: err.message });
    } finally {
      setAddingManufacturer(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.source_name.trim()) return;
    setAddingSource(true);
    try {
      const created = await pb.collection('sources').create<Source>(newSource);
      setSources((prev) => [...prev, created]);
      form.setValue('source', created.id);
      setSourceDialogOpen(false);
      setNewSource({ source_name: '' });
      toast({ title: 'Source added', description: `"${created.source_name}" has been added.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to add source', description: err.message });
    } finally {
      setAddingSource(false);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────────

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Server-side rate limit check
      const rlRes = await fetch('/api/rate-limit', { method: 'POST' });
      if (!rlRes.ok) {
        const rlData = await rlRes.json();
        toast({ variant: 'destructive', title: "You're going too fast", description: rlData.error });
        return;
      }

      const formData = new FormData();
      formData.append('product_name', values.product_name);
      if (values.barcode) formData.append('barcode', values.barcode);
      formData.append('brand', values.brand);
      formData.append('manufacturer', values.manufacturer);
      formData.append('source', values.source);
      if (values.ph_level) formData.append('ph_level', values.ph_level);
      if (values.tds) formData.append('tds', values.tds);
      formData.append('status', 'pending');
      if (pb.authStore.model?.id) {
        formData.append('submitted_by', pb.authStore.model.id);
      }

      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput?.files?.length) {
        formData.append('images', fileInput.files[0]);
      }

      await pb.collection('products').create(formData);

      toast({ title: 'Submission Successful', description: 'Your product has been submitted for review.' });
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Hero */}
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

                  {/* Brand + Manufacturer row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                            Not listed?{' '}
                            <button
                              type="button"
                              onClick={() => setBrandDialogOpen(true)}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add brand
                            </button>
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                          <FormDescription>
                            Not listed?{' '}
                            <button
                              type="button"
                              onClick={() => setManufacturerDialogOpen(true)}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add manufacturer
                            </button>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Water Source */}
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select the source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sources.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.source_name || s.location_address || 'Unknown Source'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Not listed?{' '}
                          <button
                            type="button"
                            onClick={() => setSourceDialogOpen(true)}
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add source
                          </button>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* pH + TDS row */}
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

                  {/* Image */}
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <Input id="image-upload" type="file" accept="image/*" />
                    </FormControl>
                    <FormDescription>Upload a clear photo of the bottle/label.</FormDescription>
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

      {/* ── Add Brand Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>Enter the brand details. It will be added immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Spritzer"
                value={newBrand.brand_name}
                onChange={(e) => setNewBrand((v) => ({ ...v, brand_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL (Optional)</label>
              <Input
                placeholder="https://spritzer.com.my"
                value={newBrand.website_url || ''}
                onChange={(e) => setNewBrand((v) => ({ ...v, website_url: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBrand} disabled={addingBrand || !newBrand.brand_name.trim()}>
              {addingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Manufacturer Dialog ──────────────────────────────────────────── */}
      <Dialog open={manufacturerDialogOpen} onOpenChange={setManufacturerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Manufacturer</DialogTitle>
            <DialogDescription>Enter the manufacturer details. It will be added immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Manufacturer Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. OPM United (M) Sdn Bhd"
                value={newManufacturer.name}
                onChange={(e) => setNewManufacturer((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address (Optional)</label>
              <Input
                placeholder="e.g. Lot 1234, Jalan Industri, Perak"
                value={newManufacturer.address || ''}
                onChange={(e) => setNewManufacturer((v) => ({ ...v, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManufacturerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManufacturer} disabled={addingManufacturer || !newManufacturer.name.trim()}>
              {addingManufacturer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Manufacturer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Source Dialog ────────────────────────────────────────────────── */}
      <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Water Source</DialogTitle>
            <DialogDescription>Enter the water source details. It will be added immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Gunung Hijau Spring"
                value={newSource.source_name}
                onChange={(e) => setNewSource((v) => ({ ...v, source_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location / Address (Optional)</label>
              <Input
                placeholder="e.g. Taiping, Perak"
                value={newSource.location_address || ''}
                onChange={(e) => setNewSource((v) => ({ ...v, location_address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country (Optional)</label>
              <Input
                placeholder="e.g. Malaysia"
                value={newSource.country || ''}
                onChange={(e) => setNewSource((v) => ({ ...v, country: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSource} disabled={addingSource || !newSource.source_name.trim()}>
              {addingSource && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
