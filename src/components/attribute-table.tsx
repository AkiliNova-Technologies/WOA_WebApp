import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubCategoryType {
  id: string;
  name: string;
}

interface Attribute {
  id: string;
  name: string;
  inputType: string;
  appliesTo: string[];
  isRequired?: boolean;
  additionalDetails?: string;
}

interface AttributeTableProps {
  attributes: Attribute[];
  subCategoryTypes: SubCategoryType[];
  onRemove: (id: string) => void;
}

export function AttributeTable({
  attributes,
  subCategoryTypes,
  onRemove,
}: AttributeTableProps) {
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">
              <input type="checkbox" className="rounded" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Data type</TableHead>
            <TableHead>Applies to</TableHead>
            <TableHead>Additional details</TableHead>
            <TableHead className="text-center">Required</TableHead>
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map((attribute) => (
            <TableRow key={attribute.id}>
              <TableCell>
                <input type="checkbox" className="rounded" />
              </TableCell>
              <TableCell className="font-medium">{attribute.name}</TableCell>
              <TableCell>
                {dataTypeLabels[attribute.inputType] || attribute.inputType}
              </TableCell>
              <TableCell className="text-gray-600">
                {getTypeNames(attribute.appliesTo)}
              </TableCell>
              <TableCell className="text-gray-600">
                {attribute.additionalDetails || "-"}
              </TableCell>
              <TableCell className="text-center">
                {attribute.isRequired ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(attribute.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}