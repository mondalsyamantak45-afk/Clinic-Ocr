import { getPrescription } from "@/actions/prescriptions";
import { getPatient } from "@/actions/patients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Pill } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prescription = await getPrescription(id);
  
  if (!prescription) return <div>Prescription not found</div>;
  
  const patient = await getPatient(prescription.patientId);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${prescription.patientId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prescription Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Original Image</span>
                <span className="text-sm font-normal text-slate-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {dayjs(prescription.createdAt).format("MMM D, YYYY h:mm A")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center min-h-[300px]">
                {prescription.imageUrl ? (
                  <img src={prescription.imageUrl} alt="Prescription" className="max-w-full h-auto object-contain" />
                ) : (
                  <span className="text-slate-400">No image available</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Raw OCR Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-slate-600 bg-slate-50 p-4 rounded-md border max-h-[300px] overflow-y-auto">
                {prescription.rawOcr || "No OCR text extracted."}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50/50 pb-3 border-b">
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{patient?.name}</p>
                <p className="text-sm text-slate-500">{patient?.age} yrs • {patient?.gender} • {patient?.phone}</p>
              </div>
              <Link href={`/patients/${patient?.id}`}>
                <Button variant="outline" size="sm">View Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>AI Summary & Notes</span>
                {prescription.important && <Badge variant="destructive">Important</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Corrected Text</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border">
                  {prescription.correctedText}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Summary</h4>
                <p className="text-sm text-slate-700">{prescription.aiSummary}</p>
              </div>
              {prescription.doctorNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Doctor Notes</h4>
                  <p className="text-sm text-slate-700 italic border-l-2 border-blue-400 pl-3 py-1 bg-blue-50/30">
                    {prescription.doctorNotes}
                  </p>
                </div>
              )}
              {Array.isArray(prescription.tags) && prescription.tags.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    ${(prescription.tags as string[]).map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {Array.isArray(prescription.medicinesJson) && prescription.medicinesJson.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-600" />
                  Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(prescription.medicinesJson as any[]).map((med, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p>
                          <span className="font-semibold text-slate-900">{med.name}</span>
                        </p>
                        <p className="text-xs text-slate-500">{med.dosage}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {med.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
