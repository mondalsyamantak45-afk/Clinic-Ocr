"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { processPrescriptionImage } from "@/actions/ocr";
import { savePrescription } from "@/actions/prescriptions";
import { toast } from "sonner";
import { Upload as UploadIcon, FileImage, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export default function UploadClient({ patients, initialPatientId }: { patients: any[]; initialPatientId?: string }) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [result, setResult] = useState<any>(null);
  
  // Editable fields for review
  const [correctedText, setCorrectedText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null); // Reset previous result if any
    }
  };

  const handleProcess = async () => {
    if (!file) return toast.error("Please select an image first.");
    if (!patientId) return toast.error("Please select a patient.");

    try {
      setIsProcessing(true);
      setResult(null);
      setCorrectedText("");
      setAiSummary("");
      setDoctorNotes("");
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await processPrescriptionImage(formData);
      setResult(response);
      
      if (response.aiResult) {
        setCorrectedText(response.aiResult.corrected_text || "");
        setAiSummary(response.aiResult.summary || "");
        toast.success("Image processed successfully.");
      } else {
        setCorrectedText(response.rawOcrText || "");
        if (response.aiError) {
          toast.error("Gemini AI processing failed. Check the server terminal for details.");
        } else {
          toast.warning("AI processing was skipped because no text was found in the image.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    try {
      setIsSaving(true);
      const payload = {
        patientId,
        imageUrl: result.imageUrl,
        rawOcr: result.rawOcrText,
        correctedText,
        aiSummary,
        medicinesJson: result.aiResult?.medicines || [],
        important: result.aiResult?.important_findings?.length > 0,
        tags: result.aiResult?.tags || [],
        doctorNotes,
        ocrConfidence: result.ocrConfidence ? Math.round(result.ocrConfidence) : null,
        aiConfidence: result.aiResult?.confidence_score || null,
      };
      
      const saved = await savePrescription(payload);
      toast.success("Prescription saved successfully!");
      router.push(`/prescriptions/${saved.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save prescription.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={patientId} onValueChange={(v) => setPatientId(v || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
              {preview ? (
                <div className="space-y-4 w-full">
                  <div className="relative h-64 w-full rounded-md overflow-hidden bg-slate-200">
                    <img src={preview} alt="Preview" className="object-contain h-full w-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{file?.name}</span>
                    <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-40">
                  <UploadIcon className="h-10 w-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">Click to upload prescription</span>
                  <span className="text-xs text-slate-500 mt-1">JPG, JPEG, PNG</span>
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} />
                </label>
              )}
            </div>
            
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
              disabled={!file || !patientId || isProcessing}
              onClick={handleProcess}
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing AI...</>
              ) : (
                <><FileImage className="mr-2 h-4 w-4" /> Analyze Prescription</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {result ? (
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50/50 border-b">
              <CardTitle className="text-blue-800 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                3. Review & Save
              </CardTitle>
              <CardDescription>Verify the AI-extracted information before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-slate-50 border rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">OCR Confidence</div>
                  <div className="text-xl font-bold text-slate-800">
                    {result.ocrConfidence ? `${Math.round(result.ocrConfidence)}%` : "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 border rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">AI Confidence</div>
                  <div className="text-xl font-bold text-slate-800">
                    {result.aiResult?.confidence_score ? `${result.aiResult.confidence_score}%` : "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Raw OCR Text</Label>
                <div className="p-3 bg-slate-100 rounded-md border text-xs text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {result.rawOcrText || "No text could be extracted."}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Corrected Text</Label>
                <Textarea 
                  value={correctedText} 
                  onChange={(e) => setCorrectedText(e.target.value)} 
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>AI Summary</Label>
                <Textarea 
                  value={aiSummary} 
                  onChange={(e) => setAiSummary(e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor Notes (Optional)</Label>
                <Textarea 
                  placeholder="Add any personal notes here..."
                  value={doctorNotes} 
                  onChange={(e) => setDoctorNotes(e.target.value)} 
                  rows={2}
                />
              </div>

              {result.aiResult?.medicines && result.aiResult.medicines.length > 0 && (
                <div className="space-y-2">
                  <Label>Extracted Medicines</Label>
                  <div className="bg-slate-50 p-3 rounded-md border text-sm space-y-2">
                    {result.aiResult.medicines.map((med: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b pb-1 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-800">{med.name}</span>
                        <span className="text-slate-600">{med.dosage} - {med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                {isSaving ? "Saving..." : "Confirm & Save"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 min-h-[400px]">
            <FileImage className="h-12 w-12 mb-4 opacity-50" />
            <p>Upload and analyze an image to see results here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

