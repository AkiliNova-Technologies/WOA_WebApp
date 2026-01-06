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

interface SubCategory {
  id: string;
  name: string;
}

interface SubCategoryType {
  id: string;
  name: string;
  image: string;
  appliesTo: string[];
}

interface SubCategoryTypeTableProps {
  types: SubCategoryType[];
  subCategories: SubCategory[];
  onRemove: (id: string) => void;
}

export function SubCategoryTypeTable({
  types,
  subCategories,
  onRemove,
}: SubCategoryTypeTableProps) {
  const getSubCategoryNames = (typeIds: string[]) => {
    return subCategories
      .filter((sc) => typeIds.includes(sc.id))
      .map((sc) => sc.name)
      .join(", ");
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">
              <input type="checkbox" className="rounded" />
            </TableHead>
            <TableHead className="w-24">Image</TableHead>
            <TableHead>Sub category name</TableHead>
            <TableHead>Applies to</TableHead>
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                <input type="checkbox" className="rounded" />
              </TableCell>
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
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(type.id)}
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