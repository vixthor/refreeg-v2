import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepAddressDetails({ formData, setFormData }: {
  formData: any,
  setFormData: (data: any) => void
}) {
  return (
    <div className="space-y-4">
      <div className="self-stretch text-Neutrals-Neutrals700 text-sm font-normal font-montserrat">
        <Label htmlFor="address">Address Line</Label>
        <Input
          id="address"
          placeholder="e.g., 12 Adewole Crescent"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="e.g., Abuja"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="e.g., FCT"
            value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="postal">Postal Code</Label>
          <Input
            id="postal"
            placeholder="e.g., 900211"
            value={formData.postal}
            onChange={e => setFormData({ ...formData, postal: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Select a country"
            value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
} 