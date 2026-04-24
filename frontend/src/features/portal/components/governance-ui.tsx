import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GovernancePageHeader({
  eyebrow,
  title,
  description,
  actions,
  primaryAction,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  primaryAction?: React.ReactNode;
  breadcrumb?: string[];
}) {
  return (
    <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(20,38,53,0.96),rgba(36,74,98,0.86))] text-white shadow-[0_30px_80px_rgba(20,38,53,0.20)]">
      <CardContent className="p-6 md:p-8">
        {breadcrumb?.length ? (
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span className="text-white/35">/</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/65">
              {eyebrow}
            </p>
            <h1 className="mt-3 break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl break-words text-sm leading-7 text-white/78 md:text-base">
              {description}
            </p>
          </div>

          {(actions || primaryAction) ? (
            <div className="flex flex-wrap gap-3">
              {primaryAction}
              {actions}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceMetricGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function GovernanceMetricCard({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon?: React.ReactNode;
  trend?: { value: string; label: string; positive?: boolean };
}) {
  return (
    <Card className="border border-border/30 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">{label}</p>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend ? (
            <p className="text-xs text-muted-foreground">
              <span className={cn("font-medium", trend.positive ? "text-emerald-500" : "text-rose-500")}>
                {trend.value}
              </span>{" "}
              {trend.label}
            </p>
          ) : hint ? (
            <p className="text-xs leading-6 text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-0 bg-white/96", className)}>
      <CardContent className="p-6 md:p-7">
          <div className="flex min-w-0 flex-col gap-4 border-b border-border/30 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight text-primary">{title}</h2>
            {description ? (
              <p className="mt-2 break-words text-sm leading-7 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="pt-6">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

export function GovernanceEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-muted/30 px-6 py-12 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function GovernanceListCard({
  title,
  subtitle,
  badges,
  children,
}: {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-muted/18 p-5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
        <h3 className="break-words text-xl font-semibold tracking-tight text-primary">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function GovernanceKicker({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/80">
      {children}
    </p>
  );
}

export function GovernanceMetaGrid({
  items,
  columns = 3,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 text-sm",
        columns === 1 && "grid-cols-1",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 xl:grid-cols-3",
        columns === 4 && "md:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="break-words text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
            {item.label}
          </p>
          <div className="break-words text-sm leading-7 text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function GovernanceTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  columns: string[];
  rows: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const rowArray = Array.isArray(rows) ? rows : [rows];

  if (rowArray.length === 0 && emptyTitle && emptyDescription) {
    return <GovernanceEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-muted/18">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-secondary/80"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {rowArray}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GovernanceRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-white/70", className)}>
      {children}
    </tr>
  );
}

export function GovernanceCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-b border-border/25 px-5 py-4 align-top text-sm", className)}>
      {children}
    </td>
  );
}

export function GovernancePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge className={cn("bg-white text-primary shadow-sm", className)}>{children}</Badge>
  );
}
