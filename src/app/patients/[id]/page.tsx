import { getPatient } from "@/actions/patients";
import { getPatientPrescriptions } from "@/actions/prescriptions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Calendar, Clock } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatient(id);
  const prescriptions = await getPatientPrescriptions(id);

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{patient.name}</h1>
        </div>
        <Link href={`/upload?patientId=${patient.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Patient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Age</span>
              <span className="font-medium">{patient.age}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Gender</span>
              <span className="font-medium capitalize">{patient.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-slate-500">Registered</span>
              <span className="font-medium">{dayjs(patient.createdAt).format("MMM D, YYYY")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>Past prescriptions and medical records.</CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p>No prescriptions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Link href={`/prescriptions/${prescription.id}`} key={prescription.id} className="block">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                      <div className="h-24 w-24 bg-slate-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {prescription.imageUrl ? (
                          <img src={prescription.imageUrl} alt="Prescription" className="object-cover h-ull w-full" />
                        ) : (
                          <FileText className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-900 line-clamp-1">
                            {prescription.aiSummary || "Review pending"}
                          </h4>
                          {prescription.important && <Badge variant="destructive">Important</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dayjs(prescription.createdAt).format("MMM D, YYYY")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dayjs(prescription.createdAt).format("h:mm A")}
                          </span>
                        </div>
                        {Array.isArray(prescription.tags) && prescription.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(prescription.tags as string[]).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
