import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Attribute {
  id: string;
  name: string;
  inputType: "dropdown" | "multiselect" | "boolean" | "text" | "number";
  purpose: string;
  values: string[];
}

interface AddAttributeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAttribute: (attribute: Omit<Attribute, "id">) => void;
}

export function AddAttributeDrawer({
  isOpen,
  onClose,
  onAddAttribute,
}: AddAttributeDrawerProps) {
  const [attributeName, setAttributeName] = useState("");
  const [inputType, setInputType] = useState<Attribute["inputType"]>("dropdown");
  const [purpose, setPurpose] = useState("");
  const [values, setValues] = useState<string[]>([""]);

  const handleAddValue = () => {
    setValues([...values, ""]);
  };

  const handleRemoveValue = (index: number) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleAddAttribute = () => {
    if (!attributeName.trim()) {
      alert("Please enter an attribute name");
      return;
    }

    if (!purpose.trim()) {
      alert("Please enter a purpose");
      return;
    }

    const attributeData = {
      name: attributeName.trim(),
      inputType,
      purpose: purpose.trim(),
      values: values.filter(value => value.trim() !== ""),
    };

    onAddAttribute(attributeData);
    handleClose();
  };

  const handleClose = () => {
    setAttributeName("");
    setInputType("dropdown");
    setPurpose("");
    setValues([""]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:bg-black/50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Content */}
      <div className="relative bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold">Add Attribute</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Attribute Name */}
          <div className="space-y-2">
            <Label htmlFor="attributeName" className="text-sm font-medium">
              Attribute Name
            </Label>
            <Input
              id="attributeName"
              type="text"
              placeholder="Enter attribute name"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Input Type */}
          <div className="space-y-2">
            <Label htmlFor="inputType" className="text-sm font-medium">
              Input Type
            </Label>
            <Select value={inputType} onValueChange={(value: Attribute["inputType"]) => setInputType(value)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropdown">Dropdown (single select)</SelectItem>
                <SelectItem value="multiselect">Multi-Select Checkboxes</SelectItem>
                <SelectItem value="boolean">Boolean (yes or no)</SelectItem>
                <SelectItem value="text">Single-line text</SelectItem>
                <SelectItem value="number">Number/Decimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              Purpose
            </Label>
            <Input
              id="purpose"
              type="text"
              placeholder="Enter purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Attribute Values - Only show for dropdown and multiselect */}
          {(inputType === "dropdown" || inputType === "multiselect") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Attribute Values</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddValue}
                  className="h-9"
                >
                  <Plus className="size-4 mr-1" />
                  Add Value
                </Button>
              </div>
              
              <div className="space-y-2">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      placeholder={`Value ${index + 1}`}
                      className="h-11"
                    />
                    {values.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveValue(index)}
                        className="h-11 w-11 text-red-500 hover:text-red-700"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAttribute}
            className="flex-1 h-11 bg-[#CC5500] hover:bg-[#B34D00]"
            disabled={!attributeName.trim() || !purpose.trim()}
          >
            Add Attribute
          </Button>
        </div>
      </div>
    </div>
  );
}