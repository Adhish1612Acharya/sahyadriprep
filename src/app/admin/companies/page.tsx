"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  Globe,
  MapPin,
  Star,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies.hook";
import { CompanyInput } from "@/lib/zod/schema/company.schema";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { companyApi } from "@/lib/api/company";

export default function ManageCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Use the custom hook
  const { useCompaniesQuery, createCompany, updateCompany, deleteCompany } =
    useCompanies({ search: searchQuery });

  const { data: companies = [], isLoading, error } = useCompaniesQuery();

  // Form state
  const [formData, setFormData] = useState<CompanyInput>({
    name: "",
    logo_url: "",
    website: "",
    industry: "",
    headquarters: "",
    company_size: undefined,
    glassdoor_rating: undefined,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      logo_url: "",
      website: "",
      industry: "",
      headquarters: "",
      company_size: undefined,
      glassdoor_rating: undefined,
    });
  };

  const handleAddCompany = async () => {
    try {
      await createCompany.mutateAsync(formData);
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add company:", error);
    }
  };

  const handleEditClick = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      logo_url: company.logo_url || "",
      website: company.website || "",
      industry: company.industry || "",
      headquarters: company.headquarters || "",
      company_size: company.company_size || undefined,
      glassdoor_rating: company.glassdoor_rating || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      await updateCompany.mutateAsync({
        id: selectedCompany.id,
        data: formData,
      });
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  const handleDeleteClick = (company: any) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;

    try {
      await deleteCompany.mutateAsync(selectedCompany.id);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Failed to delete company:", error);
    }
  };

  const getCompanySizeBadge = (
    size: "startup" | "small" | "medium" | "large" | "enterprise" | null,
  ) => {
    return companyApi.getCompanySizeBadgeClass(size);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive">
              Error loading companies: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Manage Companies
          </h1>
          <p className="text-muted-foreground mt-1">
            Add and manage companies that visit the college
          </p>
        </div>

        {/* Add Company Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Fill in the company details below. Fields marked with * are
                required.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Company Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Google"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Logo URL */}
              <div className="grid gap-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use https://logo.clearbit.com/domain.com for automatic
                  logos
                </p>
              </div>

              {/* Website */}
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              {/* Industry */}
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Technology, Finance, Healthcare"
                  value={formData.industry ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                />
              </div>

              {/* Headquarters */}
              <div className="grid gap-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  placeholder="e.g. Bangalore, India"
                  value={formData.headquarters ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, headquarters: e.target.value })
                  }
                />
              </div>

              {/* Company Size */}
              <div className="grid gap-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  value={formData.company_size || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_size: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">
                      Startup (1-50 employees)
                    </SelectItem>
                    <SelectItem value="small">
                      Small (51-200 employees)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium (201-1000 employees)
                    </SelectItem>
                    <SelectItem value="large">
                      Large (1001-10000 employees)
                    </SelectItem>
                    <SelectItem value="enterprise">
                      Enterprise (10000+ employees)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Glassdoor Rating */}
              <div className="grid gap-2">
                <Label htmlFor="glassdoor_rating">Glassdoor Rating (0-5)</Label>
                <Input
                  id="glassdoor_rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.5"
                  value={formData.glassdoor_rating || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      glassdoor_rating: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={createCompany.isPending || !formData.name}
              >
                {createCompany.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Company"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Companies Grid */}
      {!isLoading && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="group hover:shadow-lg transition-all"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-12 h-12 rounded-lg object-contain border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {company.industry || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Location */}
                {company.headquarters && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{company.headquarters}</span>
                  </div>
                )}

                {/* Company Size */}
                {company.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="secondary"
                      className={getCompanySizeBadge(company.companySize)}
                    >
                      {company.companySize.charAt(0).toUpperCase() +
                        company.companySize.slice(1)}
                    </Badge>
                  </div>
                )}

                {/* Rating */}
                {company.glassdoorRating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {company.glassdoorRating}
                    </span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                )}

                {/* Website */}
                {company.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (company.website) {
                        window.open(company.website, "_blank");
                      }
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(company)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(company)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && companies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by adding your first company"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Company
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={formData.logo_url ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-headquarters">Headquarters</Label>
              <Input
                id="edit-headquarters"
                value={formData.headquarters ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, headquarters: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-size">Company Size</Label>
              <Select
                value={formData.company_size || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, company_size: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-rating">Glassdoor Rating</Label>
              <Input
                id="edit-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.glassdoor_rating || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    glassdoor_rating: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCompany}
              disabled={updateCompany.isPending || !formData.name}
            >
              {updateCompany.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{selectedCompany?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
