import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Steps from "@/components/steps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubCategoryCard } from "@/components/sub-category-card";
import { SubCategoryTypeTable } from "@/components/sub-category-type-table";
import { AttributeTable } from "@/components/attribute-table";
import { ReviewSubmitSection } from "@/components/review-submit-section";
import { AddSubCategoryDrawer } from "@/components/add-sub-category-drawer";
import { AddSubCategoryTypeDrawer } from "@/components/add-sub-category-type-drawer";
import { AddAttributeDrawer } from "@/components/add-attribute-drawer";
import { useReduxCategories } from "@/hooks/useReduxCategories";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-upload";

// Interfaces (reuse from create page)
export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  image: string;
  types: SubCategoryType[];
}

export interface SubCategoryType {
  id: string;
  name: string;
  description?: string;
  image: string;
  appliesTo: string[]; // Array of subcategory IDs
}

export interface Attribute {
  id: string;
  name: string;
  description?: string;
  inputType:
    | "dropdown"
    | "multiselect"
    | "boolean"
    | "text"
    | "number"
    | "textarea";
  purpose: "filter" | "specification" | "both";
  values: string[];
  filterStatus: "active" | "inactive";
  isRequired: boolean;
  order: number;
  appliesTo: string[]; // Array of subcategory type IDs
  additionalDetails?: string;
  [key: string]: any;
}

// Constants for validation
const VALIDATION_RULES = {
  categoryName: { min: 1, max: 100 },
  description: { max: 500 },
};

export default function AdminEditCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubCategoryDrawerOpen, setIsSubCategoryDrawerOpen] = useState(false);
  const [isSubCategoryTypeDrawerOpen, setIsSubCategoryTypeDrawerOpen] =
    useState(false);
  const [isAttributeDrawerOpen, setIsAttributeDrawerOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCategoryTypes, setSubCategoryTypes] = useState<SubCategoryType[]>(
    []
  );
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryImage, setCategoryImage] = useState<string[]>([]);

  // Form state
  const [categoryName, setCategoryName] = useState("");

  // Use the Redux categories hook
  const {
    getCategory,
    getSubcategoriesForCategory,
    updateExistingCategory,
    createNewSubcategory,
    removeSubcategory,
    createNewProductType,
    // removeProductType,
    createNewAttribute,

    getAttributes,
    getProductTypes,
  } = useReduxCategories();

  // Steps configuration
  const steps = [
    { title: "Edit category" },
    { title: "Manage sub categories" },
    { title: "Manage sub category types" },
    { title: "Manage attributes" },
    { title: "Review and submit" },
  ];

  // ==================== LOAD EXISTING DATA ====================

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) {
        toast.error("Category ID not found");
        navigate("/admin/categories");
        return;
      }

      setIsLoading(true);
      try {
        toast.loading("Loading category data...", { id: "load-category" });

        // Fetch category details
        const category = await getCategory(categoryId);
        setCategoryName(category.name);
        setCategoryImage(
          category.coverImageUrl ? [category.coverImageUrl] : []
        );

        // Fetch subcategories
        const subcategoriesData = await getSubcategoriesForCategory(categoryId);
        const transformedSubcategories: SubCategory[] = subcategoriesData.map(
          (subcat: any) => ({
            id: subcat.id,
            name: subcat.name,
            description: subcat.description,
            image: subcat.coverImageUrl || "",
            types: [],
          })
        );
        setSubCategories(transformedSubcategories);

        // Fetch product types for all subcategories
        const allProductTypes = await getProductTypes();
        const categoryProductTypes = allProductTypes.filter((type: any) =>
          subcategoriesData.some(
            (subcat: any) => subcat.id === type.subcategoryId
          )
        );

        // Group product types by name and collect which subcategories they apply to
        const groupedTypes = new Map<string, SubCategoryType>();
        categoryProductTypes.forEach((type: any) => {
          const existing = groupedTypes.get(type.name);
          if (existing) {
            existing.appliesTo.push(type.subcategoryId);
          } else {
            groupedTypes.set(type.name, {
              id: type.id,
              name: type.name,
              description: type.description,
              image: type.image || "",
              appliesTo: [type.subcategoryId],
            });
          }
        });
        setSubCategoryTypes(Array.from(groupedTypes.values()));

        // Fetch attributes
        const attributesData = await getAttributes();
        const categoryAttributes = attributesData.filter(
          (attr: any) => attr.categoryId === categoryId
        );
        setAttributes(categoryAttributes);

        toast.success("Category data loaded", { id: "load-category" });
      } catch (error: any) {
        console.error("Failed to load category data:", error);
        toast.error(
          `Failed to load category: ${error.message || "Unknown error"}`,
          { id: "load-category" }
        );
        navigate("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // ==================== NAVIGATION ====================

  const handleCancel = () => {
    if (
      window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      navigate("/admin/categories");
    }
  };

  const handleSaveAsDraft = async () => {
    toast.success("Changes saved as draft!");
    setTimeout(() => {
      navigate("/admin/categories");
    }, 1000);
  };

  // ==================== STEP 0: UPDATE CATEGORY ====================

  const handleUpdateCategory = async () => {
    if (!categoryId) return;

    // Validate inputs
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!categoryImage || categoryImage.length === 0) {
      toast.error("Please upload a category image");
      return;
    }

    setIsUpdating(true);
    try {
      toast.loading("Updating category...", { id: "update-category" });

      const categoryData = {
        name: categoryName.trim(),
        coverImageUrl: categoryImage[0],
      };

      await updateExistingCategory(categoryId, categoryData);

      toast.success("Category updated successfully!", {
        id: "update-category",
      });

      // Move to next step
      setCurrentStep(1);
    } catch (error: any) {
      console.error("Failed to update category:", error);
      toast.error(
        `Failed to update category: ${error.message || "Unknown error"}`,
        { id: "update-category" }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ==================== SUB CATEGORY FUNCTIONS ====================

  const handleAddSubCategory = async (subCategoryData: {
    name: string;
    description?: string;
    image: string[] | null;
  }) => {
    if (!categoryId) {
      toast.error("Category not found");
      return;
    }

    if (!subCategoryData.image || subCategoryData.image.length === 0) {
      toast.error("Please upload an image for the subcategory");
      return;
    }

    try {
      toast.loading("Creating subcategory...", { id: "create-subcategory" });

      const subcategoryPayload = {
        name: subCategoryData.name,
        categoryId: categoryId,
        coverImageUrl: subCategoryData.image[0],
      };

      const createdSubcategory = await createNewSubcategory(
        categoryId,
        subcategoryPayload
      );

      const newSubCategory: SubCategory = {
        id: createdSubcategory.id,
        name: createdSubcategory.name,
        description: createdSubcategory.description,
        image: subCategoryData.image[0],
        types: [],
      };

      setSubCategories((prev) => [...prev, newSubCategory]);
      toast.success("Subcategory created successfully", {
        id: "create-subcategory",
      });
    } catch (error: any) {
      console.error("Failed to create subcategory:", error);
      toast.error(
        `Failed to create subcategory: ${error.message || "Unknown error"}`,
        { id: "create-subcategory" }
      );
    }
  };

  const handleRemoveSubCategory = async (id: string) => {
    if (!categoryId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this subcategory? This will also delete all associated product types."
      )
    ) {
      try {
        toast.loading("Removing subcategory...", { id: "remove-subcategory" });
        await removeSubcategory(categoryId, id);

        setSubCategories((prev) => prev.filter((subCat) => subCat.id !== id));

        // Also remove product types that applied to this subcategory
        setSubCategoryTypes((prev) =>
          prev.filter((type) => !type.appliesTo.includes(id))
        );

        toast.success("Subcategory removed", { id: "remove-subcategory" });
      } catch (error: any) {
        console.error("Failed to remove subcategory:", error);
        toast.error(
          `Failed to remove subcategory: ${error.message || "Unknown error"}`,
          { id: "remove-subcategory" }
        );
      }
    }
  };

  // ==================== SUB CATEGORY TYPE FUNCTIONS ====================

  const handleAddSubCategoryType = async (subCategoryTypeData: {
    name: string;
    description?: string;
    image: string[] | null;
    appliesTo: string[];
  }) => {
    if (!categoryId) {
      toast.error("Category not found");
      return;
    }

    if (!subCategoryTypeData.image || subCategoryTypeData.image.length === 0) {
      toast.error("Please upload an image for the subcategory type");
      return;
    }

    if (
      !subCategoryTypeData.appliesTo ||
      subCategoryTypeData.appliesTo.length === 0
    ) {
      toast.error("Please select at least one sub category");
      return;
    }

    try {
      toast.loading("Creating subcategory type...", { id: "create-type" });

      const createdTypes: SubCategoryType[] = [];

      for (const subcategoryId of subCategoryTypeData.appliesTo) {
        const productTypeData = {
          name: subCategoryTypeData.name,
          description: subCategoryTypeData.description || "",
          subcategoryId: subcategoryId,
          isActive: true,
          image: subCategoryTypeData.image[0],
        };

        try {
          const createdType = await createNewProductType(
            subcategoryId,
            productTypeData
          );

          createdTypes.push({
            id: createdType.id,
            name: createdType.name,
            description: createdType.description,
            image: subCategoryTypeData.image[0],
            appliesTo: [subcategoryId],
          });
        } catch (error) {
          console.error(
            `Failed to create type for subcategory ${subcategoryId}:`,
            error
          );
        }
      }

      if (createdTypes.length === 0) {
        toast.error("Failed to create subcategory type", { id: "create-type" });
        return;
      }

      const combinedType: SubCategoryType = {
        id: createdTypes[0].id,
        name: subCategoryTypeData.name,
        description: subCategoryTypeData.description,
        image: subCategoryTypeData.image[0],
        appliesTo: subCategoryTypeData.appliesTo,
      };

      setSubCategoryTypes((prev) => [...prev, combinedType]);
      toast.success("Subcategory type created successfully", {
        id: "create-type",
      });
    } catch (error: any) {
      console.error("Failed to add subcategory type:", error);
      toast.error(
        `Failed to add subcategory type: ${error.message || "Unknown error"}`,
        { id: "create-type" }
      );
    }
  };

  const handleRemoveSubCategoryType = async (id: string) => {
    if(!categoryId) return;
    
    if (
      window.confirm("Are you sure you want to delete this subcategory type?")
    ) {
      try {
        toast.loading("Removing subcategory type...", { id: "remove-type" });
        await removeSubcategory(categoryId, id);

        setSubCategoryTypes((prev) => prev.filter((type) => type.id !== id));
        toast.success("Subcategory type removed", { id: "remove-type" });
      } catch (error: any) {
        console.error("Failed to remove subcategory type:", error);
        toast.error(
          `Failed to remove subcategory type: ${
            error.message || "Unknown error"
          }`,
          { id: "remove-type" }
        );
      }
    }
  };

  // ==================== ATTRIBUTE FUNCTIONS ====================

  const handleAddAttribute = async (attributeData: {
    name: string;
    description?: string;
    inputType:
      | "dropdown"
      | "multiselect"
      | "boolean"
      | "text"
      | "number"
      | "textarea";
    purpose: "filter" | "specification" | "both";
    values: string[];
    isRequired: boolean;
    filterStatus: "active" | "inactive";
    order: number;
    appliesTo: string[];
    additionalDetails?: string;
  }) => {
    if (!categoryId) {
      toast.error("Category not found");
      return;
    }

    try {
      toast.loading("Creating attribute...", { id: "create-attribute" });

      const apiData = {
        name: attributeData.name,
        description: attributeData.description || "",
        inputType: attributeData.inputType,
        purpose: attributeData.purpose,
        values: attributeData.values,
        isRequired: attributeData.isRequired,
        filterStatus: attributeData.filterStatus,
        order: attributeData.order,
        categoryId: categoryId,
      };

      const createdAttribute = await createNewAttribute(categoryId, apiData);

      const newAttribute: Attribute = {
        id: createdAttribute.id,
        name: createdAttribute.name,
        description: createdAttribute.description,
        inputType: createdAttribute.inputType,
        purpose: createdAttribute.purpose,
        values: createdAttribute.values,
        filterStatus: createdAttribute.filterStatus,
        isRequired: createdAttribute.isRequired,
        order: createdAttribute.order,
        appliesTo: attributeData.appliesTo,
        additionalDetails: attributeData.additionalDetails,
      };

      setAttributes((prev) => [...prev, newAttribute]);
      toast.success("Attribute created successfully", {
        id: "create-attribute",
      });
    } catch (error: any) {
      console.error("Failed to create attribute:", error);
      toast.error(
        `Failed to create attribute: ${error.message || "Unknown error"}`,
        { id: "create-attribute" }
      );
    }
  };

  const handleRemoveAttribute = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this attribute?")) {
      try {
        toast.loading("Removing attribute...", { id: "remove-attribute" });
        // TODO: Add delete API call when endpoint is available
        // await removeAttribute(id);

        setAttributes((prev) => prev.filter((attr) => attr.id !== id));
        toast.success("Attribute removed", { id: "remove-attribute" });
      } catch (error: any) {
        console.error("Failed to remove attribute:", error);
        toast.error(
          `Failed to remove attribute: ${error.message || "Unknown error"}`,
          { id: "remove-attribute" }
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error("Category not found");
      return;
    }

    setIsUpdating(true);
    try {
      toast.loading("Finalizing changes...", { id: "submit-category" });

      // TODO: Update category to set isActive = true if needed
      await updateExistingCategory(categoryId, { isActive: true });

      toast.success("Category updated successfully!", {
        id: "submit-category",
      });

      setTimeout(() => {
        navigate("/admin/categories");
      }, 1000);
    } catch (error: any) {
      console.error("Failed to submit category:", error);
      toast.error(
        `Failed to submit category: ${error.message || "Unknown error"}`,
        { id: "submit-category" }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader label="Category Management" />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-gray-600">Loading category data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader label="Category Management" />

      {/* Main Content */}
      <div className="mx-auto px-10 py-8">
        <div className="flex gap-8">
          {/* Sticky Steps Sidebar */}
          <div className="w-60 max-w-60 shrink-0">
            <div className="sticky top-8 bg-white rounded-lg p-6 dark:bg-[#303030]">
              <Steps
                current={currentStep}
                items={steps}
                onChange={setCurrentStep}
                direction="vertical"
              />
            </div>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-md mb-6 dark:bg-[#303030]">
              <div className="mx-auto px-10 py-4 flex items-center justify-between">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={"secondary"}
                    className="bg-white hover:text-gray-900 dark:bg-[#303030]"
                    onClick={() => navigate("/admin/categories")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Back
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAsDraft}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating || !categoryName}
                  >
                    Save as draft
                  </button>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg dark:bg-[#303030]">
              {/* Step 0: Edit Category */}
              {currentStep === 0 && (
                <div className="p-8 pb-16 relative">
                  <h2 className="text-2xl font-semibold mb-2">Edit category</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Update category information to keep your catalog organized
                    and relevant.
                  </p>

                  <div className="space-y-6 mb-8">
                    {/* Category Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Category name *
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Fashion & Apparel"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="h-11"
                        maxLength={VALIDATION_RULES.categoryName.max}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {categoryName.length}/
                        {VALIDATION_RULES.categoryName.max} characters
                      </p>
                    </div>

                    {/* Category Image */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Category image *
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload a representative image for this category. This
                        will be displayed in category listings.
                      </p>
                      <ImageUpload
                        onImageChange={(urls) => setCategoryImage(urls)}
                        initialUrls={categoryImage}
                        maxImages={1}
                        maxSize={5}
                        acceptedFormats="image/jpeg,image/jpg,image/png,image/webp"
                        description="Upload category image"
                        bucket="World_of_Africa"
                        folder="categories"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdateCategory}
                    className="px-8 py-3 bg-[#0A0A0A] hover:bg-[#262626] text-white h-12 w-full sm:w-auto float-right"
                    disabled={
                      !categoryName.trim() ||
                      !categoryImage ||
                      categoryImage.length === 0 ||
                      isUpdating
                    }
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating category...
                      </>
                    ) : (
                      "Save and continue"
                    )}
                  </Button>
                </div>
              )}

              {/* Step 1: Manage Sub Categories */}
              {currentStep === 1 && (
                <div className="p-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    Manage sub categories
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add, edit, or remove subcategories to organize your products
                    effectively.
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubCategoryDrawerOpen(true)}
                      className="h-11"
                    >
                      + Add sub category
                    </Button>
                  </div>

                  {subCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {subCategories.map((subCategory) => (
                        <SubCategoryCard
                          key={subCategory.id}
                          subCategory={subCategory}
                          onRemove={handleRemoveSubCategory}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-8">
                      <p className="text-gray-500">
                        No sub categories added yet
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handleNextStep}
                      className="px-8 bg-[#0A0A0A] hover:bg-[#262626] text-white h-12"
                    >
                      Save and continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Manage Sub Category Types */}
              {currentStep === 2 && (
                <div className="p-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    Manage sub category types
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add, edit, or remove product types for better product
                    organization.
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubCategoryTypeDrawerOpen(true)}
                      className="h-11"
                      disabled={subCategories.length === 0}
                    >
                      + Add sub category type
                    </Button>
                  </div>

                  {subCategoryTypes.length > 0 ? (
                    <SubCategoryTypeTable
                      types={subCategoryTypes}
                      subCategories={subCategories}
                      onRemove={handleRemoveSubCategoryType}
                    />
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-8">
                      <p className="text-gray-500">
                        No sub category types added yet
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      onClick={handleNextStep}
                      className="px-8 bg-[#0A0A0A] hover:bg-[#262626] text-white h-12"
                    >
                      Save and continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Manage Attributes */}
              {currentStep === 3 && (
                <div className="p-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    Manage attributes
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add, edit, or remove product attributes for filtering and
                    specifications.
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsAttributeDrawerOpen(true)}
                      className="h-11"
                    >
                      + Add attributes
                    </Button>
                  </div>

                  {attributes.length > 0 ? (
                    <AttributeTable
                      attributes={attributes}
                      subCategoryTypes={subCategoryTypes}
                      onRemove={handleRemoveAttribute}
                    />
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-8">
                      <p className="text-gray-500">No attributes added yet</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      onClick={handleNextStep}
                      className="px-8 bg-[#0A0A0A] hover:bg-[#262626] text-white h-12"
                    >
                      Save and continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review and Submit */}
              {currentStep === 4 && (
                <ReviewSubmitSection
                  categoryName={categoryName}
                  subCategories={subCategories}
                  subCategoryTypes={subCategoryTypes}
                  attributes={attributes}
                  onBack={handleBackStep}
                  onSubmit={handleSubmit}
                  isSubmitting={isUpdating}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <AddSubCategoryDrawer
        isOpen={isSubCategoryDrawerOpen}
        onClose={() => setIsSubCategoryDrawerOpen(false)}
        onAddSubCategory={handleAddSubCategory}
      />

      <AddSubCategoryTypeDrawer
        isOpen={isSubCategoryTypeDrawerOpen}
        onClose={() => setIsSubCategoryTypeDrawerOpen(false)}
        onAddSubCategoryType={handleAddSubCategoryType}
        subCategories={subCategories}
      />

      <AddAttributeDrawer
        isOpen={isAttributeDrawerOpen}
        onClose={() => setIsAttributeDrawerOpen(false)}
        onAddAttribute={handleAddAttribute}
        subCategoryTypes={subCategoryTypes}
      />
    </div>
  );
}
