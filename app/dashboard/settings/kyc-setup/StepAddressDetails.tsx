import { Label } from "@/components/ui/label";

export const inputBoxClass =
  "w-[530px] h-20 px-2.5 pt-[6px] text-neutral-700 text-sm font-normal font-montserrat rounded-[10px] outline outline-1 outline-neutral-200 resize-none";

export default function StepAddressDetails({
  formData,
  setFormData,
  error,
}: {
  formData: any;
  setFormData: (data: any) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-4 ">
      {error && (
        <div className="text-red-600 text-sm font-montserrat mb-2">{error}</div>
      )}
      <div className="flex flex-col gap-4">
        {/* Address Line */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="address">Address Line</Label>
          <textarea
            id="address"
            placeholder="e.g., 12 Adewole Crescent"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={1}
            className={inputBoxClass}
          />
        </div>
        {/* City */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="city">City</Label>
          <textarea
            id="city"
            placeholder="e.g., Abuja"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            rows={1}
            className={inputBoxClass}
          />
        </div>
        {/* State */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="state">State</Label>
          <textarea
            id="state"
            placeholder="e.g., FCT"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            rows={1}
            className={inputBoxClass}
          />
        </div>
        {/* Postal Code */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="postal">Postal Code</Label>
          <textarea
            id="postal"
            placeholder="e.g., 900211"
            value={formData.postal}
            onChange={(e) =>
              setFormData({ ...formData, postal: e.target.value })
            }
            rows={1}
            className={inputBoxClass}
          />
        </div>
        {/* Country */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="country">Country</Label>
          <textarea
            id="country"
            placeholder="Select a country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            rows={1}
            className={inputBoxClass}
          />
        </div>
      </div>
    </div>
  );
}
