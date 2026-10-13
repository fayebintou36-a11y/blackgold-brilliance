CREATE TABLE public.ai_gateway_safety_state (id text PRIMARY KEY, message text NOT NULL, status integer NOT NULL, blocked_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_gateway_safety_state TO service_role;
ALTER TABLE public.ai_gateway_safety_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_gateway_safety_state IS 'Server-only AI access circuit breaker; contains no visitor input. Clear through an owner action after upstream access is restored.';