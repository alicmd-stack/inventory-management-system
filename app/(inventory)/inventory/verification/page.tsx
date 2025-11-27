"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type VerificationRecord = {
  id: string;
  asset: {
    asset_tag_number: string;
    asset_description: string | null;
  } | null;
  verification_date: string;
  condition: string;
  physical_location_at_verification: string | null;
  remarks: string | null;
  verified_by: string | null;
  verified_by_name: string | null;
};

const conditionColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Good: "bg-green-100 text-green-800",
  Fair: "bg-yellow-100 text-yellow-800",
  Poor: "bg-red-100 text-red-800",
};

export default function VerificationPage() {
  const supabase = createClient();

  const { data: verifications, isLoading } = useQuery({
    queryKey: ["verification-history-full"],
    queryFn: async (): Promise<VerificationRecord[]> => {
      const { data, error } = await supabase
        .schema("inventory")
        .from("verification_history")
        .select(
          `
          *,
          asset:asset_id(
            asset_tag_number,
            asset_description
          )
        `
        )
        .order("verification_date", { ascending: false });

      if (error) {
        console.error("Error fetching verifications:", error);
        return [];
      }

      const verifierIds = Array.from(
        new Set(data.map((record) => record.verified_by).filter(Boolean))
      ) as string[];

      const verifierMap = new Map<string, string>();
      if (verifierIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("user_profile")
          .select("id, full_name")
          .in("id", verifierIds);

        if (profileError) {
          console.error("Error loading verifier names:", profileError);
        } else {
          profiles?.forEach((profile) => {
            if (profile?.id) {
              verifierMap.set(profile.id, profile.full_name ?? "");
            }
          });
        }
      }

      return (
        data?.map((record) => ({
          ...record,
          verified_by_name: record.verified_by
            ? verifierMap.get(record.verified_by) ?? null
            : null,
        })) ?? []
      );
    },
  });

  const getConditionBadge = (condition: string) => {
    const classes = conditionColors[condition] ?? "bg-slate-100 text-slate-800";
    return (
      <Badge variant="outline" className={classes}>
        {condition}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Verification History</h2>
          <p className="text-muted-foreground">
            Track asset verification records and responsible verifiers
          </p>
        </div>
        <Button disabled title="Verification creation will be available soon">
          Record Verification
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={`verification-skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                </TableRow>
              ))
            ) : verifications && verifications.length > 0 ? (
              verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    {verification.verification_date
                      ? new Date(verification.verification_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium">
                      {verification.asset?.asset_tag_number ?? "Unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {verification.asset?.asset_description ?? "No description"}
                    </div>
                  </TableCell>
                  <TableCell>{getConditionBadge(verification.condition)}</TableCell>
                  <TableCell>
                    {verification.physical_location_at_verification ?? "—"}
                  </TableCell>
                  <TableCell>{verification.verified_by_name ?? "—"}</TableCell>
                  <TableCell className="max-w-md">
                    {verification.remarks ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No verification records available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

