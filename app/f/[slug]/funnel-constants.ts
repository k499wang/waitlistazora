// Shared sessionStorage key marking an *intentional* exit (checkout / auth
// redirect) so the runner's pagehide handler doesn't count it as abandonment.
// Written by the offer step and the account step; read by the runner.
export const INTENTIONAL_DEPARTURE_KEY = "azora_funnel_intentional_departure";
