import { getPatients } from "@/actions/patients";
import UploadClient from "./UploadClient";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const patients = await getPatients();
  
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Prescription</h1>
      </div>
      <UploadClient patients={patients} initialPatientId={resolvedSearchParams.patientId} />
    </div>
  );
}

