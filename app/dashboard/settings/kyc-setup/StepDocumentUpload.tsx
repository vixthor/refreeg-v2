import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const documentTypes = [
  "NIN",
  "BVN",
  "International Passport",
  "Driver's License",
  "Voter's Card",
];

export default function StepDocumentUpload({ selectedDoc, setSelectedDoc, file, setFile }: {
  selectedDoc: string,
  setSelectedDoc: (doc: string) => void,
  file: File | null,
  setFile: (file: File | null) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documentType">Document Type</Label>
        <select
          id="documentType"
          className="w-full border rounded px-3 py-2"
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
        >
          <option value="">Select document type</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="documentFile">Upload Document</Label>
        <Input
          id="documentFile"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && <div className="text-xs text-muted-foreground mt-1">Selected: {file.name}</div>}
      </div>
    </div>
  );
} 