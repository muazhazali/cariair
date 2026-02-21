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
import { Loader2, Upload, Plus, Clock } from 'lucide-react';
import { Brand, Manufacturer, Source } from '@/lib/types/pocketbase';
import { useTranslations } from 'next-intl';

const COMING_SOON = true;

function createFormSchema(t: ReturnType<typeof useTranslations<'contribute'>>) {
  return z.object({
    product_name: z.string().min(2, t('productNameError')),
    barcode: z.string().optional(),
    brand: z.string().min(1, t('brandRequired')),
    manufacturer: z.string().min(1, t('manufacturerRequired')),
    source: z.string().min(1, t('waterSourceRequired')),
    ph_level: z.string().optional(),
    tds: z.string().optional(),
    image: z.any().optional(),
  });
}

// ── Inline-create dialog types ───────────────────────────────────────────────

type AddBrandValues = { brand_name: string; website_url?: string };
type AddManufacturerValues = { name: string; address?: string };
type AddSourceValues = { source_name: string; location_address?: string; country?: string };

// ── Main component ────────────────────────────────────────────────────────────

export default function ContributePage() {
  const { toast } = useToast();
  const t = useTranslations('contribute');
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

  const formSchema = createFormSchema(t);

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
        toast({ variant: 'destructive', title: t('loadingError'), description: t('loadingErrorDesc') });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast, t]);

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
      toast({ title: t('brandAdded'), description: t('brandAddedDesc', { name: created.brand_name }) });
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('brandAddFailed'), description: err.message });
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
      toast({ title: t('manufacturerAdded'), description: t('manufacturerAddedDesc', { name: created.name }) });
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('manufacturerAddFailed'), description: err.message });
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
      toast({ title: t('sourceAdded'), description: t('sourceAddedDesc', { name: created.source_name }) });
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('sourceAddFailed'), description: err.message });
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
        toast({ variant: 'destructive', title: t('rateLimitTitle'), description: rlData.error });
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

      toast({ title: t('submitSuccess'), description: t('submitSuccessDesc') });
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: t('submitFailed'), description: error.message || t('submitFailed') });
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
          <span className="text-lg">{t('loading')}</span>
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
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Coming Soon Banner */}
          {COMING_SOON && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-950/40">
              <Clock className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300">Coming Soon</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Community contributions are not open yet. Stay tuned — this feature is on the way!
                </p>
              </div>
            </div>
          )}

          <div className={COMING_SOON ? 'pointer-events-none select-none opacity-40' : undefined}>
          <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{t('cardTitle')}</CardTitle>
              <CardDescription className="text-base">{t('cardDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('productName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('productNamePlaceholder')} {...field} />
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
                        <FormLabel>{t('barcode')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('barcodePlaceholder')} {...field} />
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
                          <FormLabel>{t('brand')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('brandPlaceholder')} />
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
                            {t('brandNotListed')}{' '}
                            <button
                              type="button"
                              onClick={() => setBrandDialogOpen(true)}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> {t('addBrand')}
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
                          <FormLabel>{t('manufacturer')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('manufacturerPlaceholder')} />
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
                            {t('manufacturerNotListed')}{' '}
                            <button
                              type="button"
                              onClick={() => setManufacturerDialogOpen(true)}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> {t('addManufacturer')}
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
                        <FormLabel>{t('waterSource')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('waterSourcePlaceholder')} />
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
                          {t('sourceNotListed')}{' '}
                          <button
                            type="button"
                            onClick={() => setSourceDialogOpen(true)}
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> {t('addSource')}
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
                          <FormLabel>{t('phLevel')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder={t('phPlaceholder')} {...field} />
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
                          <FormLabel>{t('tds')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder={t('tdsPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image */}
                  <FormItem>
                    <FormLabel>{t('productImage')}</FormLabel>
                    <FormControl>
                      <Input id="image-upload" type="file" accept="image/*" />
                    </FormControl>
                    <FormDescription>{t('productImageDesc')}</FormDescription>
                  </FormItem>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('submitProduct')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          </div>{/* end coming-soon wrapper */}
        </div>
      </div>

      {/* ── Add Brand Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addBrandTitle')}</DialogTitle>
            <DialogDescription>{t('addBrandDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('brandName')} <span className="text-red-500">{t('brandNameRequired')}</span></label>
              <Input
                placeholder={t('brandNamePlaceholder')}
                value={newBrand.brand_name}
                onChange={(e) => setNewBrand((v) => ({ ...v, brand_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('websiteUrl')}</label>
              <Input
                placeholder={t('websiteUrlPlaceholder')}
                value={newBrand.website_url || ''}
                onChange={(e) => setNewBrand((v) => ({ ...v, website_url: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddBrand} disabled={addingBrand || !newBrand.brand_name.trim()}>
              {addingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('addBrandButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Manufacturer Dialog ──────────────────────────────────────────── */}
      <Dialog open={manufacturerDialogOpen} onOpenChange={setManufacturerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addManufacturerTitle')}</DialogTitle>
            <DialogDescription>{t('addManufacturerDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('manufacturerName')} <span className="text-red-500">{t('manufacturerNameRequired')}</span></label>
              <Input
                placeholder={t('manufacturerNamePlaceholder')}
                value={newManufacturer.name}
                onChange={(e) => setNewManufacturer((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('address')}</label>
              <Input
                placeholder={t('addressPlaceholder')}
                value={newManufacturer.address || ''}
                onChange={(e) => setNewManufacturer((v) => ({ ...v, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManufacturerDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddManufacturer} disabled={addingManufacturer || !newManufacturer.name.trim()}>
              {addingManufacturer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('addManufacturerButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Source Dialog ────────────────────────────────────────────────── */}
      <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addSourceTitle')}</DialogTitle>
            <DialogDescription>{t('addSourceDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('sourceName')} <span className="text-red-500">{t('sourceNameRequired')}</span></label>
              <Input
                placeholder={t('sourceNamePlaceholder')}
                value={newSource.source_name}
                onChange={(e) => setNewSource((v) => ({ ...v, source_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('locationAddress')}</label>
              <Input
                placeholder={t('locationAddressPlaceholder')}
                value={newSource.location_address || ''}
                onChange={(e) => setNewSource((v) => ({ ...v, location_address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('country')}</label>
              <Input
                placeholder={t('countryPlaceholder')}
                value={newSource.country || ''}
                onChange={(e) => setNewSource((v) => ({ ...v, country: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddSource} disabled={addingSource || !newSource.source_name.trim()}>
              {addingSource && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('addSourceButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
