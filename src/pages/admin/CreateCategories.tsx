import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, PenIcon, Trash2Icon } from "lucide-react";
import Steps from "@/components/steps";
import { TextEditor } from "@/components/text-editor";
import { AddSubCategoryDrawer } from "@/components/add-sub-category-drawer";
import { AddSubCategoryTypeDrawer } from "@/components/add-sub-category-type-drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubCategoryAttributesSection } from "@/components/sub-category-attribute-section";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import {
  DataTable,
  type TableAction,
  type TableField,
} from "@/components/data-table";
import { AddAttributeDrawer } from "@/components/add-attribute-drawer";

// Interfaces
export interface SubCategory {
  id: string;
  name: string;
  image: string;
  types: SubCategoryType[];
}

export interface SubCategoryType {
  id: string;
  name: string;
  image: string;
}

export interface Attribute {
  id: string;
  name: string;
  inputType: "dropdown" | "multiselect" | "boolean" | "text" | "number";
  purpose: string;
  values: string[];
  filterStatus: "active" | "inactive";
  [key: string]: any;
}

export default function AdminCreateCategoriesPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubCategoryDrawerOpen, setIsSubCategoryDrawerOpen] = useState(false);
  const [isSubCategoryTypeDrawerOpen, setIsSubCategoryTypeDrawerOpen] =
    useState(false);
  const [isAttributeDrawerOpen, setIsAttributeDrawerOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const steps = [
    { title: "Create a category" },
    { title: "Create types" },
    { title: "Create attributes" },
    { title: "Assign attributes" },
  ];

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSaveAsDraft = () => {
    console.log("Save as draft clicked");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Sub Category Functions
  const handleAddSubCategory = (subCategory: Omit<SubCategory, "types">) => {
    const newSubCategory: SubCategory = {
      ...subCategory,
      types: [],
    };
    setSubCategories((prev) => [...prev, newSubCategory]);
  };

  const handleRemoveSubCategory = (id: string) => {
    setSubCategories((prev) => prev.filter((subCat) => subCat.id !== id));
  };

  // Sub Category Type Functions
  const handleAddSubCategoryType = (subCategoryType: SubCategoryType) => {
    if (selectedSubCategory) {
      setSubCategories((prev) =>
        prev.map((subCat) =>
          subCat.id === selectedSubCategory.id
            ? { ...subCat, types: [...subCat.types, subCategoryType] }
            : subCat
        )
      );
      setSelectedSubCategory(null);
    }
  };

  const handleRemoveSubCategoryType = (
    subCategoryId: string,
    typeId: string
  ) => {
    setSubCategories((prev) =>
      prev.map((subCat) =>
        subCat.id === subCategoryId
          ? {
              ...subCat,
              types: subCat.types.filter((type) => type.id !== typeId),
            }
          : subCat
      )
    );
  };

  // Attribute Functions
  const handleAddAttribute = (attributeData: {
    name: string;
    inputType: "dropdown" | "multiselect" | "boolean" | "text" | "number";
    purpose: string;
    values: string[];
  }) => {
    const newAttribute: Attribute = {
      id: Date.now().toString(),
      name: attributeData.name,
      inputType: attributeData.inputType,
      purpose: attributeData.purpose,
      values: attributeData.values,
      filterStatus: "active",
    };
    setAttributes((prev) => [...prev, newAttribute]);
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const filteredAttributes = attributes.filter((attribute) => {
    const matchesSearch =
      searchQuery === "" ||
      attribute.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Table fields for attributes
  const attributeFields: TableField<Attribute>[] = [
    {
      key: "name",
      header: "Attribute Name",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium text-md">{row.name}</span>
          </div>
        </div>
      ),
      align: "left",
    },
    {
      key: "inputType",
      header: "Input Type",
      cell: (value) => {
        const typeLabels = {
          dropdown: "Dropdown",
          multiselect: "Multi-Select",
          boolean: "Boolean",
          text: "Text",
          number: "Number",
        };
        return (
          <span className="font-medium">
            {typeLabels[value as keyof typeof typeLabels]}
          </span>
        );
      },
      align: "center",
      enableSorting: true,
    },
    {
      key: "filterStatus",
      header: "Filter Status",
      cell: (value) => (
        <Badge
          variant={value === "active" ? "default" : "secondary"}
          className={value === "active" ? "bg-green-100 text-green-800" : ""}
        >
          {value as string}
        </Badge>
      ),
      align: "center",
      enableSorting: true,
    },
    {
      key: "values",
      header: "Attribute Values",
      cell: (value) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {(value as string[]).map((val, index) => (
            <Badge key={index} variant="outline" className="text-md rounded-sm">
              {val}
            </Badge>
          ))}
        </div>
      ),
      align: "center",
      enableSorting: true,
    },
  ];

  const attributeActions: TableAction<Attribute>[] = [
    {
      type: "edit",
      label: "Edit Attribute",
      icon: <PenIcon className="size-5" />,
      onClick: (attribute) => {
        // Implement edit logic here
        console.log("Edit attribute:", attribute.id);
      },
    },
    {
      type: "delete",
      label: "Delete Attribute",
      icon: <Trash2Icon className="size-5" />,
      onClick: (attribute) => {
        handleRemoveAttribute(attribute.id);
      },
    },
  ];

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
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Back to Categories
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAsDraft}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Save as draft
                  </button>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              {/* Step 1: Create Category and Sub Categories */}
              {currentStep === 0 && (
                <div className="">
                  <div className="bg-white rounded-lg p-6 dark:bg-[#303030]">
                    <h2 className="text-2xl font-semibold mb-6">
                      Create New Category
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Enter category name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description
                        </label>
                        <TextEditor />
                      </div>
                    </div>
                  </div>

                  {/* Manage Sub Categories container */}
                  <div className="bg-white rounded-lg p-6 mt-6 dark:bg-[#303030]">
                    <div className="flex flex-row flex-1 justify-between items-center mb-6">
                      <div>
                        <h2 className="text-[#262626] font-semibold dark:text-white">
                          Manage Sub Categories
                        </h2>
                        <p className="text-[#737373] text-sm">
                          Add or remove sub categories from this category
                        </p>
                      </div>
                      <div>
                        <Button
                          variant={"secondary"}
                          className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
                          onClick={() => setIsSubCategoryDrawerOpen(true)}
                        >
                          Add Sub Category
                        </Button>
                      </div>
                    </div>

                    {/* Sub Categories List */}
                    {subCategories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {subCategories.map((subCategory) => (
                          <div
                            key={subCategory.id}
                            className="border rounded-lg flex flex-col items-center gap-3 max-w-3xs relative p-2 group transition-all duration-200"
                          >
                            {/* Image Container */}
                            <div className="w-full h-56 rounded-md overflow-hidden relative">
                              <img
                                src={subCategory.image}
                                alt={subCategory.name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                {/* Remove Button - Hidden by default, visible on hover */}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveSubCategory(subCategory.id)
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-95 group-hover:scale-100 bg-red-500 hover:bg-red-600 text-white border-0"
                                >
                                  <X className="size-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {/* Category Name */}
                            <div className="flex-1 pb-3">
                              <h2 className="font-medium text-lg text-center">
                                {subCategory.name}
                              </h2>
                            </div>

                            {/* Remove Button for mobile/fallback - Always visible but styled differently */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveSubCategory(subCategory.id)
                              }
                              className="rounded-full bg-white/90 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 sm:hidden absolute top-3 right-3"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-200">
                          No sub categories added yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click "Add Sub Category" to get started
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Create Sub Category Types */}
              {currentStep === 1 && (
                <div className="">
                  <div className="bg-white rounded-lg p-8 dark:bg-[#303030]">
                    <h2 className="text-2xl font-semibold">
                      Create Sub Category Types
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {subCategories.map((subCategory) => (
                      <div
                        key={subCategory.id}
                        className="bg-white rounded-lg p-6 mt-6 space-y-6"
                      >
                        <div className="">
                          <Label className="block text-md font-medium mb-2">
                            Sub Category
                          </Label>
                          <Input
                            value={subCategory.name}
                            className="h-11"
                            disabled
                          />
                        </div>

                        {/* Manage Sub Category Types */}
                        <div className="flex flex-row flex-1 justify-between items-center mb-6">
                          <div>
                            <h2 className="text-[#262626] font-semibold mb-1">
                              Add Sub Category Types
                            </h2>
                            <p className="text-[#737373] text-sm">
                              Add or remove sub category types from this sub
                              category
                            </p>
                          </div>
                          <div>
                            <Button
                              variant={"secondary"}
                              className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-semibold"
                              onClick={() => {
                                setSelectedSubCategory(subCategory);
                                setIsSubCategoryTypeDrawerOpen(true);
                              }}
                            >
                              Add Sub Category Type
                            </Button>
                          </div>
                        </div>

                        {/* Sub Category Types List */}
                        {subCategory.types.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {subCategory.types.map((type) => (
                              <div
                                key={type.id}
                                className="border rounded-lg flex flex-col items-center gap-3 max-w-3xs relative p-2 group transition-all duration-200"
                              >
                                {/* Image Container */}
                                <div className="w-full h-56 rounded-md overflow-hidden relative">
                                  <img
                                    src={type.image}
                                    alt={type.name}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  />

                                  {/* Hover Overlay */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveSubCategoryType(
                                          subCategory.id,
                                          type.id
                                        )
                                      }
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-95 group-hover:scale-100 bg-red-500 hover:bg-red-600 text-white border-0"
                                    >
                                      <X className="size-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>

                                {/* Type Name */}
                                <div className="flex-1 pb-3">
                                  <h2 className="font-medium text-lg text-center">
                                    {type.name}
                                  </h2>
                                </div>

                                {/* Remove Button for mobile */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveSubCategoryType(
                                      subCategory.id,
                                      type.id
                                    )
                                  }
                                  className="rounded-full bg-white/90 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 sm:hidden absolute top-3 right-3"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">
                              No sub category types added yet
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Click "Add Sub Category Type" to get started
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {subCategories.length === 0 && (
                      <div className="bg-white rounded-lg p-6 text-left mt-6">
                        <div className="bg-white rounded-lg p-6 pt-0 space-y-6">
                          <div className="">
                            <Label className="block text-md font-medium mb-2">
                              Sub Category
                            </Label>
                            <Input
                              value="No Sub Categories Available"
                              className="h-11"
                              disabled
                            />
                          </div>

                          {/* Manage Sub Category Types */}
                          <div className="flex flex-row flex-1 justify-between items-center mb-6">
                            <div>
                              <h2 className="text-[#262626] font-semibold mb-1">
                                Add Sub Category Types
                              </h2>
                              <p className="text-[#737373] text-sm">
                                Add or remove sub category types from this sub
                                category
                              </p>
                            </div>
                            <div>
                              <Button
                                variant={"secondary"}
                                className="h-11 bg-gray-200 hover:bg-gray-200 text-gray-600 font-medium"
                                onClick={() => {}}
                              >
                                Add Sub Category Type
                              </Button>
                            </div>
                          </div>

                          {/* Sub Category Types List */}

                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">
                              No sub category types added yet
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Click "Add Sub Category Type" to get started
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-500 px-6">
                          No sub categories found. Please add sub categories in
                          the previous step.
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="px-8 py-3 w-xs h-12"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Create Attributes */}
              {currentStep === 2 && (
                <div>
                  <div className="bg-white rounded-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6">
                      Create Attributes
                    </h2>

                    <div>
                      {/* Search and Filter Section */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2">
                        <div className="w-full sm:w-auto sm:flex-1">
                          <Search
                            placeholder="Search for an attribute..."
                            value={searchQuery}
                            onSearchChange={setSearchQuery}
                            className="rounded-full"
                          />
                        </div>

                        <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                          <div className="flex gap-2 items-center">
                            <Button
                              className="bg-[#CC5500] h-11 hover:bg-[#CC5500]/90 font-semibold"
                              onClick={() => setIsAttributeDrawerOpen(true)}
                            >
                              Add attribute
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <DataTable<Attribute>
                          data={filteredAttributes}
                          fields={attributeFields}
                          actions={attributeActions}
                          enableSelection={true}
                          enablePagination={true}
                          pageSize={10}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="px-8 py-3 w-xs h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review and Assign Attributes */}
              {currentStep === 3 && (
                <div>
                  <div className="bg-white rounded-lg p-8">
                    <h2 className="text-2xl font-semibold">
                      Assign Attributes
                    </h2>
                  </div>

                  <div className="bg-white p-6 rounded-md mt-6">
                    {subCategories.length > 0 ? (
                      <div className="space-y-4">
                        {subCategories.map((subCategory) => (
                          <SubCategoryAttributesSection
                            key={subCategory.id}
                            subCategory={subCategory}
                            attributes={attributes}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                          No sub-categories found
                        </p>
                        <p className="text-gray-400 mt-1">
                          Please add sub-categories in previous steps to assign
                          attributes
                        </p>
                      </div>
                    )}

                  </div>
                    {/* Action Buttons */}
                    <div className="flex justify-between mt-8 pt-6">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="px-8 py-3 w-xs h-12"
                      >
                        Back
                      </Button>
                      <Button className="px-8 py-3 bg-[#CC5500] hover:bg-[#B34D00] w-xs h-12">
                        Create Category
                      </Button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Sub Category Drawer */}
      <AddSubCategoryDrawer
        isOpen={isSubCategoryDrawerOpen}
        onClose={() => setIsSubCategoryDrawerOpen(false)}
        onAddSubCategory={handleAddSubCategory}
      />

      {/* Add Sub Category Type Drawer */}
      <AddSubCategoryTypeDrawer
        isOpen={isSubCategoryTypeDrawerOpen}
        onClose={() => {
          setIsSubCategoryTypeDrawerOpen(false);
          setSelectedSubCategory(null);
        }}
        onAddSubCategoryType={handleAddSubCategoryType}
      />

      {/* Add Attribute Drawer */}
      <AddAttributeDrawer
        isOpen={isAttributeDrawerOpen}
        onClose={() => setIsAttributeDrawerOpen(false)}
        onAddAttribute={handleAddAttribute}
      />
    </div>
  );
}
