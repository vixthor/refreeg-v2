import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepPersonalDetails({ formData, setFormData }: {
  formData: any,
  setFormData: (f: any) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="e.g. Alex"
          value={formData.fullName}
          onChange={(e) => setFormData((f: any) => ({ ...f, fullName: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input className="bg-gray-100"
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData((f: any) => ({ ...f, dob: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="e.g. +234 907 737 3738"
          value={formData.phone}
          onChange={(e) => setFormData((f: any) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address Line</Label>
        <Input
          id="address"
          placeholder="e.g. Address Line"
          value={formData.address}
          onChange={(e) => setFormData((f: any) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="City"
          value={formData.city}
          onChange={(e) => setFormData((f: any) => ({ ...f, city: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          placeholder="State"
          value={formData.state}
          onChange={(e) => setFormData((f: any) => ({ ...f, state: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postal">Postal Code</Label>
        <Input
          id="postal"
          placeholder="Postal code"
          value={formData.postal}
          onChange={(e) => setFormData((f: any) => ({ ...f, postal: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          placeholder="Country"
          value={formData.country}
          onChange={(e) => setFormData((f: any) => ({ ...f, country: e.target.value }))}
        />
      </div>
    </div>
  );
} 