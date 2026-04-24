"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon, PanelRightIcon, XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  side: "left" | "right";
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  side = "left",
  className,
  style,
  children,
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  side?: "left" | "right";
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, setOpenState] = React.useState(defaultOpen);

  const setOpen = React.useCallback((nextOpen: boolean) => {
    setOpenState(nextOpen);

    if (typeof document !== "undefined") {
      document.cookie = `sidebar_state=${nextOpen}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
      return;
    }

    setOpen(!open);
  }, [isMobile, open]);

  const value = React.useMemo<SidebarContextProps>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      side,
      toggleSidebar,
    }),
    [isMobile, open, openMobile, setOpen, side, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        data-state={value.state}
        dir={side === "right" ? "rtl" : "ltr"}
        className={cn("group/sidebar-wrapper flex min-h-screen w-full bg-background", className)}
        style={
          {
            "--sidebar-width": "17rem",
            "--sidebar-width-icon": "4.5rem",
            "--header-height": "4.25rem",
            ...style,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
}: React.ComponentProps<"aside">) {
  const { isMobile, openMobile, setOpenMobile, state, side } = useSidebar();
  const desktopWidth = state === "collapsed" ? "4.5rem" : "17rem";
  const sidebarEdgeClass = side === "right" ? "right-0 border-l" : "left-0 border-r";
  const mobileTranslateClass = side === "right"
    ? (openMobile ? "translate-x-0" : "translate-x-full")
    : (openMobile ? "translate-x-0" : "-translate-x-full");

  if (isMobile) {
    return (
      <>
        {openMobile ? (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-primary/25 backdrop-blur-[2px]"
            onClick={() => setOpenMobile(false)}
            type="button"
          />
        ) : null}
        <aside
          data-slot="sidebar"
          className={cn(
            "fixed inset-y-0 z-50 flex w-[17rem] max-w-[85vw] flex-col border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-200",
            side === "right" ? "right-0 border-l" : "left-0 border-r",
            mobileTranslateClass,
            className,
          )}
        >
          <div className="flex items-center justify-end p-3">
            <Button aria-label="Close sidebar" onClick={() => setOpenMobile(false)} size="icon-sm" variant="ghost">
              <XIcon />
            </Button>
          </div>
          {children}
        </aside>
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
        )}
        style={{ width: desktopWidth }}
      />
      <aside
        data-slot="sidebar"
        className={cn(
          "fixed inset-y-0 z-30 hidden border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col",
          sidebarEdgeClass,
          className,
        )}
        style={{ width: desktopWidth }}
      >
        {children}
      </aside>
    </>
  );
}

export function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-screen flex-1 flex-col bg-background w-full",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-3 p-3", className)} {...props} />;
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-3 pt-1", className)} {...props} />;
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("border-t border-sidebar-border p-3", className)} {...props} />;
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useSidebar();

  return (
    <div
      className={cn(
        "px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/55 transition-opacity",
        state === "collapsed" && "lg:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />;
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-start text-sm transition-colors outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
  {
    variants: {
      size: {
        default: "min-h-12",
        lg: "min-h-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  size,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean;
    isActive?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();

  return (
    <Comp
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ size }),
        state === "collapsed" && "lg:justify-center lg:px-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, side } = useSidebar();

  return (
    <Button
      className={cn("size-9", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      size="icon"
      variant="ghost"
      {...props}
    >
      {side === "right" ? <PanelRightIcon /> : <PanelLeftIcon />}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
