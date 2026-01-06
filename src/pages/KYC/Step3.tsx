import { TextEditor } from "@/components/text-editor";
import { VideoUpload } from "@/components/video-upload";
import type { FormData } from "./StepsContainer";
import { Button } from "@/components/ui/button";

interface Step3Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step3({ formData, updateFormData }: Step3Props) {
  const handleStoreDescriptionChange = (value: string) => {
    updateFormData({ storeDescription: value });
    // Removed auto-completion logic - user must click "Save and continue"
  };

  const handleVideoChange = (url: string | null) => {
    updateFormData({ videoUrl: url });
  };

  // Don't allow proceeding without email verification
  if (!formData.emailVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        {/* Illustration */}
        <div className="mb-8">
          <svg
            width="300"
            height="250"
            viewBox="0 0 300 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Email verification required illustration */}
            <circle cx="150" cy="100" r="80" fill="#f5f5f5" />
            <path
              d="M150 60 L150 100 L175 80"
              stroke="#303030"
              strokeWidth="3"
              fill="none"
            />
            <text
              x="150"
              y="180"
              textAnchor="middle"
              className="text-lg font-semibold fill-[#303030]"
            >
              Email Verification Required
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Email Verification First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please complete Step 1 email verification before adding your store
          description.
        </p>

        <Button
          onClick={() => window.location.reload()} // Or navigate back if you have navigation logic
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 1
        </Button>
      </div>
    );
  }

  // Don't allow proceeding without location verification
  if (!formData.locationVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] py-12">
        {/* Illustration */}
        <div className="mb-8">
          <svg
            width="300"
            height="250"
            viewBox="0 0 300 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Location verification required illustration */}
            <circle cx="150" cy="100" r="80" fill="#f5f5f5" />
            <path
              d="M150 60 L150 100 L175 80"
              stroke="#303030"
              strokeWidth="3"
              fill="none"
            />
            <text
              x="150"
              y="180"
              textAnchor="middle"
              className="text-lg font-semibold fill-[#303030]"
            >
              Location Verification Required
            </text>
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Complete Location Verification First
        </h2>

        <p className="text-[#303030] dark:text-gray-400 mb-8 text-center max-w-md">
          Please complete Step 2 location verification before adding your store
          description.
        </p>

        <Button
          onClick={() => window.location.reload()} // Or navigate back if you have navigation logic
          className="bg-[#CC5500] hover:bg-[#CC5500]/90 text-white h-11 px-12 rounded-full"
        >
          Go Back to Step 2
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Store Description Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Store Description</h2>
        </div>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          Tell customers what makes your store unique. This will help buyers
          understand your products and story.
        </p>

        <div>
          <TextEditor
            value={formData.storeDescription}
            onChange={handleStoreDescriptionChange}
            placeholder="Start writing your amazing content... Describe what you sell, your mission, and what makes your store special."
            className="mb-4"
          />
        </div>

      </div>

      {/* Seller Story Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-2">Seller Story</h2>
        <p className="text-sm text-[#303030] mb-6 dark:text-gray-400">
          We'd love to hear your story. Record a short video introducing
          yourself and your business—this helps buyers connect with the real
          person behind the products.
        </p>

        <VideoUpload
          onVideoChange={handleVideoChange}
          maxSize={100}
          className="w-full"
          description="Recommended size: 1920×1080px · Format: MP4 · Max time: 60secs"
          bucket="World_of_Africa"
          folder="seller-stories"
          initialUrl={formData.videoUrl || undefined}
        />

        {formData.videoUrl && (
          <div className="mt-4 text-sm text-green-600 dark:text-green-400">
            ✓ Seller story video uploaded
          </div>
        )}

        
      </div>
    </div>
  );
}