import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { patients, prescriptions } from "@/db/schema";
import { count } from "drizzle-orm";

export default async function DashboardPage() {
  const [{ count: totalPatients }] = await db.select({ count: count() }).from(patients);
  const [{ count: totalPrescriptions }] = await db.select({ count: count() }).from(prescriptions);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrescriptions}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 mt-2">
            <Link href="/upload" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Prescription
              </Button>
            </Link>
            <Link href="/patients" className="w-full">
              <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50" size="sm">
                View Patients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

