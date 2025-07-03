import { Label } from "@/components/ui/label";

const inputBoxClass =
  "w-[530px] h-20 px-2.5 pt-[6px] text-neutral-700 text-sm font-normal font-montserrat rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-200 resize-none";

export default function StepPersonalDetails({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const updateField = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* First Name */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="firstName" className="font-montserrat">
            First Name
          </Label>
          <textarea
            id="firstName"
            placeholder="e.g. John"
            value={formData.firstName || ""}
            onChange={(e) => updateField("firstName", e.target.value)}
            rows={1}
            className={inputBoxClass}
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="lastName" className="font-montserrat">
            Last Name
          </Label>
          <textarea
            id="lastName"
            placeholder="e.g. Doe"
            value={formData.lastName || ""}
            onChange={(e) => updateField("lastName", e.target.value)}
            rows={1}
            className={inputBoxClass}
          />
        </div>
      </div>

      {/* Phone Number & DOB */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="phone" className="font-montserrat">
            Phone Number
          </Label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. +234 801 234 5678"
            value={formData.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputBoxClass}
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1 w-[530px]">
          <Label className="font-montserrat">Date of Birth</Label>
          <div className="flex gap-2">
            {/* Day */}
            <select
              value={formData.dobDay || ""}
              onChange={(e) => updateField("dobDay", e.target.value)}
              className="flex-1 h-20 px-2.5 pt-[6px] rounded-[10px] outline outline-1 outline-neutral-200 text-sm font-montserrat"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={formData.dobMonth || ""}
              onChange={(e) => updateField("dobMonth", e.target.value)}
              className="flex-1 h-20 px-2.5 pt-[6px] rounded-[10px] outline outline-1 outline-neutral-200 text-sm font-montserrat"
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, i) => (
                <option key={i + 1} value={i + 1}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={formData.dobYear || ""}
              onChange={(e) => updateField("dobYear", e.target.value)}
              className="flex-1 h-20 px-2.5 pt-[6px] rounded-[10px] outline outline-1 outline-neutral-200 text-sm font-montserrat"
            >
              <option value="">Year</option>
              {Array.from(
                { length: 100 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
