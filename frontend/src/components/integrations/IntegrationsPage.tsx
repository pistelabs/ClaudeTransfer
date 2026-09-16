import { CreditCardIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingCard } from "@/components/common/SettingCard";
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
  useStoreSettings,
  useUpdateStoreSettings,
} from "@/lib/api/queries";
import type { Integration } from "@/lib/types";

export function IntegrationsPage() {
  const { data: integrations = [], isLoading } = useIntegrations();
  const { data: settings } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();

  const noPaymentSoftware = settings?.noPaymentSoftware ?? false;
  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle={
          noPaymentSoftware
            ? "No payment software connected"
            : `Connect the tools you already run the shop with — ${connectedCount} of ${integrations.length} connected`
        }
      />

      <div className="mb-3">
        <SettingCard
          icon={<CreditCardIcon className="size-5" />}
          tileClassName="bg-muted text-muted-foreground"
          title="No payment software connected"
          description="Run the shop without a POS or payment provider linked."
          checked={noPaymentSoftware}
          switchLabel="No payment software connected"
          onCheckedChange={(checked) =>
            updateSettings.mutate({ noPaymentSoftware: checked })
          }
        />
      </div>

      {isLoading ? (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[184px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3 transition-opacity",
            noPaymentSoftware && "pointer-events-none opacity-45",
          )}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
          aria-hidden={noPaymentSoftware}
        >
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              pending={connect.isPending || disconnect.isPending}
              onConnect={() =>
                connect.mutate(integration.id, {
                  onSuccess: () =>
                    toast.success(`${integration.name} connected`),
                })
              }
              onDisconnect={() =>
                disconnect.mutate(integration.id, {
                  onSuccess: () =>
                    toast.success(`${integration.name} disconnected`),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  pending,
  onConnect,
  onDisconnect,
}: {
  integration: Integration;
  pending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Card className="gap-0 rounded-xl p-[18px] shadow-card">
      <div className="flex items-center gap-3">
        {/* Placeholder lettermark — swap in the real brand SVG. */}
        <div
          className="font-heading flex size-10 shrink-0 items-center justify-center rounded-lg text-[17px] font-bold text-white"
          style={{ backgroundColor: integration.color }}
          aria-hidden
        >
          {integration.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading truncate text-[15px] font-semibold">
            {integration.name}
          </div>
          <div className="text-muted-foreground truncate text-[12px]">
            {integration.category}
          </div>
        </div>
        <Badge
          className={cn(
            "border",
            integration.connected
              ? "bg-teal-50 text-teal-700 border-teal-100"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          {integration.connected ? "Connected" : "Not connected"}
        </Badge>
      </div>

      <p className="text-muted-foreground mt-3 text-[12.5px]">
        {integration.description}
      </p>

      <div className="border-divider mt-3.5 flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-tertiary-foreground truncate text-[12px]">
          {integration.account || "No account linked"}
        </span>
        {integration.connected ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        ) : (
          <Button size="sm" disabled={pending} onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}
