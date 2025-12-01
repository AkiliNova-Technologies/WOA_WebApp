import { SiteHeader } from "@/components/site-header";
import { TextEditor } from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminCreateDropoffPage() {
  const navigate = useNavigate();
  return (
    <>
      <SiteHeader label="Logistics Studio" />
      <div className="min-h-screen">
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Back to Logistics</h1>
            </div>
          </div>

          <Card className="shadow-none border-none">
            <CardHeader>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">
                  Create new dropoff point
                </h1>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
                 gap-6"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-md font-medium">
                      Drop off point name
                    </Label>
                    <Input
                      placeholder="Input your text"
                      value=""
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-md font-medium">Enter Country</Label>
                    {/* this should be a shadcn select dropdown */}
                    <Input
                      placeholder="Select country of operations"
                      value=""
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-md font-medium">
                      Assign Manager
                    </Label>
                    {/* this should be a shadcn select dropdown */}
                    <Input
                      placeholder="select from staff members"
                      value=""
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-md font-medium">Enter Region</Label>
                    {/* this should be a shadcn select dropdown */}
                    <Input
                      placeholder="Select the region its serving"
                      value=""
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-md font-medium">Additional Info</Label>
                <TextEditor />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-row items-center justify-between bg-white dark:bg-[#303030] p-6 rounded-md shadow-none border-none">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Confirm location on map</h1>
            </div>
            <Button
              variant={"secondary"}
              className="h-11 bg-[#CC5500] hover:bg-[#CC55500]/90 text-white font-semibold"
            >
              Confirm address on map
            </Button>
          </Card>

          <Card className="flex flex-col justify-between bg-white dark:bg-[#303030] p-6 rounded-md shadow-none border-none">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Cost to warehouse</h1>
            </div>
            <div className="space-y-3">
              <Label className="text-md font-medium">
                Fees per package in USD
              </Label>
              <Input
                placeholder="Input the amount in USD"
                value={""}
                className="h-11"
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              variant={"secondary"}
              className="h-11 bg-[#CC5500] hover:bg-[#CC55500]/90 text-white font-semibold w-2xs"
            >
              Save
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
