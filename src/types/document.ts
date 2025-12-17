export interface IdentityDocument {
  id: string;
  type: "front" | "back" | "other";
  name: string; // Required field
  file: File;
  previewUrl: string;
}