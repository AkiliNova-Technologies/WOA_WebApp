import { TextEditor } from "@/components/text-editor";
import { VideoUpload } from "@/components/video-upload";
import type { FormData } from "./StepsContainer";

interface Step3Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step3({ formData, updateFormData }: Step3Props) {
  const handleStoreDescriptionChange = (value: string) => {
    updateFormData({ storeDescription: value });
  };

  const handleVideoChange = (file: File | null) => {
    updateFormData({ videoFile: file });
  };

  return (
    <div>
      {/* Store Description Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Store Description</h2>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          Tell customers what makes your store unique.
        </p>

        <div>
          <TextEditor
            value={formData.storeDescription}
            onChange={handleStoreDescriptionChange}
            placeholder="Start writing your amazing content..."
            className="mb-4"
          />
        </div>
      </div>

      {/* Seller Story Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-2">Seller Story</h2>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          We'd love to hear your story. Record a short video introducing yourself and your business—this helps buyers connect with the real person behind the products.
        </p>

        <VideoUpload
          onVideoChange={handleVideoChange}
          maxSize={100}
          className="w-full"
          description="Recommended size: 1920×1080px · Format: JPEG or PNG thumbnail · Max time: 60secs"
        />
      </div>
    </div>
  );
}