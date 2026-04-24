export interface PortalActionState {
  error: string | null;
  success: boolean;
}

export const initialPortalActionState: PortalActionState = {
  error: null,
  success: false,
};
