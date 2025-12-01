import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type {
  Attribute,
  SubCategory,
  SubCategoryType,
} from "@/pages/admin/CreateCategories";

interface SubCategoryAttributesSectionProps {
  subCategory: SubCategory;
  attributes: Attribute[];
}

export function SubCategoryAttributesSection({
  subCategory,
  attributes,
}: SubCategoryAttributesSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Sub Category Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-lg text-gray-900">
              {subCategory.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Sub Category Types Section */}
      <div className="px-4 pb-4 space-y-4">
        {subCategory.types.length > 0 ? (
          <div className="space-y-4">
            {subCategory.types.map((type) => (
              <SubCategoryTypeAttributesSection
                key={type.id}
                type={type}
                attributes={attributes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No types added to this sub-category
          </div>
        )}
      </div>
    </div>
  );
}

// Component for Sub Category Types
interface SubCategoryTypeAttributesSectionProps {
  type: SubCategoryType;
  attributes: Attribute[];
}

function SubCategoryTypeAttributesSection({
  type,
  attributes,
}: SubCategoryTypeAttributesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [assignedAttributes, setAssignedAttributes] = useState<
    Record<string, boolean>
  >({});

  const handleAttributeToggle = (attributeId: string, checked: boolean) => {
    setAssignedAttributes((prev) => ({
      ...prev,
      [attributeId]: checked,
    }));
  };

  const handleTypeToggle = (checked: boolean) => {
    const newState: Record<string, boolean> = {};
    attributes.forEach((attr) => {
      newState[attr.id] = checked;
    });
    setAssignedAttributes(newState);
  };

  const getAssignedCount = () => {
    return Object.values(assignedAttributes).filter(Boolean).length;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Type Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Switch
            id={`type-${type.id}`}
            checked={
              attributes.length > 0 && getAssignedCount() === attributes.length
            }
            onCheckedChange={handleTypeToggle}
          />
          <h5 className="font-medium text-gray-900 text-mb flex-1">
            {type.name}
          </h5>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Type Attributes List */}
      {isExpanded && attributes.length > 0 && (
        <div className="mt-4 space-y-3 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {attributes.map((attribute) => (
            <div key={attribute.id} className="flex items-center gap-3 py-2 ">
              <Switch
                id={`type-attr-${attribute.id}-${type.id}`}
                checked={!!assignedAttributes[attribute.id]}
                onCheckedChange={(checked) =>
                  handleAttributeToggle(attribute.id, checked)
                }
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {attribute.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && attributes.length === 0 && (
        <div className="mt-4 text-center py-4 text-gray-500 text-sm">
          No attributes available to assign
        </div>
      )}
    </div>
  );
}
