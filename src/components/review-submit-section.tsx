import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface SubCategoryType {
  id: string;
  name: string;
  image: string;
  appliesTo: string[];
}

interface Attribute {
  id: string;
  name: string;
  inputType: string;
  appliesTo: string[];
  isRequired?: boolean;
}

interface ReviewSubmitSectionProps {
  categoryName: string;
  subCategories: SubCategory[];
  subCategoryTypes: SubCategoryType[];
  attributes: Attribute[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmitSection({
  categoryName,
  subCategories,
  subCategoryTypes,
  attributes,
//   onBack,
  onSubmit,
  isSubmitting,
}: ReviewSubmitSectionProps) {
  const getSubCategoryNames = (typeIds: string[]) => {
    return subCategories
      .filter((sc) => typeIds.includes(sc.id))
      .map((sc) => sc.name)
      .join(", ");
  };

  const getTypeNames = (typeIds: string[]) => {
    return subCategoryTypes
      .filter((type) => typeIds.includes(type.id))
      .map((type) => type.name)
      .join(", ");
  };

  const dataTypeLabels: Record<string, string> = {
    text: "Text",
    number: "Number",
    dropdown: "Dropdown",
    multiselect: "Multi-select",
    boolean: "Boolean",
    textarea: "Textarea",
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-8">Review and Submit</h2>

      {/* Category Name */}
      <div className="mb-8 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Category Name</h3>
        <p className="text-2xl font-bold">{categoryName}</p>
      </div>

      {/* Sub Categories */}
      <div className="mb-8 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Sub categories</h3>
        {subCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {subCategories.map((subCategory) => (
              <div key={subCategory.id} className="text-center">
                <img
                  src={subCategory.image}
                  alt={subCategory.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="font-medium text-sm">{subCategory.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No sub categories added</p>
        )}
      </div>

      {/* Sub Category Types */}
      <div className="mb-8 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Sub category types</h3>
        {subCategoryTypes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Image</TableHead>
                  <TableHead>Sub category name</TableHead>
                  <TableHead>Applies to</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategoryTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <img
                        src={type.image}
                        alt={type.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {getSubCategoryNames(type.appliesTo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500">No sub category types added</p>
        )}
      </div>

      {/* Attributes */}
      <div className="mb-8 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Attributes</h3>
        {attributes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Data type</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attribute) => (
                  <TableRow key={attribute.id}>
                    <TableCell className="font-medium">
                      {attribute.name}
                    </TableCell>
                    <TableCell>
                      {dataTypeLabels[attribute.inputType] ||
                        attribute.inputType}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {getTypeNames(attribute.appliesTo)}
                    </TableCell>
                    <TableCell className="text-center">
                      {attribute.isRequired ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500">No attributes added</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {/* <Button
          variant="outline"
          onClick={onBack}
          className="h-12 px-8"
          disabled={isSubmitting}
        >
          Back
        </Button> */}
        <Button
          onClick={onSubmit}
          className="px-8 bg-[#0A0A0A] hover:bg-[#262626] text-white h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}