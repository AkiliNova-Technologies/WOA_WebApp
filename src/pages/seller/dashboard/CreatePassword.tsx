import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CreatePassword() {
  return (
    <div>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Create Your Password</CardTitle>
          <p className="text-sm text-gray-500">
            For security reasons, please create a new permanent password for
            your account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="font-medium">Current Password</Label>
              <Input
                placeholder="Enter your current password"
                className="h-11"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-medium">Password</Label>
              <Input
                placeholder="Enter your new password"
                className="h-11"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-medium">Confirm Password</Label>
              <Input
                placeholder="Confirm your new password"
                className="h-11"
              />
            </div>

            <Separator />

            <div className="flex flex-1 flex-row gap-5 items-center">
                <Button variant={"secondary"} className="h-11 flex-1">Cancel</Button>
                <Button variant={"secondary"} className="h-11 bg-[#CC5500] hover:bg-[#CC5500]/80 text-white flex-1">Update Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
