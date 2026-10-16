export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Process is alive */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/readyz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** PostgreSQL is available */
        get: operations["ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List registered agents (maximum 1000) */
        get: operations["listAgents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List device cards */
        get: operations["listDevices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get one device card */
        get: operations["getDevice"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Full last inventory in protobuf JSON */
        get: operations["getInventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/telemetry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Latest telemetry by observed_at */
        get: operations["getTelemetry"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Alias of /telemetry */
        get: operations["getMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/metrics/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Telemetry newest first; empty array when no samples */
        get: operations["getHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/monitoring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get expected collection schedule and manual Agent YAML fragments */
        get: operations["getMonitoring"];
        /** Save expected collection schedule (manual Agent configuration required) */
        put: operations["setMonitoring"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/topology": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Network discovery observation graph
         * @description Default legacy directed graph remains unchanged. view=global selects GlobalTopologyGraph with parameters from /api/topology/global; legacy agent_id/device_id may not be combined with global view.
         */
        get: {
            parameters: {
                query?: {
                    agent_id?: string;
                    include_expired?: boolean;
                    limit?: number;
                    offset?: number;
                    device_id?: string;
                    view?: "global";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Directed neighbor observations with identity confidence and collector expiry */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TopologyGraph"] | components["schemas"]["GlobalTopologyGraph"];
                    };
                };
                /** @description Error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Invalid credentials, missing/revoked/expired session */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Insufficient role, invalid Origin or missing/bad CSRF */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/topology": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Outgoing neighbor observations of a device */
        get: {
            parameters: {
                query?: {
                    agent_id?: string;
                    include_expired?: boolean;
                    limit?: number;
                    offset?: number;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Directed neighbor observations with identity confidence and collector expiry */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TopologyGraph"];
                    };
                };
                /** @description Error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Invalid credentials, missing/revoked/expired session */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Insufficient role, invalid Origin or missing/bad CSRF */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
                /** @description Error */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Error"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/availability/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Count effective device availability */
        get: operations["getAvailabilitySummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get effective availability with observation provenance */
        get: operations["getDeviceAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/availability/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get compressed reported-state history */
        get: operations["getDeviceAvailabilityHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read projected logs, newest inserted IDs first */
        get: operations["getLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/logs/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Counts for all records matching the filters; pagination is ignored */
        get: operations["getLogSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Linux audit rows; all matching record types are retained */
        get: operations["getAuditRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/audit/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Correlate selected audit rows by collector, device, source, file, host and event ID; completeness remains unknown */
        get: operations["getAuditEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/logs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read one projected log and its optional audit */
        get: operations["getLog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/audit/events/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read selected rows of one audit group; this is not a command execution audit trail */
        get: operations["getAuditEventRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read records of one device; ambiguous IDs require agent_id */
        get: operations["getDeviceLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read records of one device; ambiguous IDs require agent_id */
        get: operations["getDeviceAudit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/targets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current SIP target cards; ordered by agent_id/target_id, no automatic device binding */
        get: operations["getSIPTargets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/targets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Qualified latest sample and last clock issue, with shared health evaluation */
        get: operations["getSIPTarget"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current counts, with the same evaluator as target cards; diagnostic counts overlap the five states */
        get: operations["getSIPSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/targets/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read reported probe history, including late reports and clock errors; not a call/RTP quality history */
        get: operations["getSIPHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/targets/{id}/monitoring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Expected probe interval; no remote Agent change */
        get: operations["getSIPMonitoring"];
        /** Store expected probe cadence 3 seconds..24 hours; application in Agent remains unverified */
        put: operations["setSIPMonitoring"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create/rotate an HttpOnly cookie session; response does not expose the session token */
        post: operations["loginCookie"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create an opaque Bearer session for a script/API client */
        post: operations["loginBearer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current user, permissions and session-bound CSRF token */
        get: operations["getCurrentUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke the current session or all current user sessions */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke the current session or all current user sessions */
        post: operations["logoutall"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change password with current password verification; revokes all own sessions */
        post: operations["changeOwnPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/access/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List local users; password hashes are never returned */
        get: operations["getAccessUsers"];
        put?: never;
        /** Create a local viewer/operator/admin */
        post: operations["createAccessUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/access/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Change role/disabled; revokes target sessions, preserves at least one active admin */
        patch: operations["updateAccessUser"];
        trace?: never;
    };
    "/api/access/users/{id}/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Admin password reset, revokes all target sessions */
        post: operations["resetAccessUserPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/access/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Local access and monitoring changes audit; not a tamper-proof compliance log */
        get: operations["getAccessAudit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Command records newest first, with current state and projected result */
        get: operations["getCommands"];
        put?: never;
        /** Persist a confirmed human interface request; 202 means queued, not executed */
        post: operations["createCommand"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current command state; uncertain outcomes block further commands for this Agent */
        get: operations["getCommand"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands/{id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Durable state transitions, oldest first, at most 1000 */
        get: operations["getCommandEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands/policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Configured backend safety switches and additive protected resources */
        get: operations["getCommandPolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands/{id}/rollback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create typed rollback linked to the original command and observed Agent snapshot */
        post: operations["createRollback"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/commands/{id}/snapshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Observed snapshot reference with explicit unknown expiry and current backend lifecycle */
        get: operations["getCommandSnapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Observed references, not a download of Agent snapshot contents */
        get: operations["getSnapshots"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pki/bootstrap-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Administrator only. Requires PKI_ENABLED. Metadata excludes private keys, bootstrap secrets and token hashes. */
        get: operations["listPKIBootstrapTokens"];
        put?: never;
        /** @description Administrator only, CSRF required for cookie authentication. Returns secret once. Non-idempotent: lost response requires a new token; revoke unused tokens. */
        post: operations["createPKIBootstrapToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pki/certificates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Administrator only. Requires PKI_ENABLED. Metadata excludes private keys, bootstrap secrets and token hashes. */
        get: operations["listPKICertificates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pki/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Administrator only. Requires PKI_ENABLED. Metadata excludes private keys, bootstrap secrets and token hashes. */
        get: operations["listPKIAudit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pki/bootstrap-tokens/{id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Administrator only. Confirm explicitly. Certificate revocation closes the Agent stream; reconnect requires a different active certificate. */
        post: operations["revokePKIbootstraptokens"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pki/certificates/{id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Administrator only. Confirm explicitly. Certificate revocation closes the Agent stream; reconnect requires a different active certificate. */
        post: operations["revokePKIcertificates"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapihealthrules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapidevicesidhealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapiincidents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapiincidentsid"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapiincidentsidevidence"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated viewer/operator/admin read. Health rule assessment preserves unknown/stale; incident signal is last saved evidence, freshness is separate. */
        get: operations["getapiincidentsidtransitions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/acknowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Operator/admin only; cookie requests require CSRF. Idempotent acknowledgment does not resolve the incident or send any Agent command. */
        post: operations["acknowledgeIncident"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/interfaces/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated resource health. Missing values preserve unknown, stale/context history is explicit. SIP health is OPTIONS, not RTP/call quality. */
        get: operations["getapidevicesidinterfaceshealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/devices/{id}/interfaces/{interface_id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated resource health. Missing values preserve unknown, stale/context history is explicit. SIP health is OPTIONS, not RTP/call quality. */
        get: operations["getapidevicesidinterfacesinterfaceidhealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telephony/targets/{id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated resource health. Missing values preserve unknown, stale/context history is explicit. SIP health is OPTIONS, not RTP/call quality. */
        get: operations["getapitelephonytargetsidhealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated collector connection health. Does not imply downstream devices offline. Observation may be absent during startup grace. */
        get: operations["getAgentHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated detection report. Default last24h; explicit pair from/to 1s..31d, end not future. [from,to), clipped detection durations, no uptime inference. */
        get: operations["getReportSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated metadata list, without full report payload. */
        get: operations["listReportSnapshots"];
        put?: never;
        /** @description Operator/admin only; cookie requests require CSRF. Actor-scoped idempotency preserves the original immutable snapshot. */
        post: operations["createReportSnapshot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/snapshots/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getReportSnapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated bounded contextual relations. Current high-confidence discovery is not a proven causal or SIP service path. Performs no external AI request or device command. */
        get: operations["getIncidentDiagnosticContext"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/analysis/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Authenticated viewer/operator/admin. Cookie CSRF required. Body {}. Creates local preview only; no external request. */
        post: operations["createAIAnalysisPreview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/analysis": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Operator/admin only. Explicit confirmation/hash and actor-owned enabled preview. Queues asynchronous send; never dispatches device commands. */
        post: operations["createAIAnalysisJob"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/analyses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listAIAnalyses"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/analyses/{analysis_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAIAnalysis"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read source instances; viewer, operator or admin */
        get: operations["listDataSources"];
        put?: never;
        /** Register source instance; administrator only */
        post: operations["createDataSource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read source instance */
        get: operations["getDataSource"];
        /** Replace source settings with revision check; administrator only */
        put: operations["updateDataSource"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Collector stream status or external adapter unavailable */
        get: operations["getDataSourceStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Queue implemented connection test; administrator only. Collector verifies the existing stream. */
        post: operations["testDataSource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Queue implemented read-only sync; administrator only. Collector has no polling sync. */
        post: operations["syncDataSource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read source operation history */
        get: operations["listDataSourceJobs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read one job; source ID must match */
        get: operations["getDataSourceJob"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/jobs/{job_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read attempts and transitions */
        get: operations["getDataSourceJobEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Global inventory registry; B3.1 keeps source-owned objects separate */
        get: operations["listAssets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read asset; observed is not online */
        get: operations["getAsset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read original source instances and IDs */
        get: operations["getAssetSources"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read current per-binding raw normalized inventory */
        get: operations["getAssetInventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/facts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read accepted inventory fact change history */
        get: operations["getAssetFacts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/identities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read identity evidence, subjects, confidence and version history */
        get: operations["getAssetIdentities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Merge compatible current assets; administrator confirmation and revisions required */
        post: operations["mergeAssets"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/split": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Move a nonempty proper subset of bindings into a new asset; administrator only */
        post: operations["splitAsset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read matching evidence and contradictions; suggestions do not change inventory */
        get: operations["getAssetCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read manual merge/split history */
        get: operations["getAssetDecisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/resolution-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read automatic matching decisions with preserved fact IDs and observed times */
        get: operations["getAssetResolutionEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/external-metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Latest selected external metrics for this Asset */
        get: operations["getAssetsIdExternal-Metrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** External signals dynamically linked through source bindings */
        get: operations["getAssetsIdSignals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Latest selected external metrics for this source */
        get: operations["getData-SourcesIdMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/metrics/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Collected metric snapshots, not complete Zabbix history */
        get: operations["getData-SourcesIdMetricsHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Normalized external source signals */
        get: operations["getSignals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/signals/{event_id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Signal business-state versions for one source event */
        get: operations["getData-SourcesIdSignalsEventIdHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/prometheus/instant": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Prometheus instant for a verified current source binding */
        get: operations["getAssetPrometheusInstant"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/prometheus/range": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Prometheus range for a verified current source binding */
        get: operations["getAssetPrometheusRange"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/prometheus/metadata": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Prometheus metadata for a verified current source binding */
        get: operations["getAssetPrometheusMetadata"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/resolved-inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read unified inventory with per-attribute provenance */
        get: operations["getResolvedInventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/placement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read reviewed physical placement */
        get: operations["getAssetPlacement"];
        /**
         * Review asset placement and reserve rack units
         * @description Admin permission access.manage required. Live role checked inside database transaction; bearer authentication or cookie+CSRF. No write to Collector. Stable Idempotency-Key required.
         */
        put: operations["putAssetPlacement"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/placement/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read placement audit history */
        get: operations["getAssetPlacementHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/placements/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Atomically import up to 50 reviewed placements
         * @description Admin permission access.manage required. Live role checked inside database transaction; bearer authentication or cookie+CSRF. No write to Collector. Stable Idempotency-Key required.
         */
        post: operations["importAssetPlacements"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/locations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List physical location catalog */
        get: operations["listPhysicalLocations"];
        put?: never;
        /**
         * Create reviewed location catalog entry
         * @description Admin permission access.manage required. Live role checked inside database transaction; bearer authentication or cookie+CSRF. No write to Collector. Stable Idempotency-Key required.
         */
        post: operations["createPhysicalLocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/locations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read physical location */
        get: operations["getPhysicalLocation"];
        /**
         * Rename location or resize rack within occupied bounds
         * @description Admin permission access.manage required. Live role checked inside database transaction; bearer authentication or cookie+CSRF. No write to Collector. Stable Idempotency-Key required.
         */
        put: operations["updatePhysicalLocation"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/locations/{id}/rack-layout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read rack occupancy and free units */
        get: operations["getRackLayout"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/topology/global": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read global Asset topology with directed evidence */
        get: operations["getGlobalTopology"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/neighbors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read current Asset neighbors and management relations */
        get: operations["getAssetNeighbors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/topology/changes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read discovery lifecycle history with keyset cursor */
        get: operations["getGlobalTopologyChanges"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/hardware": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetHardware */
        get: operations["getAssetHardware"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/hardware/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetHardwareHistory */
        get: operations["getAssetHardwareHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetLogs */
        get: operations["getAssetLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/logs/{log_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetLogRecord */
        get: operations["getAssetLogRecord"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/logs/{log_id}/raw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetLogRaw */
        get: operations["getAssetLogRaw"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/logs/{id}/raw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getControlledLogRaw */
        get: operations["getControlledLogRaw"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/audit/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetAuditEvents */
        get: operations["getAssetAuditEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/voip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetVoIP */
        get: operations["getAssetVoIP"];
        put?: never;
        /** createAssetVoIPAssociation */
        post: operations["createAssetVoIPAssociation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/voip/{association_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** updateAssetVoIPAssociation */
        put: operations["updateAssetVoIPAssociation"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/voip/{association_id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetVoIPHistory */
        get: operations["getAssetVoIPHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/voip/{association_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAssetVoIPMappingEvents */
        get: operations["getAssetVoIPMappingEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/collectors/{id}/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCollectorConfig */
        get: operations["getCollectorConfig"];
        /** updateCollectorConfig */
        put: operations["updateCollectorConfig"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/collectors/{id}/config/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCollectorConfigHistory */
        get: operations["getCollectorConfigHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/collectors/{id}/config/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCollectorConfigEvents */
        get: operations["getCollectorConfigEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** automationTemplates */
        get: operations["automationTemplates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/workers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** automationWorkers */
        get: operations["automationWorkers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/automation-target": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAutomationTarget */
        get: operations["getAutomationTarget"];
        /** putAutomationTarget */
        put: operations["putAutomationTarget"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/automation/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** assetAutomationJobs */
        get: operations["assetAutomationJobs"];
        put?: never;
        /** createAutomationJob */
        post: operations["createAutomationJob"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAutomationJob */
        get: operations["getAutomationJob"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/jobs/{job_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** automationJobEvents */
        get: operations["automationJobEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/jobs/{job_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** cancelAutomationJob */
        post: operations["cancelAutomationJob"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/automation/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** assetAutomationSnapshots */
        get: operations["assetAutomationSnapshots"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/automation/snapshots/{snapshot_id}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** automationSnapshotContent */
        get: operations["automationSnapshotContent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/baseline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** configurationBaseline */
        get: operations["configurationBaseline"];
        /** approveConfigurationBaseline */
        put: operations["approveConfigurationBaseline"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/baseline/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** configurationBaselineHistory */
        get: operations["configurationBaselineHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/drift": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** configurationDrift */
        get: operations["configurationDrift"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/drift/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** configurationDriftHistory */
        get: operations["configurationDriftHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/compare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** compareConfiguration */
        post: operations["compareConfiguration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/remediation-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["configurationRemediationPolicy"];
        put: operations["putConfigurationRemediationPolicy"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/configuration/remediations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["configurationRemediations"];
        put?: never;
        post: operations["requestConfigurationRemediation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuration/remediations/{remediation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["configurationRemediation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuration/remediations/{remediation_id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["approveConfigurationRemediation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuration/remediations/{remediation_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelConfigurationRemediation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correlationSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/incidents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correlatedIncidents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/incidents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correlatedIncident"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/rebuild": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["queueCorrelationRebuild"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correlationServices"];
        put?: never;
        post: operations["createCorrelationService"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/services/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["correlationService"];
        put: operations["updateCorrelationService"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/alertmanager": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAlertmanagerReceiver"];
        put: operations["rotateAlertmanagerReceiver"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/data-sources/{id}/alertmanager/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["receiveAlertmanagerResolved"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/review-log-event": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Operator/admin, confirmed=true, count CAS and no queued events in the same window. Cookie writes require CSRF. Closes only reported log incident; never declares hardware recovery or executes commands. Idempotent review replay. */
        post: operations["reviewLogEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/log-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated bounded source-record IDs. No raw log data. */
        get: operations["getLogIncidentRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/review-topology-event": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Review a reported neighboring endpoint change, with confirmation, current count and reason. Does not assert link recovery or execute commands. */
        post: operations["reviewTopologyEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/incidents/{id}/topology-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Authenticated bounded source-record IDs. No raw log data. */
        get: operations["getTopologyIncidentRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/incidents/{id}/analysis/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Authenticated viewer/operator/admin. Cookie CSRF required. Body {}. Creates local preview only; no external request. */
        post: operations["createCorrelatedAnalysisPreview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/incidents/{id}/analysis": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Operator/admin only. Explicit confirmation/hash and actor-owned enabled preview. Queues asynchronous send; never dispatches device commands. */
        post: operations["createCorrelatedAnalysis"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/correlation/incidents/{id}/analyses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listCorrelatedAnalyses"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/v2/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getUnifiedReportSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/v2/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listUnifiedReportSnapshots"];
        put?: never;
        post: operations["createUnifiedReportSnapshot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/v2/snapshots/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getUnifiedReportSnapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listReportSchedules"];
        put?: never;
        post: operations["createReportSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/schedules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateReportSchedule"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Error: {
            error: {
                code: string;
                message: string;
            };
        };
        Agent: {
            agent_id: string;
            session_id: string;
            name: string;
            version: string;
            protocol_version: number;
            connected: boolean;
            /** Format: date-time */
            last_seen: string;
            /** @description Last accepted protobuf Heartbeat, including optional managed_config reported by Collector. Receipt does not imply Backend B9 support; managed_config_v1 is not negotiated in B4.1. */
            heartbeat: {
                [key: string]: unknown;
            } | null;
        };
        Device: {
            agent_id: string;
            device_id: string;
            name: string;
            hostname: string;
            vendor: string;
            model: string;
            /** @description Protobuf DeviceType enum, e.g. DEVICE_TYPE_SWITCH */
            type: string;
            management_address: string;
            source: string;
            /** @description Compatibility boolean: true only when availability.status is online. Use availability.status to distinguish offline, stale and unknown. */
            online: boolean;
            /** @description Stream active and last receipt newer than AGENT_TIMEOUT */
            agent_connected: boolean;
            /** Format: date-time */
            last_seen: string;
            /** Format: date-time */
            received_at: string;
            /** @description Canonical Collector 215d33a protobuf JSON, snake_case, enum names; uint64 decimal strings. Includes scoped identities and additive metadata. Missing/default fields omitted; full schema api/proto/infrapulse/v1/agent.proto. */
            inventory: {
                /** @description Phase6 extended types and diagnostics, preserved separately from legacy identity_evidence. */
                extended_identity_evidence?: components["schemas"]["CollectorIdentityEvidence"][];
                identity_evidence?: components["schemas"]["CollectorIdentityEvidence"][];
            } & {
                [key: string]: unknown;
            };
            monitoring: components["schemas"]["MonitoringSettings"];
            telemetry_freshness: components["schemas"]["Freshness"];
            /** @description Last accepted explicit report, identical to availability.last_reported_online; null when no valid report exists. */
            reported_online: boolean | null;
            availability: components["schemas"]["AvailabilityState"];
        };
        Telemetry: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            device_id: string;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            collected_at: string;
            /** Format: date-time */
            received_at: string;
            source: string;
            cpu_usage_percent: number | null;
            /** @description Unsigned 64-bit integer encoded as decimal string */
            memory_total_bytes: string | null;
            memory_used_bytes: string | null;
            /** @description Protobuf JSON: snake_case, enum names; int64/uint64 values are strings; omitted fields mean absent/default. Full schema: api/proto/infrapulse/v1/agent.proto. */
            sample: {
                observation?: components["schemas"]["CollectorObservation"];
                identity_evidence?: components["schemas"]["CollectorIdentityEvidence"][];
                metrics?: {
                    name?: string;
                    resource_id?: string;
                    value?: number;
                    component_id?: string;
                    unit?: string;
                    status?: components["schemas"]["CollectorHardwareStatus"];
                    observation?: components["schemas"]["CollectorObservation"];
                }[];
                hardware_health?: {
                    resource_id?: string;
                    observation?: components["schemas"]["CollectorObservation"];
                    id?: string;
                    name?: string;
                    status?: components["schemas"]["CollectorHardwareStatus"];
                }[];
                /** @description Phase6 extended types and diagnostics, preserved separately from legacy identity_evidence. */
                extended_identity_evidence?: components["schemas"]["CollectorIdentityEvidence"][];
            } & {
                [key: string]: unknown;
            };
        };
        DevicePage: {
            items: components["schemas"]["Device"][];
            limit: number;
            offset: number;
        };
        AgentList: {
            items: components["schemas"]["Agent"][];
        };
        TelemetryPage: {
            items: components["schemas"]["Telemetry"][];
            limit: number;
        };
        Status: {
            status: string;
        };
        MonitoringPolicy: {
            telemetry_interval_seconds: number;
            topology_interval_seconds: number;
            inventory_interval_seconds: number;
        };
        MonitoringSettings: {
            /** @enum {string} */
            origin: "backend_default" | "device_override" | "collector_applied";
            recommended_topology_ttl_seconds: number;
            /** @enum {string} */
            delivery_mode: "manual_agent_yaml" | "managed_collector_stream";
            remote_polling_yaml: string;
            local_telemetry_yaml: string;
            telemetry_interval_seconds: number;
            inventory_interval_seconds: number;
            /** @enum {string} */
            application_status: "unverified" | "applied";
            topology_interval_seconds: number;
        };
        Freshness: {
            /** Format: date-time */
            observed_at: string | null;
            expected_interval_seconds: number;
            /** @enum {string} */
            status: "fresh" | "stale" | "no_data" | "clock_skew";
            /** Format: date-time */
            expected_next_at: string | null;
            stale_after_seconds: number;
            /** Format: int64 */
            age_seconds: number | null;
            /** Format: date-time */
            received_at: string | null;
        };
        LatestTelemetry: components["schemas"]["Telemetry"] & {
            freshness: components["schemas"]["Freshness"];
            monitoring: components["schemas"]["MonitoringSettings"];
        };
        TopologyNode: {
            source: string;
            label: string;
            hostname?: string;
            type?: string;
            /** @description Last accepted reported state; omitted when no valid report is known. Consult availability.status for effective availability of known inventory nodes. */
            reported_online?: boolean;
            known: boolean;
            /** Format: byte */
            remote_chassis_id?: string;
            agent_connected?: boolean;
            /** Format: date-time */
            last_seen?: string;
            agent_id: string;
            device_id?: string;
            remote_chassis_subtype?: number;
            management_address?: string;
            vendor?: string;
            id: string;
            model?: string;
            availability?: components["schemas"]["AvailabilityState"];
        };
        TopologyPort: {
            interface_id?: string;
            name?: string;
            /** Format: byte */
            raw_id: string;
            subtype: number;
            number?: number;
        };
        TopologyResolution: {
            method: string;
            candidate_node_ids: string[];
            /** @enum {string} */
            confidence: "high" | "medium" | "unresolved";
            /** @enum {string} */
            status: "resolved" | "unresolved" | "ambiguous" | "conflicting";
        };
        TopologyEvidence: {
            source?: string;
            confidence?: string;
            value?: string;
        };
        TopologyEdge: {
            /** @enum {string} */
            status: "active" | "expired" | "clock_skew";
            remote_port: components["schemas"]["TopologyPort"];
            local_port: components["schemas"]["TopologyPort"];
            /** Format: date-time */
            received_at: string;
            from: string;
            resolution: components["schemas"]["TopologyResolution"];
            source: string;
            observation_confidence: string;
            evidence: components["schemas"]["TopologyEvidence"][];
            protocol: string;
            agent_id: string;
            device_id: string;
            /** Format: date-time */
            expires_at: string;
            id: string;
            to: string;
            /** Format: date-time */
            observed_at: string;
        };
        TopologyCollection: {
            message_id: string;
            /** Format: date-time */
            observed_at: string;
            device_id: string;
            /** Format: date-time */
            received_at: string;
            agent_id: string;
            expiry_assumption: string;
            source: string;
            /** @enum {string} */
            completeness: "SNAPSHOT_COMPLETENESS_UNSPECIFIED" | "SNAPSHOT_COMPLETENESS_COMPLETE" | "SNAPSHOT_COMPLETENESS_PARTIAL" | "SNAPSHOT_COMPLETENESS_FAILED";
            ttl_seconds: number;
            observation_count: number;
            /** Format: date-time */
            collected_at: string;
            clock_skew: boolean;
        };
        TopologyGraph: {
            inventory_truncated: boolean;
            /** Format: date-time */
            generated_at: string;
            collections: components["schemas"]["TopologyCollection"][];
            truncated: boolean;
            edges: components["schemas"]["TopologyEdge"][];
            nodes: components["schemas"]["TopologyNode"][];
        };
        /** @description Effective availability derived at read time. Expiry and agent disconnection produce stale, never a new reported offline transition. Provenance remains attached to the selected observation. A newer rejected future-clock report can set clock_skew while a valid earlier report remains selected. */
        AvailabilityState: {
            /** @enum {string} */
            status: "online" | "offline" | "stale" | "unknown";
            /** @enum {string} */
            reason: "no_observation" | "clock_skew" | "agent_disconnected" | "observation_expired" | "device_reported_online" | "device_reported_offline" | "agent_heartbeat";
            /** @description Last accepted explicit report, preserved when stale; null when there is no valid report. */
            last_reported_online: boolean | null;
            /** @description Agent connection is active and its last receipt is newer than AGENT_TIMEOUT. */
            agent_connected: boolean;
            /** @enum {string} */
            evidence_kind?: "hello" | "heartbeat" | "inventory" | "telemetry" | "event_online" | "event_offline" | "legacy";
            /** @description Original report source, for example remote, simulated or agent. Empty provenance fields are omitted. */
            source?: string;
            message_id?: string;
            event_id?: string;
            /** @enum {string} */
            time_basis?: "agent_observed" | "server_receipt";
            /**
             * Format: date-time
             * @description UTC business observation time. Local heartbeat uses server receipt time.
             */
            observed_at: string | null;
            /**
             * Format: date-time
             * @description UTC server receipt time; delayed receipt does not renew observation freshness.
             */
            received_at: string | null;
            /**
             * Format: date-time
             * @description Observation freshness deadline under the current policy; expired when now is equal to or later than this instant.
             */
            expires_at: string | null;
            /** Format: int64 */
            age_seconds: number | null;
            /** @description Cadence of the selected evidence. Zero for hello/heartbeat or when no valid observation exists. */
            expected_interval_seconds: number;
            /** @description Telemetry/inventory: twice the selected interval plus bounded jitter. Events/legacy use the slower telemetry/inventory cadence. Hello/heartbeat use ceil(AGENT_TIMEOUT seconds). */
            stale_after_seconds: number;
            /** @description An observation more than 30 seconds ahead of server time was rejected and has no later accepted correction, or the selected observation itself is in the future. */
            clock_skew: boolean;
        };
        /** @description Compressed history of accepted reported-state changes, newest IDs first. The first accepted report has from_online=null. Repeated reports, expiry and disconnection do not append transitions. */
        AvailabilityChange: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            device_id: string;
            /** @enum {string} */
            kind: "hello" | "heartbeat" | "inventory" | "telemetry" | "event_online" | "event_offline" | "legacy";
            source: string;
            /** @description Original envelope ID; an empty string is allowed for legacy migration seeds. */
            message_id: string;
            /** @description Original device event ID, or an empty string for non-event reports. */
            event_id: string;
            /** @enum {string} */
            time_basis: "agent_observed" | "server_receipt";
            from_online: boolean | null;
            to_online: boolean;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            received_at: string;
        };
        /** @description One evaluation time for all matching devices. total = online + offline + stale + unknown. clock_skew and agent_disconnected are overlapping diagnostic counts, not additional statuses. */
        AvailabilitySummary: {
            /** Format: date-time */
            generated_at: string;
            /** Format: int64 */
            total: number;
            /** Format: int64 */
            online: number;
            /** Format: int64 */
            offline: number;
            /** Format: int64 */
            stale: number;
            /** Format: int64 */
            unknown: number;
            /** Format: int64 */
            clock_skew: number;
            /** Format: int64 */
            agent_disconnected: number;
        };
        AvailabilityHistoryPage: {
            items: components["schemas"]["AvailabilityChange"][];
            limit: number;
            offset: number;
        };
        LogAudit: {
            event_key: string;
            event_id: string;
            record_type: string;
            /** Format: int64 */
            uid: number | null;
            /** Format: int64 */
            auid: number | null;
            /** Format: int64 */
            pid: number | null;
            executable: string;
            syscall: string;
            success: boolean | null;
            result: string;
            host: string;
        } | null;
        LogRecord: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            device_id: string;
            record_id: string;
            message_id: string;
            source: string;
            source_id: string;
            /** Format: date-time */
            event_at: string;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            original_timestamp: string | null;
            /** Format: date-time */
            received_at: string;
            /** @enum {string} */
            time_basis: "original_timestamp" | "observed_at";
            /** Format: int64 */
            severity: number | null;
            /** @enum {string} */
            severity_name: "emergency" | "alert" | "critical" | "error" | "warning" | "notice" | "info" | "debug" | "unknown";
            /** Format: int64 */
            facility: number | null;
            host: string;
            process: string;
            process_id: string;
            message: string;
            /** @description Empty in ordinary REST reads. Admin-only audited /raw routes expose retained sanitized text; archived binary/unsanitized payloads are never served. */
            raw: string;
            truncated: boolean;
            redacted: boolean;
            file_identity: string;
            /** Format: int64 */
            offset: number;
            audit: components["schemas"]["LogAudit"];
            syslog?: components["schemas"]["CollectorSyslogMetadata"];
            observation?: components["schemas"]["CollectorObservation"];
            raw_payload_omitted?: boolean;
        };
        LogPage: {
            items: components["schemas"]["LogRecord"][];
            /**
             * Format: int64
             * @description Pass this value as before_id while keeping the same filters. Null means no more rows in this response.
             */
            next_before_id: number | null;
            limit: number;
        };
        LogSummary: {
            /** Format: date-time */
            generated_at: string;
            /** Format: int64 */
            total: number;
            /** Format: int64 */
            audit_records: number;
            /** Format: int64 */
            audit_failures: number;
            /** Format: int64 */
            redacted: number;
            /** Format: int64 */
            truncated: number;
            severity: {
                [key: string]: number;
            };
        };
        AuditEvent: {
            /** Format: int64 */
            cursor_id: number;
            key: string;
            agent_id: string;
            device_id: string;
            source: string;
            source_id: string;
            file_identity: string;
            host: string;
            event_id: string;
            /** Format: date-time */
            first_event_at: string;
            /** Format: date-time */
            last_event_at: string;
            /** Format: date-time */
            first_received_at: string;
            /** Format: date-time */
            last_received_at: string;
            /** Format: int64 */
            record_count: number;
            record_types: string[];
            /** @enum {string} */
            outcome: "unknown" | "success" | "failure" | "mixed";
            /**
             * @description Transport does not prove that all audit lines were collected. Counts describe the selected records only.
             * @enum {string}
             */
            completeness: "unknown";
        };
        AuditEventPage: {
            items: components["schemas"]["AuditEvent"][];
            /** Format: int64 */
            next_before_id: number | null;
            limit: number;
        };
        SIPSample: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            target_id: string;
            message_id: string;
            address: string;
            /** @enum {string} */
            transport: "udp" | "tcp" | "tls";
            source: string;
            reachable: boolean;
            response_code: number | null;
            /** Format: double */
            latency_ms: number | null;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            received_at: string;
            /** Format: int64 */
            consecutive_failures: number;
            /** @enum {string} */
            state: "unknown" | "up" | "healthy" | "degraded" | "down";
            error_category: string;
            clock_skew: boolean;
        };
        SIPNullableSample: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            target_id: string;
            message_id: string;
            address: string;
            /** @enum {string} */
            transport: "udp" | "tcp" | "tls";
            source: string;
            reachable: boolean;
            response_code: number | null;
            /** Format: double */
            latency_ms: number | null;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            received_at: string;
            /** Format: int64 */
            consecutive_failures: number;
            /** @enum {string} */
            state: "unknown" | "up" | "healthy" | "degraded" | "down";
            error_category: string;
            clock_skew: boolean;
        } | null;
        SIPMonitoring: {
            expected_interval_seconds: number;
            stale_after_seconds: number;
            /** @enum {string} */
            origin: "backend_default" | "target_override" | "collector_applied";
            /** @enum {string} */
            delivery_mode: "manual_agent_yaml" | "managed_collector_stream";
            /** @enum {string} */
            application_status: "unverified" | "applied";
            agent_yaml_fragment: string;
        };
        SIPHealth: {
            /** @enum {string} */
            status: "up" | "degraded" | "down" | "stale" | "unknown";
            reason: string;
            agent_connected: boolean;
            reported_state: string | null;
            reported_reachable: boolean | null;
            clock_skew: boolean;
            freshness: components["schemas"]["Freshness"];
        };
        SIPTarget: {
            agent_id: string;
            target_id: string;
            address: string;
            transport: string;
            source: string;
            /** Format: date-time */
            first_received_at: string;
            /** Format: date-time */
            last_received_at: string;
            latest: components["schemas"]["SIPNullableSample"];
            clock_issue: components["schemas"]["SIPNullableSample"];
            health: components["schemas"]["SIPHealth"];
            monitoring: components["schemas"]["SIPMonitoring"];
        };
        SIPTargetPage: {
            items: components["schemas"]["SIPTarget"][];
            limit: number;
            offset: number;
        };
        SIPHistoryPage: {
            items: components["schemas"]["SIPSample"][];
            /** Format: int64 */
            next_before_id: number | null;
            limit: number;
        };
        SIPSummary: {
            /** Format: date-time */
            generated_at: string;
            /** Format: int64 */
            total: number;
            /** Format: int64 */
            up: number;
            /** Format: int64 */
            degraded: number;
            /** Format: int64 */
            down: number;
            /** Format: int64 */
            stale: number;
            /** Format: int64 */
            unknown: number;
            /** Format: int64 */
            clock_skew: number;
            /** Format: int64 */
            agent_disconnected: number;
        };
        SIPIntervalInput: {
            expected_interval_seconds: number;
        };
        AccessUser: {
            id: string;
            username: string;
            /** @enum {string} */
            role: "viewer" | "operator" | "admin";
            disabled: boolean;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: date-time */
            last_login_at: string | null;
        };
        AccessLoginInput: {
            username: string;
            /** @description Password is not normalized. Limit is 256 UTF-8 bytes. */
            password: string;
        };
        AccessLoginResponse: {
            user: components["schemas"]["AccessUser"];
            /** Format: date-time */
            expires_at: string;
            csrf_token: string;
        };
        AccessTokenResponse: {
            /** @description Sensitive: display/store only in the authorized client. Do not persist in frontend localStorage. */
            access_token: string;
            /** @enum {string} */
            token_type: "Bearer";
            /** Format: date-time */
            expires_at: string;
            user: components["schemas"]["AccessUser"];
        };
        AccessMe: {
            user: components["schemas"]["AccessUser"];
            permissions: ("data.read" | "monitoring.write" | "access.manage" | "commands.write")[];
            /** Format: date-time */
            expires_at: string;
            csrf_token: string;
        };
        AccessCreateUser: {
            username: string;
            /** @description At least 12 Unicode characters and at most 256 UTF-8 bytes. */
            password: string;
            /** @enum {string} */
            role: "viewer" | "operator" | "admin";
        };
        /** @description Any effective access change revokes all sessions of this user. Cannot remove the last active admin. */
        AccessPatchUser: {
            disabled?: boolean;
            /** @enum {string} */
            role?: "viewer" | "operator" | "admin";
        } | unknown | unknown;
        AccessPasswordInput: {
            /** @description At least 12 Unicode characters and at most 256 UTF-8 bytes. */
            password: string;
        };
        AccessOwnPasswordInput: {
            current_password: string;
            /** @description At least 12 Unicode characters and at most 256 UTF-8 bytes. */
            password: string;
        };
        AccessUserPage: {
            items: components["schemas"]["AccessUser"][];
            limit: number;
            offset: number;
        };
        AccessAuditEntry: {
            /** Format: int64 */
            id: number;
            actor_id: string | null;
            target_id: string | null;
            action: string;
            outcome: string;
            resource: string;
            request_id: string;
            peer: string;
            /** Format: date-time */
            at: string;
        };
        AccessAuditPage: {
            items: components["schemas"]["AccessAuditEntry"][];
            limit: number;
            offset: number;
        };
        CommandRequest: {
            agent_id: string;
            device_id: string;
            interface_id: string;
            /** @enum {string} */
            operation: "enable" | "disable";
            /** @description Required initial admin state from qualified telemetry. False is different from a missing field. */
            expected_admin_up: boolean;
            timeout_seconds: number;
            /**
             * @description Explicit human confirmation; initiator is assigned HUMAN by backend.
             * @enum {boolean}
             */
            confirmed: true;
        };
        CommandVerification: {
            interface_id: string;
            name: string;
            expected_admin_up: boolean;
            observed_admin_up: boolean | null;
            /** Format: date-time */
            observed_at: string | null;
            verified: boolean;
            changed: boolean;
            uncertain: boolean;
            evidence: string;
        } | null;
        CommandResult: {
            message_id: string;
            status: string;
            /** Format: date-time */
            started_at: string | null;
            /** Format: date-time */
            finished_at: string | null;
            changed: boolean;
            uncertain: boolean;
            error_code: string;
            error_message: string;
            /** @description Opaque Agent-owned identifier. Snapshot contents and TTL are not transmitted. */
            snapshot_id: string;
            verification: components["schemas"]["CommandVerification"];
        } | null;
        CommandRecord: {
            id: string;
            agent_id: string;
            device_id: string;
            interface_id: string;
            /** @enum {string} */
            operation: "enable" | "disable" | "rollback";
            expected_admin_up: boolean;
            timeout_seconds: number;
            idempotency_key: string;
            actor_id: string;
            /** @enum {string} */
            state: "queued" | "dispatching" | "sent" | "accepted" | "running" | "success" | "failed" | "rejected" | "unsupported" | "timeout" | "expired" | "uncertain";
            reason: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: date-time */
            deadline_at: string;
            session_id: string;
            /** Format: date-time */
            dispatched_at: string | null;
            result: components["schemas"]["CommandResult"];
            rollback_of_command_id: string | null;
            rollback_snapshot_id: string | null;
        };
        CommandPage: {
            items: components["schemas"]["CommandRecord"][];
            limit: number;
            offset: number;
        };
        CommandEvent: {
            /** Format: int64 */
            id: number;
            command_id: string;
            state: string;
            reason: string;
            /** Format: date-time */
            at: string;
        };
        CommandEventPage: {
            items: components["schemas"]["CommandEvent"][];
        };
        CommandPolicy: {
            enabled: boolean;
            allow_disable: boolean;
            protected_devices: string[];
            protected_interfaces: string[];
            allow_rollback: boolean;
        };
        RollbackRequest: {
            /** @description Required current state before rollback; actual restored snapshot baseline is Agent-owned. */
            expected_admin_up: boolean;
            timeout_seconds: number;
            /** @enum {boolean} */
            confirmed: true;
        };
        CommandSnapshot: {
            agent_id: string;
            snapshot_id: string;
            origin_command_id: string;
            device_id: string;
            interface_id: string;
            /** @enum {string} */
            status: "candidate" | "reserved" | "consumed" | "superseded" | "uncertain" | "unverified" | "unavailable";
            reason: string;
            initial_observed_admin_up: boolean;
            after_admin_up: boolean | null;
            /** @enum {string} */
            previous_state_basis: "backend_initial_observation_not_agent_snapshot";
            /** Format: date-time */
            recorded_at: string;
            /**
             * Format: date-time
             * @description Unknown: Agent wire does not expose expiry. Null is not infinite retention.
             */
            expires_at: string | null;
            /** @enum {string} */
            expiry_basis: "not_transmitted_by_agent";
            rollback_command_id: string | null;
        };
        SnapshotPage: {
            items: components["schemas"]["CommandSnapshot"][];
            limit: number;
            offset: number;
        };
        PKIBootstrapToken: {
            id: string;
            /** Format: uuid */
            agent_id: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            expires_at: string;
            /** Format: date-time */
            used_at: string | null;
            /** Format: date-time */
            revoked_at: string | null;
            /** @description Returned ONLY by successful create; never returned in lists. Store privately and supply via Agent token_env. */
            token?: string;
        };
        PKICertificate: {
            fingerprint: string;
            /** Format: uuid */
            agent_id: string;
            serial: string;
            /** Format: date-time */
            not_before: string;
            /** Format: date-time */
            not_after: string;
            /** Format: date-time */
            created_at: string;
            renewed_from: string | null;
            /** Format: date-time */
            revoked_at: string | null;
        };
        PKIAudit: {
            /** Format: int64 */
            id: number;
            /** Format: uuid */
            agent_id: string;
            actor_id: string | null;
            action: string;
            resource: string;
            /** Format: date-time */
            at: string;
        };
        PKITokenRequest: {
            /** Format: uuid */
            agent_id: string;
            /** @default 900 */
            ttl_seconds: number;
        };
        PKIRevokeRequest: {
            /** @enum {boolean} */
            confirmed: true;
        };
        HealthAssessment: {
            rule_id?: string;
            /** @enum {string} */
            status?: "ok" | "pending" | "warning" | "critical" | "unknown" | "stale";
            severity?: string;
            reason?: string;
            /** Format: date-time */
            observed_at?: string | null;
            value_percent?: number | null;
            recovery_eligible?: boolean;
            evidence?: {
                /** Format: int64 */
                telemetry_id?: number;
                /** Format: date-time */
                observed_at?: string;
                value_percent?: number;
            }[];
            window_seconds?: number;
            slope_percent_per_second?: number | null;
            /** @description Regression fit; not a probability. */
            r_squared?: number | null;
            /** @description Conditional estimate if the fitted trend continues. */
            seconds_to_critical?: number | null;
            /** @description Version of the implemented rule algorithm. */
            rule_version?: string;
            policy?: components["schemas"]["HealthPolicy"];
            metric?: string;
            /** @enum {string} */
            unit?: "percent" | "per_second" | "milliseconds" | "boolean" | "state_grade" | "changes_in_300_seconds";
            /** @description Numeric resource measurement in unit; do not interpret as percent unless unit=percent. */
            value?: number | null;
            resource_evidence?: components["schemas"]["ResourcePoint"][];
            resource_policy?: components["schemas"]["ResourcePolicy"];
            flap_window_seconds?: number;
            flap_recovery_seconds?: number;
            /** Format: date-time */
            last_state_change_at?: string;
            /** @description Backend-generated connection evidence, not downstream reachability. */
            collector?: {
                confirmation_seconds?: number;
                /** Format: date-time */
                last_seen_at?: string;
                /** Format: date-time */
                checked_at?: string;
                agent_timeout_seconds?: number;
                connected?: boolean;
                /** Format: date-time */
                loss_since?: string | null;
                /** Format: date-time */
                recovery_since?: string | null;
            };
            external?: components["schemas"]["ExternalSignalSnapshot"];
            /** Format: int64 */
            source_revision?: number;
            hardware?: components["schemas"]["HardwareIncidentEvidence"];
            log?: components["schemas"]["LogIncidentEvidence"];
            configuration?: components["schemas"]["ConfigurationIncidentEvidence"];
            topology?: components["schemas"]["TopologyIncidentEvidence"];
        };
        Incident: {
            id?: string;
            agent_id?: string;
            device_id?: string;
            source?: string;
            /** @description Simulated sources are isolated by Agent session. */
            scope?: string;
            rule_id?: string;
            occurrence?: number;
            /** @enum {string} */
            state?: "open" | "acknowledged" | "resolved";
            /** @enum {string} */
            severity?: "warning" | "critical";
            /** Format: date-time */
            opened_at?: string;
            /** Format: date-time */
            last_observed_at?: string;
            /** Format: date-time */
            updated_at?: string;
            /** Format: date-time */
            acknowledged_at?: string | null;
            acknowledged_by?: string | null;
            /** Format: date-time */
            resolved_at?: string | null;
            signal?: components["schemas"]["HealthAssessment"];
            /** @enum {string} */
            evidence_status?: "fresh" | "stale" | "collector_unavailable" | "historical" | "source_unavailable" | "configuration_changed" | "unknown" | "missing" | "clock_skew" | "clock_degraded" | "source_stale" | "non_finite";
            /** @enum {string} */
            resource_kind?: "device" | "interface" | "sip" | "agent" | "external" | "hardware" | "log" | "configuration" | "topology";
            /** @description Resource identity: hardware observation_key; interface/target ID for their rules; empty for device. */
            resource_id?: string;
            /** @description Hardware binding ID or SIP address/transport hash. Different contexts never share incidents. */
            resource_context?: string;
            source_instance_id?: string;
            external_event_id?: string;
        };
        IncidentAcknowledgeRequest: {
            /** @enum {boolean} */
            confirmed: true;
        };
        HealthPolicy: {
            cpu_warning_percent: number;
            cpu_critical_percent: number;
            cpu_recovery_percent: number;
            ram_warning_percent: number;
            ram_critical_percent: number;
            ram_recovery_percent: number;
            forecast_horizon_seconds: number;
        };
        HealthObservation: {
            current: boolean;
            agent_id: string;
            device_id: string;
            source: string;
            scope: string;
            assessment: components["schemas"]["HealthAssessment"];
            /** Format: date-time */
            evaluated_at: string;
            /** @enum {string} */
            resource_kind?: "device" | "interface" | "sip" | "agent" | "external" | "hardware" | "log" | "configuration" | "topology";
            /** @description Resource identity: hardware observation_key; interface/target ID for their rules; empty for device. */
            resource_id?: string;
            /** @description Hardware binding ID or SIP address/transport hash. Different contexts never share incidents. */
            resource_context?: string;
        };
        HealthCard: {
            /** @enum {string} */
            status: "ok" | "unknown" | "warning" | "critical";
            items: components["schemas"]["HealthObservation"][];
            /** @enum {string} */
            coverage?: "observed_components_only";
            /** @description A bounded projection may have reached its response cap. */
            truncated?: boolean;
        };
        HealthRules: {
            policy?: components["schemas"]["HealthPolicy"];
            rule_ids?: string[];
            minimum_sustain_samples?: number;
            minimum_trend_samples?: number;
            minimum_trend_window_seconds?: number;
            minimum_trend_r_squared?: number;
            resource_policy?: components["schemas"]["ResourcePolicy"];
            /** @description Current rule setting: 300 */
            flap_window_seconds?: number;
            /** @description Current rule setting: 4 */
            flap_warning_changes?: number;
            /** @description Current rule setting: 8 */
            flap_critical_changes?: number;
            /** @description Current rule setting: 300 */
            flap_recovery_seconds?: number;
            /** @description Current rule setting: 15 */
            collector_confirmation_seconds?: number;
        };
        IncidentTransition: {
            /** Format: int64 */
            id?: number;
            state?: string;
            reason?: string;
            /** Format: date-time */
            at?: string;
            actor_id?: string | null;
        };
        IncidentEvidence: {
            /** Format: int64 */
            id?: number;
            kind?: string;
            /** Format: date-time */
            observed_at?: string;
            /** Format: date-time */
            at?: string;
            assessment?: components["schemas"]["HealthAssessment"];
        };
        ResourcePoint: {
            /** Format: int64 */
            record_id: number;
            /** @enum {string} */
            record_kind: "telemetry" | "telephony" | "hardware" | "log";
            /** Format: date-time */
            observed_at: string;
            value: number | null;
            state?: string;
        };
        ResourcePolicy: {
            utilization_warning_percent?: number;
            utilization_critical_percent?: number;
            utilization_recovery_percent?: number;
            errors_warning_per_second?: number;
            errors_critical_per_second?: number;
            errors_recovery_per_second?: number;
            drops_warning_per_second?: number;
            drops_critical_per_second?: number;
            drops_recovery_per_second?: number;
            sip_latency_warning_ms?: number;
            sip_latency_critical_ms?: number;
            sip_latency_recovery_ms?: number;
        };
        ReportFilter: {
            /** Format: date-time */
            from: string;
            /** Format: date-time */
            to: string;
            agent_id?: string;
            source?: string;
            /** @enum {string} */
            resource_kind?: "" | "device" | "interface" | "sip" | "agent" | "external" | "hardware" | "log" | "configuration" | "topology";
            /** @default 20 */
            top_limit: number;
        };
        ReportStats: {
            /** Format: int64 */
            overlapping_incidents?: number;
            /** Format: int64 */
            opened_in_period?: number;
            /** Format: int64 */
            carried_in?: number;
            /** Format: int64 */
            resolved_in_period?: number;
            /** Format: int64 */
            active_at_end?: number;
            /** Format: int64 */
            acknowledged_in_period?: number;
            /** @description Clipped sum, may overlap across rules/resources. Not downtime/availability. */
            summed_incident_seconds?: number;
            mean_acknowledgment_delay_seconds?: number | null;
            mean_resolution_delay_seconds?: number | null;
            /** Format: int64 */
            real_source_episodes?: number;
            /** Format: int64 */
            simulated_source_episodes?: number;
        };
        ReportRuleGroup: {
            rule_id?: string;
            source?: string;
            simulated?: boolean;
            /** Format: int64 */
            overlapping_incidents?: number;
            /** Format: int64 */
            opened_in_period?: number;
            summed_incident_seconds?: number;
        };
        ReportResourceGroup: {
            agent_id?: string;
            device_id?: string;
            resource_kind?: string;
            /** @description Resource identity: hardware observation_key; interface/target ID for their rules; empty for device. */
            resource_id?: string;
            /** @description Hardware binding ID or SIP address/transport hash. Different contexts never share incidents. */
            resource_context?: string;
            source?: string;
            scope?: string;
            /** Format: int64 */
            overlapping_incidents?: number;
            summed_incident_seconds?: number;
        };
        ReportRecurrence: components["schemas"]["ReportResourceGroup"] & {
            rule_id?: string;
            /** Format: int64 */
            opened_occurrences?: number;
            /** Format: date-time */
            first_opened_at?: string;
            /** Format: date-time */
            last_opened_at?: string;
        };
        ReportQuality: {
            filter_scope?: string;
            /** Format: int64 */
            telemetry_samples_received?: number;
            /** Format: int64 */
            received_samples_without_cpu?: number;
            /** Format: int64 */
            received_samples_with_future_clock?: number;
            /** Format: int64 */
            received_samples_more_than_5m_late?: number;
            /** Format: int64 */
            sip_samples_received?: number;
            /** Format: int64 */
            received_sip_samples_without_latency?: number;
            /** @description Currently always null: received samples do not establish uptime coverage. */
            availability_percent?: number | null;
            coverage_status?: string;
        };
        ReportSummary: {
            version?: string;
            /** Format: date-time */
            generated_at?: string;
            filter?: components["schemas"]["ReportFilter"];
            stats?: components["schemas"]["ReportStats"];
            by_rule?: components["schemas"]["ReportRuleGroup"][];
            top_resources?: components["schemas"]["ReportResourceGroup"][];
            recurring?: components["schemas"]["ReportRecurrence"][];
            quality?: components["schemas"]["ReportQuality"];
            methodology?: string[];
            rule_groups_truncated?: boolean;
        };
        ReportSnapshot: {
            id?: string;
            /** Format: date-time */
            created_at?: string;
            created_by?: string;
            filter?: components["schemas"]["ReportFilter"];
            report?: components["schemas"]["ReportSummary"];
        };
        DiagnosticTopologyLink: {
            edge_id?: string;
            agent_id?: string;
            from_device_id?: string;
            to_device_id?: string;
            local_interface_id?: string;
            remote_interface_id?: string;
            source?: string;
            scope?: string;
            protocol?: string;
            resolution_confidence?: string;
            /** Format: date-time */
            observed_at?: string;
            /** Format: date-time */
            expires_at?: string;
        };
        DiagnosticRelated: {
            incident?: components["schemas"]["Incident"];
            /** @enum {string} */
            relation?: "same_collector_temporal_context" | "collector_observability_context" | "same_device_context" | "same_resource_context" | "fresh_discovery_adjacency" | "port_and_neighbor_symptom_candidate";
            /** @enum {string} */
            strength?: "weak" | "moderate" | "strong_context";
            basis?: string[];
            topology_links?: components["schemas"]["DiagnosticTopologyLink"][];
            /** @enum {boolean} */
            causal_claim?: false;
        };
        DiagnosticContext: {
            version?: string;
            /** Format: date-time */
            generated_at?: string;
            incident?: components["schemas"]["Incident"];
            window_seconds?: number;
            related?: components["schemas"]["DiagnosticRelated"][];
            truncated?: boolean;
            topology_considered?: boolean;
            limitations?: string[];
        };
        /** @description Allowlisted pseudonymized numeric facts/relations and local log counts. Raw text/identifiers are excluded. */
        AIExportPayload: {
            version?: string;
            facts?: components["schemas"]["AIExportFact"][];
            relations?: components["schemas"]["AIExportRelation"][];
            log_severity_counts?: {
                [key: string]: number;
            };
            log_event_counts?: {
                [key: string]: number;
            };
            log_summary_ref?: string;
            limitations?: string[];
        };
        AIResult: {
            summary?: string;
            observations?: {
                text?: string;
                refs?: string[];
            }[];
            hypotheses?: {
                text?: string;
                refs?: string[];
                /** @enum {string} */
                confidence?: "low" | "medium";
            }[];
            recommendations?: {
                text?: string;
                refs?: string[];
                /** @enum {string} */
                safety?: "read_only" | "requires_operator_review";
            }[];
            limitations?: string[];
        };
        AIPreview: {
            id?: string;
            incident_id?: string;
            created_by?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            expires_at?: string;
            destination?: string;
            enabled?: boolean;
            prompt_version?: string;
            request_hash?: string;
            /** @description Exact reviewed provider JSON body; no Authorization header/API key. */
            request?: Record<string, never>;
            payload?: components["schemas"]["AIExportPayload"];
            excluded_fields?: string[];
            correlated_incident_id?: string;
            /** Format: int64 */
            correlation_revision?: number;
            references?: components["schemas"]["AIEvidenceReference"][];
        };
        AIAnalysisCreate: {
            preview_id: string;
            request_hash: string;
            /** @enum {boolean} */
            confirmed: true;
        };
        AIJob: {
            id?: string;
            incident_id?: string;
            preview_id?: string;
            created_by?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
            /** @enum {string} */
            state?: "queued" | "running" | "succeeded" | "failed" | "uncertain";
            failure?: string;
            model?: string;
            request_hash?: string;
            result?: components["schemas"]["AIResult"] | null;
            correlated_incident_id?: string;
            prompt_version?: string;
        };
        AIExportFact: {
            seconds_from_seed?: number;
            window_seconds?: number;
            slope_percent_per_second?: number | null;
            resource?: string;
            simulated?: boolean;
            value?: number | null;
            seconds_to_critical?: number | null;
            status?: string;
            connected?: boolean | null;
            sample_count?: number;
            unit?: string;
            severity?: string;
            r_squared?: number | null;
            rule?: string;
            ref?: string;
            incident?: string;
            source_kind?: string;
            source?: string;
            category?: string;
            incident_state?: string;
            time_quality?: string;
            observation_kind?: string;
            temporal_usable?: boolean;
            assets?: string[];
            /** Format: int64 */
            event_count?: number;
            change_count?: number;
        };
        AIExportRelation: {
            from?: string;
            strength?: string;
            kind?: string;
            to?: string;
            ref?: string;
            from_fact?: string;
            to_fact?: string;
        };
        CollectorSourceRef: {
            type?: string;
            collector_id?: string;
            protocol?: string;
            target_id?: string;
            resource_id?: string;
            /** @enum {string} */
            provenance?: "real" | "simulated" | "manual" | "external";
            instance_id?: string;
        };
        CollectorObservationTime: {
            /** Format: date-time */
            source_timestamp?: string;
            /** @description Protobuf duration; absent means unknown, 0s means measured zero */
            clock_offset?: string;
            /** Format: date-time */
            observed_at?: string;
            /** Format: date-time */
            collected_at?: string;
            /** @enum {string} */
            clock_quality?: "unknown" | "synced" | "acceptable" | "degraded" | "unsynced";
            /** @description Nonnegative protobuf duration; absent means unknown */
            uncertainty?: string;
        };
        CollectorObservation: {
            source?: components["schemas"]["CollectorSourceRef"];
            time?: components["schemas"]["CollectorObservationTime"];
        };
        /** @description Power state and operational state are distinct from component health. */
        CollectorHardwareStatus: {
            /** @enum {string} */
            health_rollup?: "ok" | "warning" | "critical" | "unknown";
            /** @enum {string} */
            health?: "ok" | "warning" | "critical" | "unknown";
            state?: string;
        };
        CollectorHardwareInventory: {
            resource_type?: string;
            status?: components["schemas"]["CollectorHardwareStatus"];
            capacity_bytes?: string;
            power_state?: string;
            threads?: number;
            physical_security?: string;
            manager_type?: string;
            relations?: {
                type?: string;
                target_resource_id?: string;
            }[];
            sku?: string;
            network_addresses?: string[];
            bios_version?: string;
            cores?: number;
            hardware_uuid?: string;
            memory_type?: string;
            asset_tag?: string;
            device_location?: string;
            chassis_type?: string;
            media_type?: string;
            protocol?: string;
            error_correction?: string;
            part_number?: string;
        } & {
            [key: string]: unknown;
        };
        CollectorIdentityEvidence: {
            type?: string;
            subtype?: number;
            subject_id?: string;
            value?: string;
            /** Format: byte */
            raw_value?: string;
            /** @enum {string} */
            confidence?: "high" | "medium" | "low" | "unresolved";
            source?: components["schemas"]["CollectorSourceRef"];
            /**
             * @description Local source scope, not a global Asset ID.
             * @enum {string}
             */
            subject_kind?: "network_device" | "network_interface" | "computer_system" | "chassis" | "manager" | "component" | "remote_neighbor";
            original_value?: string;
            origin?: string;
            time?: components["schemas"]["CollectorObservationTime"];
            /**
             * @description Absent is legacy unknown; invalid/rejected facts are diagnostics and never resolution evidence.
             * @enum {string}
             */
            normalization?: "canonical" | "invalid" | "rejected";
        };
        /** @description Transport evidence reported by the authenticated Collector, separate from claimed host. Binary raw_payload is omitted from REST. */
        CollectorSyslogMetadata: {
            raw_timestamp?: string;
            peer_ip?: string;
            structured_data?: string;
            message_id?: string;
            tls_identity?: string;
            version?: number;
            transport?: string;
            parse_status?: string;
            format?: string;
            authenticated?: boolean;
            managed?: boolean;
        };
        DataSource: {
            id: string;
            /** @enum {string} */
            type: "COLLECTOR" | "ZABBIX" | "PROMETHEUS" | "ANSIBLE";
            name: string;
            /** @description HTTPS without user info, query or fragment. Empty for Collector. */
            endpoint: string;
            /** @description Existing Agent ID for Collector. Empty for external sources. */
            connection_ref: string;
            /** @description Source registry flag; does not disable an existing Agent stream. */
            enabled: boolean;
            /** @description Delay between committed sync pages, 3s..24h. A full selected-host cycle may require several pages. Does not alter Collector YAML. */
            sync_interval_seconds: number;
            configuration: {
                /** @default 15 */
                timeout_seconds: number;
                /** @description Optional deployment-configured CA reference. Empty/absent uses system trust. Collector must leave empty. No file paths or insecure TLS switch. */
                tls_ca_ref?: string;
                zabbix?: components["schemas"]["ZabbixSettings"];
                prometheus?: components["schemas"]["PrometheusSettings"];
            };
            /** Format: int64 */
            revision: number;
            has_credential: boolean;
            /** @enum {string} */
            connection_status: "unverified" | "disabled" | "connected" | "disconnected" | "adapter_unavailable" | "error";
            /** Format: date-time */
            last_successful_sync: string | null;
            last_error: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
            /** @description Actual registered read-only operations. Collector: stream_status,test. Zabbix: test,sync inventory. Prometheus/Ansible not yet implemented. */
            capabilities: string[];
        };
        DataSourceInput: {
            /** @enum {string} */
            type: "COLLECTOR" | "ZABBIX" | "PROMETHEUS" | "ANSIBLE";
            name: string;
            /** @description HTTPS without user info, query or fragment. Empty for Collector. */
            endpoint?: string;
            /** @description Existing Agent ID for Collector. Empty for external sources. */
            connection_ref?: string;
            /** @description Source registry flag; does not disable an existing Agent stream. */
            enabled: boolean;
            /** @description Delay between committed sync pages, 3s..24h. A full selected-host cycle may require several pages. Does not alter Collector YAML. */
            sync_interval_seconds: number;
            configuration?: {
                /** @default 15 */
                timeout_seconds: number;
                /** @description Optional deployment-configured CA reference. Empty/absent uses system trust. Collector must leave empty. No file paths or insecure TLS switch. */
                tls_ca_ref?: string;
                zabbix?: components["schemas"]["ZabbixSettings"];
                prometheus?: components["schemas"]["PrometheusSettings"];
            };
            /**
             * Format: int64
             * @description POST: zero or absent. PUT: latest revision required.
             */
            revision?: number;
            /** @description Omitted or null retains secret. Empty string removes it. Stored encrypted, never returned. Must be replaced or cleared when endpoint changes. */
            credential?: string | null;
        };
        DataSourceJob: {
            id: string;
            source_id: string;
            /** @enum {string} */
            operation: "test" | "sync";
            /** @enum {string} */
            trigger: "manual" | "schedule";
            /** @enum {string} */
            state: "queued" | "running" | "retry_wait" | "succeeded" | "failed" | "cancelled";
            /** Format: int64 */
            source_revision: number;
            attempts: number;
            /** @description Fixed public outcome code; no remote response/error text. */
            code: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            started_at: string | null;
            /** Format: date-time */
            finished_at: string | null;
            /** Format: date-time */
            next_attempt_at: string;
            actor_id: string | null;
        };
        DataSourceJobEvent: {
            /** Format: int64 */
            id: number;
            /** @enum {string} */
            state: "queued" | "running" | "retry_wait" | "succeeded" | "failed" | "cancelled";
            code: string;
            attempt: number;
            job_id: string;
            /** Format: date-time */
            at: string;
        };
        Asset: {
            id?: string;
            /** @enum {string} */
            kind?: "host" | "network_device" | "system" | "bmc" | "chassis" | "component" | "unknown";
            canonical_name?: string;
            vendor?: string;
            model?: string;
            serial?: string;
            hardware_revision?: string;
            software_version?: string;
            firmware_version?: string;
            /**
             * @description Inventory lifecycle, not physical availability. B3.1 creates observed.
             * @enum {string}
             */
            lifecycle_status?: "observed" | "retired" | "merged";
            /**
             * @description unresolved single-source, resolved manually combined current facts, conflict when current identities contradict. Does not mean physical health.
             * @enum {string}
             */
            resolution_status?: "unresolved" | "resolved" | "conflict";
            /** @description Empty for real data; isolated source/session namespace for simulation. */
            scope?: string;
            canonical_binding_id?: string;
            source_count?: number;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
            /** Format: int64 */
            revision?: number;
            /** @description Historical alias target. Default asset list excludes merged records. */
            merged_into_id?: string | null;
        };
        AssetSourceBinding: {
            id?: string;
            asset_id?: string;
            source_instance_id?: string;
            source_type?: string;
            source_name?: string;
            external_type?: string;
            external_id?: string;
            /** @description source_owned does not prove cross-source physical identity. */
            confidence?: string;
            /** @enum {string} */
            provenance?: "real" | "simulated" | "manual" | "external";
            scope?: string;
            legacy_agent_id?: string | null;
            legacy_device_id?: string | null;
            /** Format: date-time */
            first_seen?: string;
            /** Format: date-time */
            last_seen?: string;
            /** Format: date-time */
            inventory_at?: string;
            /** Format: int64 */
            latest_fact_id?: number;
            /** @description Normalized source Device snapshot; returned only on inventory route. No Agent is invented for external sources. */
            inventory?: {
                [key: string]: unknown;
            };
            /** @description Bounded non-secret source facts. Zabbix: api_version, monitoring_enabled/status, maintenance_status/type, active_available, interfaces, groups, tags. Availability is not physical online/power. Empty object for Collector. */
            provider_state?: {
                [key: string]: unknown;
            };
        };
        AssetFactVersion: {
            /** Format: int64 */
            id?: number;
            origin?: string;
            origin_ref?: string;
            current?: boolean;
            binding_id?: string;
            /** Format: date-time */
            received_at?: string;
            inventory?: {
                [key: string]: unknown;
            };
            asset_id?: string;
            /** Format: date-time */
            observed_at?: string;
            /** @description Bounded non-secret source facts. Zabbix: api_version, monitoring_enabled/status, maintenance_status/type, active_available, interfaces, groups, tags. Availability is not physical online/power. Empty object for Collector. */
            provider_state?: {
                [key: string]: unknown;
            };
        };
        AssetIdentity: {
            /** Format: int64 */
            id?: number;
            current?: boolean;
            /** @description Syntactic normalization usable, not a verified uniqueness claim. */
            usable?: boolean;
            /** @description Nonempty component/interface subject is not the root device identity. */
            subject_id?: string;
            binding_id?: string;
            value?: string;
            kind?: string;
            /** Format: int64 */
            fact_id?: number;
            evidence?: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            observed_at?: string;
            confidence?: string;
            normalized_value?: string;
        };
        AssetMergeInput: {
            source_id: string;
            reason: string;
            target_id: string;
            /** Format: int64 */
            target_revision: number;
            canonical_binding_id: string;
            /** @enum {boolean} */
            confirmed: true;
            /** Format: int64 */
            source_revision: number;
        };
        AssetSplitInput: {
            canonical_binding_id: string;
            reason: string;
            /** @enum {boolean} */
            confirmed: true;
            /** Format: int64 */
            revision: number;
            binding_ids: string[];
            asset_id: string;
        };
        AssetDecision: {
            source_id?: string;
            target_id?: string;
            reason?: string;
            binding_ids?: string[];
            id?: string;
            actor_id?: string;
            canonical_binding_id?: string;
            /** @enum {string} */
            operation?: "merge" | "split";
            /** Format: date-time */
            created_at?: string;
        };
        AssetCandidate: {
            comparison?: {
                /** @description Review suggestion only; no automatic merge. */
                strong_match?: boolean;
                conflicts?: string[];
                matches?: string[];
            };
            asset?: components["schemas"]["Asset"];
            /** @description Previous explicit separation; reviewed manual merge can override it. */
            blocked_by_decision?: boolean;
        };
        AssetResolutionEvent: {
            target_asset_id?: string | null;
            source_asset_id?: string;
            /** Format: int64 */
            fact_id?: number;
            /** Format: date-time */
            source_observed_at?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: int64 */
            id?: number;
            target_observed_ats?: string[];
            target_fact_ids?: number[];
            /** @enum {string} */
            code?: "matched" | "ambiguous" | "separated" | "conflict" | "stale" | "insufficient_evidence";
            binding_id?: string;
        };
        ZabbixSettings: {
            /** @description Explicit selected Zabbix host IDs, positive canonical uint64. Required nonempty for sync. No unrestricted host discovery. */
            host_ids?: string[];
            /** @default 20 */
            page_size: number;
            /**
             * @description Explicit kind for this source selection; never guessed from hostname or IP.
             * @default unknown
             * @enum {string}
             */
            device_type: "unknown" | "server" | "workstation" | "router" | "switch" | "firewall" | "gateway" | "access_point" | "voice_gateway" | "pbx" | "hypervisor" | "system" | "bmc" | "chassis" | "component";
            /**
             * @description Explicit administrator attestation that inventory serials are verified. Otherwise serial confidence is medium; false by default.
             * @default false
             */
            verified_inventory: boolean;
            monitoring?: components["schemas"]["ZabbixMonitoring"];
        };
        ExternalItemMapping: {
            host_id: string;
            item_id: string;
            /** @enum {string} */
            metric: "cpu.utilization" | "memory.utilization" | "disk.utilization" | "memory.used" | "memory.total" | "disk.free" | "network.rx" | "network.tx" | "network.errors" | "latency" | "availability";
            /** @enum {string} */
            unit: "percent" | "bytes" | "bytes_per_second" | "per_second" | "seconds" | "boolean";
            source_unit: string;
            /**
             * @description Positive decimal multiplier <=1e9. Explicit conversion; e.g. 0.001 for ms to seconds.
             * @default 1
             */
            multiplier: string;
            /** @default 300 */
            max_age_seconds: number;
        };
        ZabbixMonitoring: {
            /** @default false */
            enabled: boolean;
            /** @default 20 */
            event_page_size: number;
            /** @default 86400 */
            event_lookback_seconds: number;
            item_mappings?: components["schemas"]["ExternalItemMapping"][];
        };
        ExternalMetric: {
            source_instance_id?: string;
            /** Format: int64 */
            source_revision?: number;
            source_type?: string;
            asset_id?: string;
            host_id?: string;
            /** @description Zabbix numeric item ID or opaque prom_metric_<SHA256> ID. */
            item_id?: string;
            name?: string;
            metric?: string;
            unit?: string;
            source_unit?: string;
            multiplier?: string;
            /** @description Normalized decimal string; null means unavailable. Raw uint64 values retain precision. */
            value?: string | null;
            /** @description Numeric input only; no arbitrary string/log values. */
            raw_value?: string;
            /** Format: date-time */
            observed_at?: string | null;
            nanoseconds?: number;
            /** @enum {string} */
            quality?: "fresh" | "stale" | "disabled" | "unsupported" | "non_numeric" | "unit_mismatch" | "no_data" | "clock_skew" | "invalid_value" | "unavailable" | "source_unavailable" | "configuration_changed" | "non_finite" | "partial" | "ambiguous";
            max_age_seconds?: number;
            /** Format: date-time */
            received_at?: string;
            /** Format: date-time */
            last_seen?: string;
            mapping_id?: string;
            time_semantics?: string;
            /** Format: date-time */
            scraped_at?: string;
        };
        ExternalSignalSnapshot: {
            event_id?: string;
            trigger_id?: string;
            host_ids?: string[];
            name?: string;
            trigger_name?: string;
            trigger_status?: string;
            /** @description Original Zabbix severity, separate from coarse Incident warning/critical. */
            severity?: number;
            /** @description Zabbix acknowledgment, independent of local Incident acknowledge. */
            acknowledged?: boolean;
            suppressed?: boolean;
            /** Format: date-time */
            observed_at?: string;
            nanoseconds?: number;
            recovery_event_id?: string;
            /** Format: date-time */
            recovered_at?: string | null;
            /** @enum {string} */
            state?: "active" | "resolved";
            /** @enum {string} */
            mapping_status?: "host_filter" | "trigger_unavailable";
        };
        ExternalSignal: {
            event_id?: string;
            trigger_id?: string;
            host_ids?: string[];
            name?: string;
            trigger_name?: string;
            trigger_status?: string;
            /** @description Original Zabbix severity, separate from coarse Incident warning/critical. */
            severity?: number;
            /** @description Zabbix acknowledgment, independent of local Incident acknowledge. */
            acknowledged?: boolean;
            suppressed?: boolean;
            /** Format: date-time */
            observed_at?: string;
            nanoseconds?: number;
            recovery_event_id?: string;
            /** Format: date-time */
            recovered_at?: string | null;
            /** @enum {string} */
            state?: "active" | "resolved";
            /** @enum {string} */
            mapping_status?: "host_filter" | "trigger_unavailable";
            source_instance_id?: string;
            /** Format: int64 */
            source_revision?: number;
            source_type?: string;
            incident_id?: string;
            asset_ids?: string[];
            /** Format: date-time */
            first_seen?: string;
            /** Format: date-time */
            last_seen?: string;
            /** @enum {string} */
            freshness?: "fresh" | "stale" | "historical" | "source_unavailable" | "configuration_changed";
        };
        ExternalSignalVersion: {
            /** Format: int64 */
            id?: number;
            /** Format: int64 */
            source_revision?: number;
            /** Format: date-time */
            received_at?: string;
            signal?: components["schemas"]["ExternalSignalSnapshot"];
        };
        PrometheusMapping: {
            id: string;
            metric: string;
            unit: string;
            /** @description Admin configured PromQL, parsed and narrowed at EVERY vector selector with target identity labels. No raw viewer expressions. */
            expression: string;
            /** @default 1 */
            multiplier: string;
            /** @default 300 */
            max_age_seconds: number;
            metadata_metric?: string;
        };
        PrometheusSettings: {
            scrape_pools?: string[];
            label_match?: {
                [key: string]: string;
            };
            /**
             * @description Must contain job and instance; include cluster/namespace where identity would otherwise collide.
             * @default [
             *       "job",
             *       "instance"
             *     ]
             */
            identity_labels: string[];
            /** @default 5 */
            page_size: number;
            /** @default 200 */
            max_targets: number;
            /**
             * @default none
             * @enum {string}
             */
            auth_mode: "none" | "bearer" | "basic";
            username?: string;
            /**
             * @default unknown
             * @enum {string}
             */
            device_type: "unknown" | "server" | "router" | "switch" | "firewall" | "hypervisor";
            /**
             * @default custom
             * @enum {string}
             */
            profile: "custom" | "node_exporter";
            /** @default false */
            verified_identity_labels: boolean;
            mappings?: components["schemas"]["PrometheusMapping"][];
            hostname_label?: string;
            manufacturer_label?: string;
            model_label?: string;
            serial_label?: string;
            uuid_label?: string;
            /**
             * @description Opt in to firing alerts for selected targets. Missing alerts are not inferred as recovery.
             * @default false
             */
            alerts_enabled: boolean;
        };
        PrometheusPoint: {
            /** Format: date-time */
            at?: string;
            value?: string | null;
            /** @enum {string} */
            quality?: "valid" | "non_finite" | "invalid_value";
        };
        PrometheusMetadata: {
            metric?: string;
            type?: string;
            unit?: string;
            help?: string;
        };
        PrometheusQueryResult: {
            source_instance_id?: string;
            /** Format: int64 */
            source_revision?: number;
            asset_id?: string;
            target_id?: string;
            mapping_id?: string;
            metric?: string;
            unit?: string;
            /** @enum {string} */
            kind?: "instant" | "range" | "metadata";
            /** @enum {string} */
            time_semantics?: "promql_evaluation";
            /** @enum {string} */
            quality?: "complete" | "partial" | "no_data" | "unsupported" | "ambiguous";
            points?: components["schemas"]["PrometheusPoint"][];
            metadata?: components["schemas"]["PrometheusMetadata"][];
        };
        PhysicalLocation: {
            id: string;
            /** @enum {string} */
            kind: "site" | "building" | "room" | "rack";
            parent_id: string | null;
            name: string;
            rack_units: number;
            /** Format: int64 */
            revision: number;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
        };
        /** @description site has no parent; building->site, room->building, rack->room. Kind and parent are immutable. Rack capacity 1..100. Create expected_revision=0, update requires current revision. Duplicate sibling names rejected. */
        PhysicalLocationInput: {
            /** @enum {string} */
            kind: "site" | "building" | "room" | "rack";
            parent_id?: string | null;
            name: string;
            rack_units?: number;
            /** Format: int64 */
            expected_revision?: number;
            reason: string;
        };
        /** @description Path ordered site->building->room->rack. Unit numbering increases from 1; rack positions occupy [start_unit,start_unit+height_units-1]. No front/rear overbooking. Outside rack requires room. Unplaced has zero units and null location. Placement revision is independent from inventory refreshes. */
        AssetPlacement: {
            asset_id: string;
            /** @enum {string} */
            mode: "unplaced" | "rack" | "outside_rack";
            location_id: string | null;
            start_unit: number;
            height_units: number;
            position: string;
            /** Format: int64 */
            revision: number;
            /** Format: date-time */
            updated_at: string | null;
            path: components["schemas"]["PhysicalLocation"][];
        };
        PlacementInput: {
            asset_id: string;
            /** @enum {string} */
            mode: "unplaced" | "rack" | "outside_rack";
            location_id?: string | null;
            start_unit?: number;
            height_units?: number;
            position?: string;
            /** Format: int64 */
            expected_revision?: number;
        };
        /** @description asset_id may be omitted; if supplied must match path. expected_revision=0 for first placement, otherwise current placement revision. Changing to unplaced explicitly frees all slots. */
        PlacementRequest: {
            asset_id?: string;
            /** @enum {string} */
            mode: "unplaced" | "rack" | "outside_rack";
            location_id?: string | null;
            start_unit?: number;
            height_units?: number;
            position?: string;
            /** Format: int64 */
            expected_revision?: number;
            reason: string;
        };
        /** @description Atomic reviewed JSON import, maximum 64 KiB. Existing location IDs required. Supports rack swaps; entire batch rolls back on one conflict. */
        PlacementImport: {
            placements: components["schemas"]["PlacementInput"][];
            reason: string;
        };
        PlacementEvent: {
            /** Format: int64 */
            id: number;
            asset_id: string;
            actor_id: string;
            before: components["schemas"]["AssetPlacement"];
            after: components["schemas"]["AssetPlacement"];
            reason: string;
            /** Format: date-time */
            created_at: string;
        };
        RackLayout: {
            location: components["schemas"]["PhysicalLocation"];
            placements: components["schemas"]["AssetPlacement"][];
            occupied_units: number;
            free_units: number;
        };
        /** @description Current source-owned claim. observed_at uses explicit fact/evidence observation time if supplied; snapshot_observed_at is last accepted snapshot time, fact_received_at is receipt of fact version, not every heartbeat. Source enabled/clock quality do not claim live freshness. */
        InventoryClaim: {
            value: unknown;
            binding_id: string;
            source_instance_id: string;
            source_type: string;
            collector_protocol: string;
            source_name: string;
            provenance: string;
            /** Format: int64 */
            fact_id: number;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            snapshot_observed_at: string;
            /** Format: date-time */
            fact_received_at: string;
            source_enabled: boolean;
            confidence: string;
            /** @enum {string} */
            method: "device_field" | "identity_evidence" | "device_addresses" | "provider_interfaces";
            usable: boolean;
            clock_quality: string;
            evidence?: Record<string, never>;
        };
        /** @description Scalar chooses highest confidence only if best claims agree; canonical source breaks ties between equal values. All differing usable claims remain visible. Rejected identities never selected. IPs are sorted union; components/networks/hardware remain source-scoped with no guessed component merge. Unknown value/selected=null. Management interfaces remain scoped to each binding and include only selected normalized Zabbix interface fields. */
        InventoryAttribute: {
            /** @enum {string} */
            status: "unknown" | "observed" | "conflict" | "source_scoped";
            value: unknown;
            selected: components["schemas"]["InventoryClaim"] | null;
            conflict: boolean;
            claims: components["schemas"]["InventoryClaim"][];
        };
        /** @description Current inventory, not hardware online state. Complete means vendor/model/serial available; all other fields optional. Source_location is a raw claim, never an applied placement. Bounded at 128 bindings and 8 MiB snapshots. Old per-binding /inventory stays unchanged. */
        ResolvedInventory: {
            asset_id: string;
            /** Format: int64 */
            asset_revision: number;
            /** @enum {string} */
            status: "unknown" | "partial" | "complete" | "conflict";
            missing: string[];
            source_count: number;
            attributes: {
                [key: string]: components["schemas"]["InventoryAttribute"];
            };
            placement: components["schemas"]["AssetPlacement"];
        };
        /** @description An existing active Asset or a source-scoped placeholder. No guessed online/power/health. Unknown neighbors never create Assets. */
        GlobalTopologyNode: {
            id: string;
            asset_id: string | null;
            /** @enum {string} */
            kind: "asset" | "source_device" | "unresolved_neighbor" | "unresolved_resource";
            asset_kind: string;
            label: string;
            scope: string;
            binding_ids: string[];
        };
        GlobalTopologyEvidence: {
            source_instance_id: string;
            agent_id?: string;
            device_id?: string;
            scope?: string;
            observation_id: string;
            /** Format: int64 */
            version_id: number;
            protocol: string;
            source?: string;
            from: string;
            to: string;
            local_port: components["schemas"]["TopologyPort"];
            remote_port: components["schemas"]["TopologyPort"];
            /** Format: date-time */
            observed_at?: string;
            /** Format: date-time */
            received_at?: string;
            /** Format: date-time */
            expires_at?: string;
            /** @enum {string} */
            status: "active" | "expired" | "clock_skew";
            confidence?: string;
            resolution: components["schemas"]["TopologyResolution"];
            /** @description Canonical Neighbor proto JSON; raw bytes base64 and typed observation time retained. */
            neighbor: Record<string, never>;
        };
        /** @description Canonical undirected evidence group; each evidence retains directed from/to. Bidirectional requires active resolved reciprocal advertised typed ports. Does not prove physical cable. Port changes retain old evidence until TTL. Protocol-local port IDs are not guessed equivalent. */
        GlobalTopologyEdge: {
            id: string;
            /** @enum {string} */
            kind: "layer2_observation";
            from: string;
            to: string;
            from_port_key: string;
            to_port_key: string;
            status: string;
            /** @enum {string} */
            confirmation: "one_sided" | "bidirectional" | "unresolved";
            confidence: string;
            protocols: string[];
            evidence: components["schemas"]["GlobalTopologyEvidence"][];
        };
        GlobalManagementEvidence: {
            source_instance_id: string;
            binding_id: string;
            /** Format: int64 */
            fact_id: number;
            /** Format: date-time */
            observed_at: string;
            target_resource_id: string;
        };
        /** @description Separate management relation, not a network cable. Resource resolution includes Collector source, simulation scope and BMC target/type/protocol/instance. */
        GlobalManagementRelation: {
            id: string;
            /** @enum {string} */
            type: "BMC_MANAGES_SYSTEM" | "BMC_MANAGES_CHASSIS";
            from: string;
            to: string;
            status: string;
            evidence: components["schemas"]["GlobalManagementEvidence"][];
        };
        /** @description Additive global topology above existing Asset mappings. No asset merge from LLDP/hostname. Complete inventory required for unique remote resolution. Bounded 4000 bindings/16 MiB inventory, 10000 observations/16 MiB, 2000 management groups. Edge pagination applies after grouping, and total_edges counts loaded evidence only. */
        GlobalTopologyGraph: {
            /** Format: date-time */
            generated_at: string;
            nodes: components["schemas"]["GlobalTopologyNode"][];
            edges: components["schemas"]["GlobalTopologyEdge"][];
            management_relations: components["schemas"]["GlobalManagementRelation"][];
            truncated: boolean;
            inventory_truncated: boolean;
            observations_truncated: boolean;
            /** Format: int64 */
            total_edges: number;
            /** Format: int64 */
            limit: number;
            /** Format: int64 */
            offset: number;
        };
        /** @description Discovery/TTL lifecycle history. Immutable version evidence; current_local_asset_id follows current binding and is not an historical Asset mapping. asset_id filter selects current local reporter only. Earlier full snapshots remain in legacy archive. BMC changes are inventory fact history; merge/split decisions have separate audit. */
        GlobalTopologyChange: {
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            version_id: number;
            /** @enum {string} */
            kind: "observed" | "changed" | "revived" | "expired" | "imported";
            /** Format: date-time */
            occurred_at: string;
            /** Format: date-time */
            recorded_at: string;
            source_instance_id: string;
            scope: string;
            agent_id: string;
            device_id: string;
            observation_id: string;
            protocol: string;
            current_local_asset_id: string | null;
            /** Format: date-time */
            version_observed_at: string;
            /** Format: date-time */
            version_expires_at: string;
            neighbor: Record<string, never>;
        };
        GlobalTopologyChanges: {
            items: components["schemas"]["GlobalTopologyChange"][];
            /** Format: int64 */
            next_after_id: number;
            has_more: boolean;
            /** Format: int64 */
            limit: number;
        };
        AssetHardwareObservation: {
            device_id: string;
            kind: string;
            resource_id: string;
            subject_id: string;
            name: string;
            unit: string;
            /** Format: double */
            value: number | null;
            source_type: string;
            provenance: string;
            source_ref: {
                [key: string]: unknown;
            } | null;
            observation_time: {
                [key: string]: unknown;
            } | null;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            collected_at: string | null;
            /** Format: date-time */
            source_timestamp: string | null;
            clock_quality: string;
            data_quality: string;
            payload: {
                [key: string]: unknown;
            } | null;
            resource_type: string;
            power_state: string;
            health: string;
            health_rollup: string;
            operational_state: string;
        };
        /** @description Source-specific observation; related entries preserve the owning Asset ID and verified management relation IDs. Power Off is independent from hardware health. Freshness is evaluated at read time against max_age_seconds, source availability, simulation session and clock quality. */
        AssetHardwareItem: {
            device_id: string;
            kind: string;
            resource_id: string;
            subject_id: string;
            name: string;
            unit: string;
            /** Format: double */
            value: number | null;
            source_type: string;
            provenance: string;
            source_ref: {
                [key: string]: unknown;
            } | null;
            observation_time: {
                [key: string]: unknown;
            } | null;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            collected_at: string | null;
            /** Format: date-time */
            source_timestamp: string | null;
            clock_quality: string;
            data_quality: string;
            payload: {
                [key: string]: unknown;
            } | null;
            resource_type: string;
            power_state: string;
            health: string;
            health_rollup: string;
            operational_state: string;
            /** Format: int64 */
            id: number;
            observation_key: string;
            message_id: string;
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            source_name: string;
            scope: string;
            /** Format: date-time */
            received_at: string;
            freshness: string;
            source_enabled: boolean;
            agent_connected: boolean;
            related: boolean;
            relation_ids: string[];
            /** @description Effective per-item freshness window. Applied managed cadence may extend the automatic 300s fallback; explicit max_age_seconds always takes precedence. */
            freshness_max_age_seconds?: number;
        };
        AssetHardwarePage: {
            asset_id: string;
            /** Format: date-time */
            generated_at: string;
            items: components["schemas"]["AssetHardwareItem"][];
            /** Format: int64 */
            limit: number;
            /** Format: int64 */
            offset: number;
            has_more: boolean;
            relations_truncated: boolean;
            /** Format: int64 */
            max_age_seconds: number;
        };
        AssetHardwareHistoryPage: {
            asset_id: string;
            /** Format: date-time */
            generated_at: string;
            items: components["schemas"]["AssetHardwareItem"][];
            /** Format: int64 */
            limit: number;
            /** Format: int64 */
            next_after_id: number;
            has_more: boolean;
            relations_truncated: boolean;
            /** Format: int64 */
            max_age_seconds: number;
        };
        AssetLogRecord: {
            /** Format: int64 */
            id: number;
            agent_id: string;
            device_id: string;
            record_id: string;
            message_id: string;
            source: string;
            source_id: string;
            /** Format: date-time */
            event_at: string;
            /** Format: date-time */
            observed_at: string;
            /** Format: date-time */
            original_timestamp: string | null;
            /** Format: date-time */
            received_at: string;
            /** @enum {string} */
            time_basis: "original_timestamp" | "observed_at";
            /** Format: int64 */
            severity: number | null;
            /** @enum {string} */
            severity_name: "emergency" | "alert" | "critical" | "error" | "warning" | "notice" | "info" | "debug" | "unknown";
            /** Format: int64 */
            facility: number | null;
            host: string;
            process: string;
            process_id: string;
            message: string;
            truncated: boolean;
            redacted: boolean;
            file_identity: string;
            /** Format: int64 */
            offset: number;
            audit: components["schemas"]["LogAudit"];
            syslog?: components["schemas"]["CollectorSyslogMetadata"];
            observation?: components["schemas"]["CollectorObservation"];
            raw_payload_omitted?: boolean;
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            record_scope: string;
            /** @enum {string} */
            association: "source_owned_device_reference";
        };
        AssetLogPage: {
            asset_id: string;
            items: components["schemas"]["AssetLogRecord"][];
            /** Format: int64 */
            next_before_id: number | null;
            /** Format: int64 */
            limit: number;
        };
        AssetAuditEvent: {
            /** Format: int64 */
            cursor_id: number;
            key: string;
            agent_id: string;
            device_id: string;
            source: string;
            source_id: string;
            file_identity: string;
            host: string;
            event_id: string;
            /** Format: date-time */
            first_event_at: string;
            /** Format: date-time */
            last_event_at: string;
            /** Format: date-time */
            first_received_at: string;
            /** Format: date-time */
            last_received_at: string;
            /** Format: int64 */
            record_count: number;
            record_types: string[];
            /** @enum {string} */
            outcome: "unknown" | "success" | "failure" | "mixed";
            /**
             * @description Transport does not prove that all audit lines were collected. Counts describe the selected records only.
             * @enum {string}
             */
            completeness: "unknown";
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            record_scope: string;
            association: string;
        };
        AssetAuditPage: {
            asset_id: string;
            items: components["schemas"]["AssetAuditEvent"][];
            /** Format: int64 */
            next_before_id: number | null;
            /** Format: int64 */
            limit: number;
        };
        AssetLogRaw: {
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            record_scope: string;
            /** Format: int64 */
            id: number;
            raw: string;
            redacted: boolean;
            truncated: boolean;
            raw_payload_available: boolean;
            archive_payload_not_exposed: boolean;
        };
        /** @description Admin reviewed association. Collector source and inventory source may differ for real observations. Simulated targets require the same Collector and exact session. Address/transport/source must match a received scoped observation. Changes require current revisions, reason, confirmation and Idempotency-Key. */
        AssetVoIPInput: {
            binding_id: string;
            agent_id: string;
            target_id: string;
            address: string;
            /** @enum {string} */
            transport: "udp" | "tcp" | "tls";
            source: string;
            scope: string;
            /** @enum {string} */
            service_kind: "pbx" | "voice_gateway" | "sip_service";
            name: string;
            /** Format: int64 */
            expected_asset_revision: number;
            /** Format: int64 */
            expected_revision: number;
            enabled: boolean;
            /** @enum {boolean} */
            confirmed: true;
            reason: string;
        };
        AssetVoIPAssociation: {
            id: string;
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            inventory_source_instance_id: string;
            agent_id: string;
            target_id: string;
            address: string;
            transport: string;
            source: string;
            scope: string;
            service_kind: string;
            name: string;
            enabled: boolean;
            /** Format: int64 */
            revision: number;
            /** Format: int64 */
            reviewed_sample_id: number;
            /** Format: date-time */
            reviewed_at: string;
            reviewed_by: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
        };
        AssetVoIPEndpoint: {
            address: string;
            transport: string;
            source: string;
            /** Format: date-time */
            observed_at: string;
        };
        AssetVoIPService: {
            id: string;
            asset_id: string;
            binding_id: string;
            source_instance_id: string;
            inventory_source_instance_id: string;
            agent_id: string;
            target_id: string;
            address: string;
            transport: string;
            source: string;
            scope: string;
            service_kind: string;
            name: string;
            enabled: boolean;
            /** Format: int64 */
            revision: number;
            /** Format: int64 */
            reviewed_sample_id: number;
            /** Format: date-time */
            reviewed_at: string;
            reviewed_by: string;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            updated_at: string;
            mapping_status: string;
            mapping_reason: string;
            observed_endpoint: components["schemas"]["AssetVoIPEndpoint"] | null;
            latest: components["schemas"]["SIPSample"] | null;
            clock_issue: components["schemas"]["SIPSample"] | null;
            health: components["schemas"]["SIPHealth"];
            monitoring: components["schemas"]["SIPMonitoring"];
            incidents: components["schemas"]["Incident"][];
            incidents_truncated: boolean;
        };
        AssetVoIPCard: {
            asset_id: string;
            asset_name: string;
            scope: string;
            placement: components["schemas"]["AssetPlacement"];
            topology_node_id: string;
            /** Format: date-time */
            generated_at: string;
            items: components["schemas"]["AssetVoIPService"][];
            /** Format: int64 */
            limit: number;
            /** Format: int64 */
            offset: number;
        };
        AssetVoIPEvent: {
            /** Format: int64 */
            id: number;
            association_id: string;
            actor_id: string;
            before: components["schemas"]["AssetVoIPAssociation"] | null;
            after: components["schemas"]["AssetVoIPAssociation"];
            reason: string;
            /** Format: date-time */
            created_at: string;
        };
        AssetVoIPHistoryPage: {
            association: components["schemas"]["AssetVoIPAssociation"];
            items: components["schemas"]["SIPSample"][];
            /** Format: int64 */
            next_before_id: number | null;
            /** Format: int64 */
            limit: number;
        };
        AssetVoIPEventPage: {
            items: components["schemas"]["AssetVoIPEvent"][];
            limit: number;
            offset: number;
        };
        ManagedTargetPolling: {
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            fast_interval?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            medium_interval?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            inventory_interval?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            topology_interval?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            timeout?: string;
        };
        ManagedSNMPOptions: {
            /** @enum {string} */
            version?: "v2c" | "v3";
            /** @enum {string} */
            security_level?: "authPriv" | "authNoPriv";
            auth_protocol?: string;
            privacy_protocol?: string;
            context_name?: string;
            port?: number;
            retries?: number;
        };
        ManagedSIPOptions: {
            port?: number;
            /** @enum {string} */
            transport?: "udp" | "tcp" | "tls";
            from_user?: string;
            to_user?: string;
            domain?: string;
            server_name?: string;
            failure_threshold?: number;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            latency_threshold?: string;
        };
        ManagedRedfishOptions: {
            /** @enum {string} */
            auth?: "session" | "basic";
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            request_timeout?: string;
            max_resources?: number;
            max_pages?: number;
            max_requests?: number;
        };
        ManagedIPMIOptions: {
            port?: number;
            /** @enum {integer} */
            cipher_suite?: 3 | 17;
            /** @enum {string} */
            privilege?: "user" | "operator";
            retries?: number;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            request_timeout?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            max_session_duration?: string;
            /** @description Protobuf JSON Duration, e.g. 3s, 0.500s or 86400s. Polling is 3s..24h, hardware 10s..24h; omitted/zero selects the fixed v1 default. Unused SIP/hardware periods must be zero. */
            sdr_cache_ttl?: string;
            max_operations?: number;
            max_sdr_records?: number;
            max_sdr_bytes?: number;
            max_fru_records?: number;
            max_fru_bytes?: number;
            max_poll_bytes?: number;
        };
        ManagedTargetLocation: {
            site?: string;
            datacenter?: string;
            building?: string;
            room?: string;
            rack?: string;
            position?: string;
            rack_unit?: number;
            comment?: string;
        };
        /** @description The sole protocol option block must match protocol. RouterOS has no option block. Raw ID and SourceRef remote:<id> differ; SIP health target_id remains raw. */
        ManagedTarget: {
            target_id: string;
            /** @enum {string} */
            protocol: "snmp" | "routeros" | "sip" | "redfish" | "ipmi";
            /** @default false */
            enabled: boolean;
            /** @description SNMP/SIP/IPMI host/IP, or RouterOS/Redfish verified HTTPS origin; no embedded password or path. */
            endpoint: string;
            /** @description Allowlisted local credential name. Required for non-SIP. No secret value. */
            credential_ref?: string;
            /** @description Allowlisted local CA reference, never a file path. */
            ca_ref?: string;
            name?: string;
            vendor_hint?: string;
            location?: components["schemas"]["ManagedTargetLocation"];
            polling?: components["schemas"]["ManagedTargetPolling"];
            snmp?: components["schemas"]["ManagedSNMPOptions"];
            sip?: components["schemas"]["ManagedSIPOptions"];
            redfish?: components["schemas"]["ManagedRedfishOptions"];
            ipmi?: components["schemas"]["ManagedIPMIOptions"];
        };
        CollectorConfigInput: {
            /** Format: int64 */
            expected_revision: number;
            /** @enum {boolean} */
            confirmed: true;
            /** @default false */
            allow_empty_snapshot: boolean;
            reason: string;
            /** @description Collector managed site hint; fills missing target.location.site. B6 reviewed placement is separate. */
            site?: string;
            targets: components["schemas"]["ManagedTarget"][];
        };
        CollectorConfigSnapshot: {
            collector_id?: string;
            session_id?: string;
            revision?: string;
            configuration_digest?: string;
            /** Format: date-time */
            issued_at?: string;
            targets?: components["schemas"]["ManagedTarget"][];
        };
        CollectorConfigRevision: {
            collector_id?: string;
            /** Format: int64 */
            revision?: number;
            configuration_digest?: string;
            snapshot?: components["schemas"]["CollectorConfigSnapshot"];
            site?: string;
            actor_id?: string;
            reason?: string;
            /** Format: date-time */
            created_at?: string;
        };
        CollectorConfigState: {
            collector_id?: string;
            backend_enabled?: boolean;
            connected?: boolean;
            managed_config_v1?: boolean;
            remote_management_enabled?: boolean;
            in_sync?: boolean;
            session_id?: string;
            desired?: components["schemas"]["CollectorConfigRevision"] | null;
            /** Format: int64 */
            applied_revision?: number;
            applied_digest?: string;
            /** Format: date-time */
            applied_at?: string | null;
            verified_session_id?: string;
            /** @enum {string} */
            status?: "none" | "pending" | "received" | "validating" | "applied_reported" | "applied" | "rejected" | "failed";
            /** Format: int64 */
            status_revision?: number;
            error_code?: string;
            highest_reported_revision?: string;
        };
        CollectorConfigEvent: {
            /** Format: int64 */
            id?: number;
            collector_id?: string;
            session_id?: string;
            revision?: string;
            configuration_digest?: string;
            status?: string;
            correlated?: boolean;
            error_code?: string;
            /** Format: date-time */
            created_at?: string;
        };
        CollectorConfigHistory: {
            items?: components["schemas"]["CollectorConfigRevision"][];
            limit?: number;
            offset?: number;
        };
        CollectorConfigEvents: {
            items?: components["schemas"]["CollectorConfigEvent"][];
            limit?: number;
            offset?: number;
        };
        AutomationTemplate: {
            id?: string;
            platform?: string;
            collection?: string;
            /** @enum {boolean} */
            read_only?: true;
        };
        AutomationTargetInput: {
            /** Format: int64 */
            expected_revision: number;
            /** Format: int64 */
            asset_revision: number;
            /** @description Canonical literal IPv4/IPv6 device address. Worker destination CIDR allowlist also applies. */
            host: string;
            port: number;
            /** @enum {string} */
            template_id: "cisco_ios_read_config_v1" | "arista_eos_read_config_v1" | "vyos_read_config_v1";
            /** @description Worker-local credentials reference; no password/key content. */
            credential_ref: string;
            /** @description Reviewed public SSH host key: type and base64 only, no hostname/comment/options. */
            ssh_host_key: string;
            enabled: boolean;
            reason: string;
        };
        AutomationTarget: {
            /** Format: int64 */
            expected_revision?: number;
            /** Format: int64 */
            asset_revision?: number;
            /** @description Canonical literal IPv4/IPv6 device address. Worker destination CIDR allowlist also applies. */
            host?: string;
            port?: number;
            /** @enum {string} */
            template_id?: "cisco_ios_read_config_v1" | "arista_eos_read_config_v1" | "vyos_read_config_v1";
            /** @description Worker-local credentials reference; no password/key content. */
            credential_ref?: string;
            /** @description Reviewed public SSH host key: type and base64 only, no hostname/comment/options. */
            ssh_host_key?: string;
            enabled?: boolean;
            reason?: string;
            asset_id?: string;
            /** Format: int64 */
            revision?: number;
            /** Format: date-time */
            updated_at?: string;
        };
        AutomationJobInput: {
            /** Format: int64 */
            target_revision: number;
            timeout_seconds: number;
            reason: string;
        };
        AutomationJob: {
            id?: string;
            asset_id?: string;
            /** Format: int64 */
            target_revision?: number;
            template_id?: string;
            actor_id?: string;
            /** @enum {string} */
            state?: "queued" | "running" | "succeeded" | "failed" | "cancelled" | "timed_out";
            error_code?: string;
            timeout_seconds?: number;
            reason?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            started_at?: string | null;
            /** Format: date-time */
            finished_at?: string | null;
            snapshot_id?: string;
        };
        AutomationEvent: {
            /** Format: int64 */
            id?: number;
            job_id?: string;
            code?: string;
            /** Format: date-time */
            at?: string;
        };
        AutomationSnapshot: {
            id?: string;
            asset_id?: string;
            job_id?: string;
            template_id?: string;
            sha256?: string;
            bytes?: number;
            /** Format: date-time */
            observed_at?: string;
        };
        AutomationSnapshotContent: {
            configuration: string;
            facts: {
                [key: string]: unknown;
            };
        };
        AutomationWorker: {
            id?: string;
            available?: boolean;
            versions?: {
                [key: string]: string;
            };
            templates?: string[];
            /** Format: date-time */
            last_seen?: string;
            error_code?: string;
        };
        AutomationJobPage: {
            items?: components["schemas"]["AutomationJob"][];
            limit?: number;
            offset?: number;
        };
        AutomationEventPage: {
            items?: components["schemas"]["AutomationEvent"][];
            limit?: number;
            offset?: number;
        };
        AutomationSnapshotPage: {
            items?: components["schemas"]["AutomationSnapshot"][];
            limit?: number;
            offset?: number;
        };
        AutomationTemplateList: {
            items?: components["schemas"]["AutomationTemplate"][];
        };
        AutomationWorkerList: {
            items?: components["schemas"]["AutomationWorker"][];
        };
        ConfigurationBaselineInput: {
            /** Format: int64 */
            expected_revision: number;
            /** Format: int64 */
            asset_revision: number;
            snapshot_id: string;
            /** @enum {boolean} */
            confirmed: true;
            reason: string;
        };
        ConfigurationBaseline: {
            asset_id?: string;
            /** Format: int64 */
            revision?: number;
            /** Format: int64 */
            asset_revision?: number;
            snapshot_id?: string;
            read_template_id?: string;
            normalizer?: string;
            raw_sha256?: string;
            normalized_sha256?: string;
            actor_id?: string;
            reason?: string;
            /** Format: date-time */
            created_at?: string;
        };
        ConfigurationChange: {
            path?: string;
            /** @enum {string} */
            kind?: "changed" | "added" | "removed" | "access_vlan_changed";
            interface?: string;
            expected_vlan?: number;
            actual_vlan?: number;
            redacted?: boolean;
        };
        ConfigurationProposal: {
            /** @enum {string} */
            action?: "restore_access_vlan";
            interface?: string;
            expected_vlan?: number;
            actual_vlan?: number;
            /** @enum {boolean} */
            approval_required?: true;
            /** @enum {boolean} */
            execution_available?: true;
            limitation?: string;
        };
        ConfigurationComparison: {
            /** @enum {string} */
            status?: "unknown" | "compliant" | "drift";
            error_code?: string;
            expected_normalized_sha256?: string;
            actual_normalized_sha256?: string;
            changes?: components["schemas"]["ConfigurationChange"][];
            /** @description Changed contexts (global/interface), not count of raw diff lines. */
            total_changes?: number;
            truncated?: boolean;
            proposal?: components["schemas"]["ConfigurationProposal"] | null;
        };
        ConfigurationRelatedService: {
            association_id?: string;
            kind?: string;
            /** @enum {string} */
            relation?: "reviewed_asset_association_not_proven_port_impact";
        };
        ConfigurationDriftRecord: {
            /** @enum {string} */
            status?: "unknown" | "compliant" | "drift";
            error_code?: string;
            expected_normalized_sha256?: string;
            actual_normalized_sha256?: string;
            changes?: components["schemas"]["ConfigurationChange"][];
            /** @description Changed contexts (global/interface), not count of raw diff lines. */
            total_changes?: number;
            truncated?: boolean;
            proposal?: components["schemas"]["ConfigurationProposal"] | null;
            /** Format: int64 */
            id?: number;
            asset_id?: string;
            /** Format: int64 */
            baseline_revision?: number;
            actual_snapshot_id?: string;
            /** Format: int64 */
            actual_target_revision?: number;
            normalizer?: string;
            /** Format: date-time */
            actual_observed_at?: string;
            /** Format: date-time */
            compared_at?: string;
            related_services?: components["schemas"]["ConfigurationRelatedService"][];
        };
        ConfigurationDriftState: {
            asset_id?: string;
            /** @enum {string} */
            status?: "unknown" | "compliant" | "drift";
            reason?: string;
            fresh?: boolean;
            max_age_seconds?: number;
            baseline?: components["schemas"]["ConfigurationBaseline"] | null;
            latest?: components["schemas"]["ConfigurationDriftRecord"] | null;
        };
        ConfigurationCompareInput: {
            /** Format: int64 */
            baseline_revision: number;
            snapshot_id: string;
            reason: string;
        };
        ConfigurationBaselinePage: {
            items?: components["schemas"]["ConfigurationBaseline"][];
            limit?: number;
            offset?: number;
        };
        ConfigurationDriftRecordPage: {
            items?: components["schemas"]["ConfigurationDriftRecord"][];
            limit?: number;
            offset?: number;
        };
        ConfigurationRemediationPolicyInput: {
            /** Format: int64 */
            expected_revision: number;
            enabled: boolean;
            allowed_vlans: number[];
            protected_interfaces: string[];
            max_evidence_age_seconds: number;
            reason: string;
        };
        ConfigurationRemediationPolicy: {
            asset_id: string;
            /** Format: int64 */
            revision: number;
            /** Format: int64 */
            expected_revision: number;
            enabled: boolean;
            allowed_vlans: number[];
            protected_interfaces: string[];
            max_evidence_age_seconds: number;
            reason: string;
            actor_id: string;
            /** Format: date-time */
            updated_at: string;
        };
        ConfigurationRemediationInput: {
            /** Format: int64 */
            drift_result_id: number;
            /** Format: int64 */
            policy_revision: number;
            reason: string;
        };
        ConfigurationRemediationApprovalInput: {
            /** Format: int64 */
            expected_revision: number;
            /** @enum {boolean} */
            confirmed: true;
            timeout_seconds: number;
            reason: string;
        };
        ConfigurationRemediationCancelInput: {
            /** Format: int64 */
            expected_revision: number;
            reason: string;
        };
        ConfigurationRemediation: {
            id: string;
            asset_id: string;
            /** Format: int64 */
            revision: number;
            /** Format: int64 */
            drift_result_id: number;
            /** Format: int64 */
            baseline_revision: number;
            actual_snapshot_id: string;
            /** Format: int64 */
            policy_revision: number;
            /** @enum {string} */
            action: "restore_access_vlan";
            interface: string;
            expected_vlan: number;
            actual_vlan: number;
            /** @enum {string} */
            state: "pending_approval" | "queued" | "running" | "cancel_requested" | "verified" | "failed" | "cancelled";
            error_code: string;
            requester_id: string;
            approver_id?: string;
            reason: string;
            approval_reason?: string;
            automation_job_id?: string;
            /** Format: int64 */
            verification_drift_result_id?: number;
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            approved_at?: string | null;
            /** Format: date-time */
            finished_at?: string | null;
        };
        ConfigurationRemediationPage: {
            items: components["schemas"]["ConfigurationRemediation"][];
            limit: number;
            offset: number;
        };
        CorrelationAssetRole: {
            asset_id: string;
            /** @enum {string} */
            role: "provider" | "dependency" | "consumer";
        };
        CorrelationServiceInput: {
            name: string;
            /** @enum {string} */
            kind: "network" | "voice" | "infrastructure" | "business";
            enabled?: boolean;
            assets: components["schemas"]["CorrelationAssetRole"][];
            /** Format: int64 */
            expected_revision: number;
            /** @enum {boolean} */
            confirmed: true;
            reason: string;
        };
        CorrelationService: {
            id?: string;
            name?: string;
            kind?: string;
            enabled?: boolean;
            assets?: components["schemas"]["CorrelationAssetRole"][];
            revision?: number;
            created_by?: string;
            /** Format: date-time */
            created_at?: string;
            /** Format: date-time */
            updated_at?: string;
        };
        CorrelationSignal: {
            id?: string;
            incident_id?: string;
            category?: string;
            status?: string;
            severity?: string;
            source_kind?: string;
            source_instance_id?: string;
            scope?: string;
            time_quality?: string;
            /** Format: date-time */
            observed_at?: string;
            /** Format: date-time */
            received_at?: string;
            asset_ids?: string[];
            service_ids?: string[];
            site_ids?: string[];
            payload?: {
                [key: string]: unknown;
            };
        };
        CorrelationEvidence: {
            kind?: string;
            score?: number;
            details?: {
                [key: string]: unknown;
            };
        };
        CorrelationEvidenceRecord: components["schemas"]["CorrelationEvidence"] & {
            id?: number;
            left_signal_id?: string;
            right_signal_id?: string;
            /** Format: date-time */
            created_at?: string;
        };
        CorrelationMembership: {
            signal?: components["schemas"]["CorrelationSignal"];
            relation?: string;
            score?: number;
            evidence?: components["schemas"]["CorrelationEvidence"][];
            /** Format: date-time */
            added_at?: string;
        };
        CorrelationTimelineEvent: {
            id?: number;
            signal_id?: string;
            event_kind?: string;
            /** Format: date-time */
            occurred_at?: string;
            /** Format: date-time */
            recorded_at?: string;
            time_quality?: string;
            summary?: string;
        };
        CorrelatedIncident: {
            id?: string;
            state?: string;
            severity?: string;
            title?: string;
            primary_asset_id?: string;
            confidence?: string;
            time_confidence?: string;
            confidence_score?: number;
            revision?: number;
            signal_count?: number;
            active_signal_count?: number;
            source_count?: number;
            /** Format: date-time */
            opened_at?: string;
            /** Format: date-time */
            updated_at?: string;
            /** Format: date-time */
            resolved_at?: string;
        };
        CorrelationCase: {
            incident?: components["schemas"]["CorrelatedIncident"];
            signals?: components["schemas"]["CorrelationMembership"][];
            evidence?: components["schemas"]["CorrelationEvidenceRecord"][];
            timeline?: components["schemas"]["CorrelationTimelineEvent"][];
            limitations?: string[];
            truncated?: boolean;
        };
        CorrelatedIncidentPage: {
            items?: components["schemas"]["CorrelatedIncident"][];
            limit?: number;
            offset?: number;
        };
        CorrelationServicePage: {
            items?: components["schemas"]["CorrelationService"][];
            limit?: number;
            offset?: number;
        };
        CorrelationSummary: {
            open?: number;
            resolved?: number;
            multi_source?: number;
            normalized_signals?: number;
            correlation_window_seconds?: number;
            minimum_score?: number;
        };
        CorrelationRebuildInput: {
            /** @enum {boolean} */
            confirmed: true;
        };
        CorrelationRebuildResponse: {
            queued_incidents?: number;
        };
        AlertmanagerReceiverInput: {
            enabled: boolean;
            expected_revision: number;
            ttl_seconds: number;
            /** @enum {boolean} */
            confirmed: true;
            reason: string;
        };
        AlertmanagerReceiver: {
            source_id?: string;
            revision?: number;
            source_revision?: number;
            enabled?: boolean;
            /** Format: date-time */
            expires_at?: string;
            /** @description Returned only on successful enabled rotation; never returned by GET. */
            token?: string;
        };
        AlertmanagerWebhookAlert: {
            /** @enum {string} */
            status?: "firing" | "resolved";
            labels?: {
                [key: string]: string;
            };
            annotations?: {
                [key: string]: string;
            };
            /** Format: date-time */
            startsAt?: string;
            /** Format: date-time */
            endsAt?: string;
            generatorURL?: string;
            fingerprint?: string;
        };
        AlertmanagerWebhook: {
            /** @enum {string} */
            version: "4";
            /** @enum {string} */
            status: "firing" | "resolved";
            /** @enum {integer} */
            truncatedAlerts?: 0;
            receiver?: string;
            groupKey?: string;
            groupLabels?: {
                [key: string]: string;
            };
            commonLabels?: {
                [key: string]: string;
            };
            commonAnnotations?: {
                [key: string]: string;
            };
            externalURL?: string;
            alerts?: components["schemas"]["AlertmanagerWebhookAlert"][];
        };
        AlertmanagerWebhookResult: {
            resolved?: number;
            ignored?: number;
        };
        HardwareIncidentEvidence: {
            observation_key?: string;
            binding_id?: string;
            resource_id?: string;
            subject_id?: string;
            health?: string;
            health_rollup?: string;
            clock_quality?: string;
            freshness?: string;
            /** Format: int64 */
            sample_id?: number;
            recovery_count?: number;
        };
        /** @description Reported severe log or explicit failed audit operation. Operator review does not assert recovery or establish intrusion. Raw log text is omitted. */
        LogIncidentEvidence: {
            binding_id?: string;
            process?: string;
            time_quality?: string;
            lifecycle?: string;
            reviewed_by?: string;
            review_reason?: string;
            /** Format: date-time */
            event_at?: string;
            /** Format: date-time */
            received_at?: string;
            /** Format: date-time */
            window_start?: string;
            /** Format: date-time */
            reviewed_at?: string;
            /** Format: int64 */
            record_id?: number;
            /** Format: int64 */
            event_count?: number;
            /** @description Original syslog severity, null when absent. Incident severity is determined separately. */
            severity?: number | null;
            /** @description SHA-256 of source record channel ID; original source ID is not copied to incident evidence. */
            source_id_hash?: string;
            process_hash?: string;
            /** @description Explicit audit outcome. False reports a failed operation, not a proven attack. */
            audit_success?: boolean;
            /**
             * @description Closed versioned parser over a bounded message; text and captures are omitted.
             * @enum {string}
             */
            pattern_id?: "log.kernel_oom_kill" | "log.ssh_password_failure";
        };
        LogEventReview: {
            /** @enum {boolean} */
            confirmed: true;
            /** Format: int64 */
            expected_event_count: number;
            reason: string;
        };
        LogIncidentRecord: {
            /** Format: int64 */
            log_id?: number;
            binding_id?: string;
            /** Format: date-time */
            event_at?: string;
            /** @description Original syslog severity, null when absent. Incident severity is determined separately. */
            severity?: number | null;
        };
        /** @description References to an immutable comparison against the same approved baseline. No raw configuration or automatic remediation. Timestamps have estimated quality. */
        ConfigurationIncidentEvidence: {
            asset_id?: string;
            snapshot_id?: string;
            normalizer?: string;
            /** Format: int64 */
            asset_revision?: number;
            /** Format: int64 */
            baseline_revision?: number;
            /** Format: int64 */
            target_revision?: number;
            /** Format: int64 */
            result_id?: number;
            total_changes?: number;
            truncated?: boolean;
        };
        /** @description Reported peer endpoint replacement between two complete high confidence LLDP/CDP snapshots. Not proof of cable failure. No raw Neighbor payload. */
        TopologyIncidentEvidence: {
            binding_id?: string;
            local_port_hash?: string;
            before_peer_hash?: string;
            after_peer_hash?: string;
            protocol?: string;
            lifecycle?: string;
            reviewed_by?: string;
            review_reason?: string;
            /** Format: int64 */
            before_snapshot_id?: number;
            /** Format: int64 */
            after_snapshot_id?: number;
            /** Format: int64 */
            event_count?: number;
            /** Format: date-time */
            expires_at?: string;
            /** Format: date-time */
            reviewed_at?: string;
        };
        TopologyIncidentRecord: {
            binding_id?: string;
            local_port_hash?: string;
            /** Format: int64 */
            before_snapshot_id?: number;
            /** Format: int64 */
            after_snapshot_id?: number;
            /** Format: int64 */
            id?: number;
            /** Format: date-time */
            observed_at?: string;
        };
        /** @description Local mapping of model refs to stored facts. This structure is excluded from the provider request. */
        AIEvidenceReference: {
            ref?: string;
            incident_id?: string;
            signal_id?: string;
            asset_ids?: string[];
            /** Format: int64 */
            correlation_evidence_id?: number;
        };
        ReportV2Filter: {
            /** Format: date-time */
            from: string;
            /** Format: date-time */
            to: string;
            asset_id?: string;
            site_id?: string;
            /**
             * @default real
             * @enum {string}
             */
            scope: "real" | "simulated" | "all";
            /** @default 50 */
            limit: number;
        };
        ReportV2Stats: {
            /** Format: int64 */
            overlapping_cases?: number;
            /** Format: int64 */
            signal_occurrences?: number;
            /** Format: int64 */
            affected_assets?: number;
            /** Format: int64 */
            active_cases_at_end?: number;
            summed_case_seconds?: number;
        };
        ReportV2Category: {
            category?: string;
            /** Format: int64 */
            case_occurrences?: number;
            /** Format: int64 */
            signal_occurrences?: number;
        };
        ChronicProblem: {
            asset_id?: string;
            category?: string;
            scope?: string;
            simulation_collector?: string;
            /** Format: int64 */
            case_occurrences?: number;
            /** Format: int64 */
            signal_occurrences?: number;
            /** Format: int64 */
            observation_sources?: number;
            /** Format: date-time */
            first_opened_at?: string;
            /** Format: date-time */
            last_opened_at?: string;
            rule_ids?: string[];
            related_service_ids?: string[];
        };
        ReportV2Source: {
            source_kind?: string;
            source_instance_id?: string | null;
            /** Format: int64 */
            signal_occurrences?: number;
            enabled_now?: boolean | null;
            recorded_connection_status_now?: string | null;
        };
        ReportV2Summary: {
            /** @enum {string} */
            version?: "2";
            /** Format: date-time */
            generated_at?: string;
            filter?: components["schemas"]["ReportV2Filter"];
            stats?: components["schemas"]["ReportV2Stats"];
            categories?: components["schemas"]["ReportV2Category"][];
            chronic_problems?: components["schemas"]["ChronicProblem"][];
            sources?: components["schemas"]["ReportV2Source"][];
            /** Format: int64 */
            chronic_total?: number;
            /** Format: int64 */
            sources_total?: number;
            truncated?: boolean;
            /** Format: int64 */
            pending_work_items_global_now?: number;
            methodology?: string[];
        };
        ReportV2Snapshot: {
            id?: string;
            /** Format: date-time */
            created_at?: string;
            created_by?: string;
            filter?: components["schemas"]["ReportV2Filter"];
            report?: components["schemas"]["ReportV2Summary"];
        };
        ReportScheduleInput: {
            /** Format: int64 */
            expected_revision?: number;
            name: string;
            enabled?: boolean;
            /** @enum {string} */
            cadence: "daily" | "weekly";
            asset_id?: string;
            site_id?: string;
            /** @enum {string} */
            scope?: "real" | "simulated" | "all";
            /** @enum {boolean} */
            confirmed: true;
            reason: string;
        };
        ReportSchedule: {
            id?: string;
            /** Format: int64 */
            revision?: number;
            owner_id?: string;
            definition?: components["schemas"]["ReportScheduleInput"];
            /** Format: date-time */
            next_run_at?: string;
            last_snapshot_id?: string | null;
            failure?: string;
            /** Format: date-time */
            updated_at?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Alive */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Status"];
                };
            };
        };
    };
    ready: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Status"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listAgents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgentList"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDevices: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
                /** @description Maximum items */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DevicePage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDevice: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Device"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getInventory: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Protobuf Device JSON */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        identity_evidence?: components["schemas"]["CollectorIdentityEvidence"][];
                        hardware?: components["schemas"]["CollectorHardwareInventory"];
                        observation?: components["schemas"]["CollectorObservation"];
                    } & {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTelemetry: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LatestTelemetry"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMetrics: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LatestTelemetry"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getHistory: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
                /** @description Maximum items */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TelemetryPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMonitoring: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Expected monitoring intervals; changes are not delivered to Agent automatically */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonitoringSettings"];
                };
            };
            /** @description Invalid policy */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    setMonitoring: {
        parameters: {
            query?: {
                /** @description Filter by collector. Required for detail requests when the same device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path: {
                /** @description Device ID, URL-encoded; e.g. local:UUID or simulated:device-001 */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MonitoringPolicy"];
            };
        };
        responses: {
            /** @description Expected monitoring intervals; changes are not delivered to Agent automatically */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonitoringSettings"];
                };
            };
            /** @description Invalid policy */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAvailabilitySummary: {
        parameters: {
            query?: {
                /** @description Collector ID, at most 256 UTF-8 bytes. Optional for summary; required for detail requests if the device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Effective availability counts for all devices or one Agent. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailabilitySummary"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDeviceAvailability: {
        parameters: {
            query?: {
                /** @description Collector ID, at most 256 UTF-8 bytes. Optional for summary; required for detail requests if the device ID belongs to multiple agents. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description URL-encoded device ID, at most 256 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current effective availability; an existing device without valid reports returns unknown. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailabilityState"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDeviceAvailabilityHistory: {
        parameters: {
            query?: {
                /** @description Collector ID, at most 256 UTF-8 bytes. Optional for summary; required for detail requests if the device ID belongs to multiple agents. */
                agent_id?: string;
                /** @description Maximum reported transitions. */
                limit?: number;
                /** @description Number of transitions to skip, newest IDs first. */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description URL-encoded device ID, at most 256 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted reported-state changes, newest IDs first. Empty history returns items=[]. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailabilityHistoryPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device or latest telemetry not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Database temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getLogs: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                device_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read projected logs, newest inserted IDs first */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getLogSummary: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                device_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Counts for all records matching the filters; pagination is ignored */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogSummary"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAuditRecords: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                device_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read Linux audit rows; all matching record types are retained */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAuditEvents: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                device_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Correlate selected audit rows by collector, device, source, file, host and event ID; completeness remains unknown */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditEventPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getLog: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description Global projected log ID. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read one projected log and its optional audit */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogRecord"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAuditEventRecords: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                device_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description URL-encoded key returned by the audit event list. */
                key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read selected rows of one audit group; this is not a command execution audit trail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDeviceLogs: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description URL-encoded device ID. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read records of one device; ambiguous IDs require agent_id */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDeviceAudit: {
        parameters: {
            query?: {
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                agent_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                source_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                host?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                process?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                record_type?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                event_id?: string;
                /** @description Exact match, at most 256 UTF-8 bytes. device_id must resolve unambiguously; specify agent_id when needed. */
                executable?: string;
                /** @description Indexed PostgreSQL simple full-text word/phrase query. Mutually exclusive with contains. Search text contains sanitized projected fields. */
                q?: string;
                /** @description Case-insensitive literal substring. Requires both from and to with a window no longer than seven days. Mutually exclusive with q. */
                contains?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                from?: string;
                /** @description Event time in RFC3339 with timezone. from is inclusive, to exclusive; from must be earlier than to. */
                to?: string;
                /** @description Syslog severity; unknown includes absent or out-of-range values. */
                severity?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "unknown";
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                facility?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                uid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                auid?: number;
                /** @description Exact numeric match; zero is a measured value and is different from null. */
                pid?: number;
                /** @description Audit result; unknown selects audit rows with null success. An ordinary log without audit is not an unknown audit. */
                success?: "true" | "false" | "unknown";
                /** @description Read older inserted IDs. This is not an immutable snapshot under concurrent writes; new audit lines may update a group. */
                before_id?: number;
                /** @description Maximum records or audit groups in a response. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description URL-encoded device ID. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read records of one device; ambiguous IDs require agent_id */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogPage"];
                };
            };
            /** @description Invalid query parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device, log or selected audit group not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Device ID is ambiguous; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSIPTargets: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
                /** @description Maximum targets or samples returned. */
                limit?: number;
                /** @description Rows to skip. */
                offset?: number;
                /** @description Exact target identity. */
                target_id?: string;
                /** @description Exact source of the qualified latest report, or clock issue if no qualified report exists. */
                source?: string;
                /** @description Exact transport. */
                transport?: "udp" | "tcp" | "tls";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current SIP target cards; ordered by agent_id/target_id, no automatic device binding */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPTargetPage"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSIPTarget: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description URL-encoded target ID (not a device ID), at most 1024 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Qualified latest sample and last clock issue, with shared health evaluation */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPTarget"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSIPSummary: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current counts, with the same evaluator as target cards; diagnostic counts overlap the five states */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPSummary"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSIPHistory: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
                /** @description Maximum targets or samples returned. */
                limit?: number;
                /** @description Cursor from next_before_id; retain the same filters. IDs order by insertion, not observation time. */
                before_id?: number;
                /** @description Observed time in RFC3339 with timezone: from inclusive, to exclusive. Includes clock-skewed samples. */
                from?: string;
                /** @description Observed time in RFC3339 with timezone: from inclusive, to exclusive. Includes clock-skewed samples. */
                to?: string;
            };
            header?: never;
            path: {
                /** @description URL-encoded target ID (not a device ID), at most 1024 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read reported probe history, including late reports and clock errors; not a call/RTP quality history */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPHistoryPage"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSIPMonitoring: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
            };
            header?: never;
            path: {
                /** @description URL-encoded target ID (not a device ID), at most 1024 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Expected probe interval; no remote Agent change */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPMonitoring"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    setSIPMonitoring: {
        parameters: {
            query?: {
                /** @description Agent identity; required when a detail target ID belongs to multiple collectors. */
                agent_id?: string;
            };
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path: {
                /** @description URL-encoded target ID (not a device ID), at most 1024 UTF-8 bytes. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SIPIntervalInput"];
            };
        };
        responses: {
            /** @description Store expected probe cadence 3 seconds..24 hours; application in Agent remains unverified */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SIPMonitoring"];
                };
            };
            /** @description Invalid query or expected interval */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Target ID exists at multiple agents; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage temporarily unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    loginCookie: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessLoginInput"];
            };
        };
        responses: {
            /** @description Create/rotate an HttpOnly cookie session; response does not expose the session token */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessLoginResponse"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    loginBearer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessLoginInput"];
            };
        };
        responses: {
            /** @description Create an opaque Bearer session for a script/API client */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessTokenResponse"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCurrentUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current user, permissions and session-bound CSRF token */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessMe"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Revoke the current session or all current user sessions */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logoutall: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Revoke the current session or all current user sessions */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    changeOwnPassword: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessOwnPasswordInput"];
            };
        };
        responses: {
            /** @description Change password with current password verification; revokes all own sessions */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAccessUsers: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List local users; password hashes are never returned */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessUserPage"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAccessUser: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessCreateUser"];
            };
        };
        responses: {
            /** @description Create a local viewer/operator/admin */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessUser"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateAccessUser: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessPatchUser"];
            };
        };
        responses: {
            /** @description Change role/disabled; revokes target sessions, preserves at least one active admin */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessUser"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    resetAccessUserPassword: {
        parameters: {
            query?: never;
            header?: {
                /** @description Required only when authenticating with the HttpOnly cookie. Bind to the current session via login/GET /api/auth/me. */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccessPasswordInput"];
            };
        };
        responses: {
            /** @description Admin password reset, revokes all target sessions */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAccessAudit: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Local access and monitoring changes audit; not a tamper-proof compliance log */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccessAuditPage"];
                };
            };
            /** @description Invalid JSON fields or parameter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid credentials, missing/revoked/expired session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Insufficient role, invalid Origin or missing/bad CSRF */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Username conflict or last active administrator protection */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Use application/json */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Login/hash workload rate limited; Retry-After included */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Access/database unavailable or HTTPS setup required */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommands: {
        parameters: {
            query?: {
                agent_id?: string;
                device_id?: string;
                state?: "queued" | "dispatching" | "sent" | "accepted" | "running" | "success" | "failed" | "rejected" | "unsupported" | "timeout" | "expired" | "uncertain";
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Command records newest first, with current state and projected result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandPage"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCommand: {
        parameters: {
            query?: never;
            header: {
                /** @description Printable ASCII client key scoped to actor. Same key with another body is 409; generated command ID is the Agent wire key. */
                "Idempotency-Key": string;
                /** @description Required when using the HttpOnly cookie session. */
                "X-CSRF-Token"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommandRequest"];
            };
        };
        responses: {
            /** @description Idempotent replay: the same actor/key/body returns the existing command without re-dispatch */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandRecord"];
                };
            };
            /** @description Created queued command */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandRecord"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommand: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current command state; uncertain outcomes block further commands for this Agent */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandRecord"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommandEvents: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Durable state transitions, oldest first, at most 1000 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandEventPage"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommandPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Configured backend safety switches and additive protected resources */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandPolicy"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query/credential, denied policy, missing command, conflicting/busy/precondition, or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createRollback: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                /** @description Required for cookie authentication. */
                "X-CSRF-Token"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RollbackRequest"];
            };
        };
        responses: {
            /** @description Idempotent replay with no additional mutation */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandRecord"];
                };
            };
            /** @description Idempotent replay with no additional mutation */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandRecord"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCommandSnapshot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed snapshot reference with explicit unknown expiry and current backend lifecycle */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandSnapshot"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSnapshots: {
        parameters: {
            query?: {
                agent_id?: string;
                device_id?: string;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed references, not a download of Agent snapshot contents */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotPage"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid request/credential, denied policy, missing origin or unavailable/superseded/busy snapshot */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPKIBootstrapTokens: {
        parameters: {
            query?: {
                agent_id?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["PKIBootstrapToken"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createPKIBootstrapToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PKITokenRequest"];
            };
        };
        responses: {
            /** @description Single-use token */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PKIBootstrapToken"];
                };
            };
            /** @description Invalid UUID or TTL */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator or CSRF check failed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Active token limit reached */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listPKICertificates: {
        parameters: {
            query?: {
                agent_id?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["PKICertificate"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listPKIAudit: {
        parameters: {
            query?: {
                agent_id?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["PKIAudit"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revokePKIbootstraptokens: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PKIRevokeRequest"];
            };
        };
        responses: {
            /** @description Revoked */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Confirmation required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator or CSRF check failed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Credential not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Already revoked or used */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revokePKIcertificates: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PKIRevokeRequest"];
            };
        };
        responses: {
            /** @description Revoked */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Confirmation required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator or CSRF check failed */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Credential not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Already revoked or used */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PKI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapihealthrules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthRules"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapidevicesidhealth: {
        parameters: {
            query?: {
                agent_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCard"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapiincidents: {
        parameters: {
            query?: {
                agent_id?: string;
                device_id?: string;
                source?: string;
                rule_id?: string;
                state?: string;
                limit?: number;
                offset?: number;
                resource_kind?: "device" | "interface" | "sip" | "agent" | "external" | "hardware" | "log" | "configuration" | "topology";
                resource_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        limit?: number;
                        items?: components["schemas"]["Incident"][];
                        offset?: number;
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapiincidentsid: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Incident"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapiincidentsidevidence: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["IncidentEvidence"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapiincidentsidtransitions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health/incident data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["IncidentTransition"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous device ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acknowledgeIncident: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IncidentAcknowledgeRequest"];
            };
        };
        responses: {
            /** @description Acknowledged incident */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Incident"];
                };
            };
            /** @description Confirmation required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident already resolved */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapidevicesidinterfaceshealth: {
        parameters: {
            query?: {
                agent_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed component health */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCard"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Device/target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapidevicesidinterfacesinterfaceidhealth: {
        parameters: {
            query?: {
                agent_id?: string;
            };
            header?: never;
            path: {
                id: string;
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed component health */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCard"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Device/target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getapitelephonytargetsidhealth: {
        parameters: {
            query?: {
                agent_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed component health */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCard"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Device/target not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ambiguous ID; specify agent_id */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getAgentHealth: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Observed collector health */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCard"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Agent not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getReportSummary: {
        parameters: {
            query?: {
                from?: string;
                to?: string;
                agent_id?: string;
                source?: string;
                resource_kind?: string;
                top_limit?: number;
                download?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Summary or attachment JSON */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSummary"];
                };
            };
            /** @description Invalid period/filter */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage/service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listReportSnapshots: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Snapshot metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ReportSnapshot"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createReportSnapshot: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportFilter"];
            };
        };
        responses: {
            /** @description Idempotent replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSnapshot"];
                };
            };
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSnapshot"];
                };
            };
            /** @description Invalid period/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role/CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage/service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getReportSnapshot: {
        parameters: {
            query?: {
                download?: boolean;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Saved report, unchanged by later data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSnapshot"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getIncidentDiagnosticContext: {
        parameters: {
            query?: {
                window_seconds?: number;
                limit?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Context hypotheses and limitations */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiagnosticContext"];
                };
            };
            /** @description Invalid bounds */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage/service unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createAIAnalysisPreview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Reviewed frozen export, expiry10m */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIPreview"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Session/CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident missing */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Preview quota */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createAIAnalysisJob: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AIAnalysisCreate"];
            };
        };
        responses: {
            /** @description Idempotent replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIJob"];
                };
            };
            /** @description Queued */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIJob"];
                };
            };
            /** @description Invalid confirmation/hash/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role/CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Preview consumed/expired, config/key conflict or active job */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description External AI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listAIAnalyses: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Analysis jobs */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["AIJob"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getAIAnalysis: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                analysis_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description State/result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIJob"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Analysis missing */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listDataSources: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["DataSource"][];
                        offset?: number;
                        limit?: number;
                    };
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createDataSource: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DataSourceInput"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSource"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDataSource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSource"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateDataSource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DataSourceInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSource"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDataSourceStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSource"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Validation, authentication, permission, missing source, revision conflict or unavailable credential storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    testDataSource: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Operation accepted or history returned. 202 is not operation success. */
            202: {
                headers: {
                    /** @description true when this key returns the original job */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSourceJob"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    syncDataSource: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Operation accepted or history returned. 202 is not operation success. */
            202: {
                headers: {
                    /** @description true when this key returns the original job */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSourceJob"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDataSourceJobs: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Operation accepted or history returned. 202 is not operation success. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        limit?: number;
                        offset?: number;
                        items?: components["schemas"]["DataSourceJob"][];
                    };
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDataSourceJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Operation accepted or history returned. 202 is not operation success. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataSourceJob"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDataSourceJobEvents: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Operation accepted or history returned. 202 is not operation success. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["DataSourceJobEvent"][];
                    };
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid key, access denied, missing source/job, disabled/busy/unsupported source or unavailable queue */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listAssets: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                kind?: "host" | "network_device" | "system" | "bmc" | "chassis" | "component" | "unknown";
                scope?: "all" | "real" | "simulated";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        limit?: number;
                        items?: components["schemas"]["Asset"][];
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Asset"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetSources: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        limit?: number;
                        items?: components["schemas"]["AssetSourceBinding"][];
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetInventory: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        limit?: number;
                        items?: components["schemas"]["AssetSourceBinding"][];
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetFacts: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        limit?: number;
                        items?: components["schemas"]["AssetFactVersion"][];
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetIdentities: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        limit?: number;
                        items?: components["schemas"]["AssetIdentity"][];
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    mergeAssets: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetMergeInput"];
            };
        };
        responses: {
            /** @description Decision committed, replayed, or review data returned */
            200: {
                headers: {
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDecision"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    splitAsset: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetSplitInput"];
            };
        };
        responses: {
            /** @description Decision committed, replayed, or review data returned */
            200: {
                headers: {
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDecision"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetCandidates: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Decision committed, replayed, or review data returned */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        limit?: number;
                        offset?: number;
                        items?: components["schemas"]["AssetCandidate"][];
                    };
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetDecisions: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Decision committed, replayed, or review data returned */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        limit?: number;
                        offset?: number;
                        items?: components["schemas"]["AssetDecision"][];
                    };
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input, authorization, missing entity, stale revision/identity conflict or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetResolutionEvents: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Automatic resolver audit */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        offset?: number;
                        items?: components["schemas"]["AssetResolutionEvent"][];
                        limit?: number;
                    };
                };
            };
            /** @description Invalid query, access denied, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query, access denied, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query, access denied, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query, access denied, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid query, access denied, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    "getAssetsIdExternal-Metrics": {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                item_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalMetric"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetsIdSignals: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                state?: "active" | "resolved";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalSignal"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    "getData-SourcesIdMetrics": {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                item_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalMetric"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    "getData-SourcesIdMetricsHistory": {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                item_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalMetric"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSignals: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                state?: "active" | "resolved";
                source_instance_id?: string;
                asset_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalSignal"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    "getData-SourcesIdSignalsEventIdHistory": {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                state?: "active" | "resolved";
            };
            header?: never;
            path: {
                id: string;
                event_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ExternalSignalVersion"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetPrometheusInstant: {
        parameters: {
            query: {
                source_instance_id: string;
                target_id: string;
                mapping_id: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrometheusQueryResult"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetPrometheusRange: {
        parameters: {
            query: {
                source_instance_id: string;
                target_id: string;
                mapping_id: string;
                from: string;
                to: string;
                step_seconds?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrometheusQueryResult"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetPrometheusMetadata: {
        parameters: {
            query: {
                source_instance_id: string;
                target_id: string;
                mapping_id: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrometheusQueryResult"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid filter, authorization failure, missing asset or unavailable storage */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid/bounded query, changed source binding, or fixed upstream error code */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getResolvedInventory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResolvedInventory"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetPlacement: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetPlacement"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    putAssetPlacement: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlacementRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    /** @description true on replay of exact prior result */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetPlacement"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description application/json required */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetPlacementHistory: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["PlacementEvent"][];
                        limit: number;
                        offset: number;
                    };
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    importAssetPlacements: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlacementImport"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    /** @description true on replay of exact prior result */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["AssetPlacement"][];
                    };
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description application/json required */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPhysicalLocations: {
        parameters: {
            query?: {
                kind?: "site" | "building" | "room" | "rack";
                parent_id?: string;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["PhysicalLocation"][];
                        limit: number;
                        offset: number;
                    };
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createPhysicalLocation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhysicalLocationInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    /** @description true on replay of exact prior result */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhysicalLocation"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description application/json required */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getPhysicalLocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhysicalLocation"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updatePhysicalLocation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhysicalLocationInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    /** @description true on replay of exact prior result */
                    "Idempotent-Replay"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhysicalLocation"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description application/json required */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getRackLayout: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RackLayout"];
                };
            };
            /** @description Invalid query/input/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset or location not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, changed idempotent body, overlap, capacity, hierarchy, inactive asset or bounded inventory conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or inventory unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getGlobalTopology: {
        parameters: {
            query?: {
                source_instance_id?: string;
                asset_id?: string;
                scope?: "all" | "real" | "simulated";
                include_expired?: boolean;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalTopologyGraph"];
                };
            };
            /** @description Unknown/repeated/invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Inactive asset ID */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or global topology unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetNeighbors: {
        parameters: {
            query?: {
                source_instance_id?: string;
                asset_id?: string;
                scope?: "all" | "real" | "simulated";
                include_expired?: boolean;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalTopologyGraph"];
                };
            };
            /** @description Unknown/repeated/invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Inactive asset ID */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or global topology unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getGlobalTopologyChanges: {
        parameters: {
            query?: {
                source_instance_id?: string;
                asset_id?: string;
                scope?: "all" | "real" | "simulated";
                after_id?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalTopologyChanges"];
                };
            };
            /** @description Unknown/repeated/invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Inactive asset ID */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage or global topology unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetHardware: {
        parameters: {
            query?: {
                source_instance_id?: string;
                include_related?: boolean;
                max_age_seconds?: number;
                limit?: number;
                kind?: string;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetHardwarePage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetHardwareHistory: {
        parameters: {
            query?: {
                source_instance_id?: string;
                include_related?: boolean;
                max_age_seconds?: number;
                limit?: number;
                observation_key?: string;
                after_id?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetHardwareHistoryPage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetLogs: {
        parameters: {
            query?: {
                source_instance_id?: string;
                record_scope?: string;
                source?: string;
                source_id?: string;
                host?: string;
                process?: string;
                record_type?: string;
                event_id?: string;
                event_key?: string;
                executable?: string;
                q?: string;
                contains?: string;
                severity?: string;
                facility?: string;
                uid?: string;
                auid?: string;
                pid?: string;
                success?: string;
                from?: string;
                to?: string;
                limit?: number;
                before_id?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetLogPage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetLogRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetLogRecord"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetLogRaw: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetLogRaw"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getControlledLogRaw: {
        parameters: {
            query?: {
                agent_id?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetLogRaw"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetAuditEvents: {
        parameters: {
            query?: {
                source_instance_id?: string;
                record_scope?: string;
                source?: string;
                source_id?: string;
                host?: string;
                process?: string;
                record_type?: string;
                event_id?: string;
                event_key?: string;
                executable?: string;
                q?: string;
                contains?: string;
                severity?: string;
                facility?: string;
                uid?: string;
                auid?: string;
                pid?: string;
                success?: string;
                from?: string;
                to?: string;
                limit?: number;
                before_id?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetAuditPage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetVoIP: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetVoIPCard"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAssetVoIPAssociation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetVoIPInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetVoIPAssociation"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateAssetVoIPAssociation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
                association_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssetVoIPInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetVoIPAssociation"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetVoIPHistory: {
        parameters: {
            query?: {
                limit?: number;
                before_id?: number;
                from?: string;
                to?: string;
            };
            header?: never;
            path: {
                id: string;
                association_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetVoIPHistoryPage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAssetVoIPMappingEvents: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
                association_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetVoIPEventPage"];
                };
            };
            /** @description Invalid or malformed query, identity, body or key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, association or record not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Ownership, reviewed endpoint, revision, idempotency or bounded context conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Projection or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCollectorConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CollectorConfigState"];
                };
            };
            /** @description Invalid closed snapshot, query or identity */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator, live role/session, origin or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Collector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision, idempotency, opt-in or counter range conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Managed configuration disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateCollectorConfig: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CollectorConfigInput"];
            };
        };
        responses: {
            /** @description Desired revision persisted; application is asynchronous */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CollectorConfigRevision"];
                };
            };
            /** @description Invalid closed snapshot, query or identity */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator, live role/session, origin or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Collector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision, idempotency, opt-in or counter range conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Managed configuration disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCollectorConfigHistory: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CollectorConfigHistory"];
                };
            };
            /** @description Invalid closed snapshot, query or identity */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator, live role/session, origin or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Collector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision, idempotency, opt-in or counter range conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Managed configuration disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCollectorConfigEvents: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CollectorConfigEvents"];
                };
            };
            /** @description Invalid closed snapshot, query or identity */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator, live role/session, origin or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Collector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision, idempotency, opt-in or counter range conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Managed configuration disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    automationTemplates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationTemplateList"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    automationWorkers: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationWorkerList"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAutomationTarget: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationTarget"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    putAutomationTarget: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutomationTargetInput"];
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationTarget"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    assetAutomationJobs: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationJobPage"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAutomationJob: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutomationJobInput"];
            };
        };
        responses: {
            /** @description Asynchronous job accepted; inspect state and snapshot_id */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationJob"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAutomationJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationJob"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    automationJobEvents: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationEventPage"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    cancelAutomationJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Asynchronous job accepted; inspect state and snapshot_id */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationJob"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    assetAutomationSnapshots: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationSnapshotPage"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    automationSnapshotContent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationSnapshotContent"];
                };
            };
            /** @description Invalid closed request; arbitrary commands/playbooks/credentials rejected */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Permission or live session denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale target/Asset revision, active job or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation disabled, full queue, missing key, or compatible live worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationBaseline: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationBaseline"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    approveConfigurationBaseline: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationBaselineInput"];
            };
        };
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationBaseline"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationBaselineHistory: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationBaselinePage"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationDrift: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationDriftState"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationDriftHistory: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationDriftRecordPage"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    compareConfiguration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationCompareInput"];
            };
        };
        responses: {
            /** @description Successful metadata/redacted result; unknown is not current compliance and proposal does not execute an action */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationDriftRecord"];
                };
            };
            /** @description Invalid closed request or unsupported normalization */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session, confirmation or request origin denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Asset, baseline or same-Asset successful snapshot not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale revision, source/template mismatch or idempotency conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation/encryption/storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationRemediationPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current closed remediation policy */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediationPolicy"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Policy not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    putConfigurationRemediationPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationRemediationPolicyInput"];
            };
        };
        responses: {
            /** @description Policy revision stored */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediationPolicy"];
                };
            };
            /** @description Invalid closed policy */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Stale policy revision or Asset state */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationRemediations: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Remediation history */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediationPage"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    requestConfigurationRemediation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationRemediationInput"];
            };
        };
        responses: {
            /** @description Pending explicit administrator approval */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediation"];
                };
            };
            /** @description Invalid closed request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Operator or administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Policy, evidence, baseline, target or Asset changed */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Automation unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configurationRemediation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                remediation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Remediation state and verification result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediation"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Remediation not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    approveConfigurationRemediation: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                remediation_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationRemediationApprovalInput"];
            };
        };
        responses: {
            /** @description Approved action queued for a compatible live worker */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediation"];
                };
            };
            /** @description Confirmation and exact revision are required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Live administrator session required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Policy, evidence, baseline, target, identity or Asset changed */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Compatible worker unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    cancelConfigurationRemediation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                remediation_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationRemediationCancelInput"];
            };
        };
        responses: {
            /** @description Pending or queued remediation cancelled; running worker receives cancellation */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationRemediation"];
                };
            };
            /** @description Exact revision and reason are required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Requester or administrator required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description State or revision changed */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    correlationSummary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationSummary"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    correlatedIncidents: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                state?: string;
                severity?: string;
                asset_id?: string;
                service_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelatedIncidentPage"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    correlatedIncident: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationCase"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    queueCorrelationRebuild: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorrelationRebuildInput"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationRebuildResponse"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    correlationServices: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationServicePage"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCorrelationService: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorrelationServiceInput"];
            };
        };
        responses: {
            /** @description Idempotent replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationService"];
                };
            };
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationService"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    correlationService: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationService"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateCorrelationService: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorrelationServiceInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorrelationService"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Role, live session or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or ownership conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAlertmanagerReceiver: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlertmanagerReceiver"];
                };
            };
            /** @description Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    rotateAlertmanagerReceiver: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlertmanagerReceiverInput"];
            };
        };
        responses: {
            /** @description Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlertmanagerReceiver"];
                };
            };
            /** @description Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    receiveAlertmanagerResolved: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlertmanagerWebhook"];
            };
        };
        responses: {
            /** @description Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlertmanagerWebhookResult"];
                };
            };
            /** @description Response */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Response */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    reviewLogEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LogEventReview"];
            };
        };
        responses: {
            /** @description Acknowledged incident */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Incident"];
                };
            };
            /** @description Confirmation required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not a log incident, changed event count or unprocessed events. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getLogIncidentRecords: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Evidence references */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["LogIncidentRecord"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Not a log incident. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    reviewTopologyEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LogEventReview"];
            };
        };
        responses: {
            /** @description Acknowledged incident */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Incident"];
                };
            };
            /** @description Confirmation required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role or CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not a log incident, changed event count or unprocessed events. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getTopologyIncidentRecords: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Evidence references */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["TopologyIncidentRecord"][];
                        limit?: number;
                        offset?: number;
                    };
                };
            };
            /** @description Not a log incident. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createCorrelatedAnalysisPreview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Reviewed frozen export, expiry10m */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIPreview"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Session/CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Incident missing */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Preview quota */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createCorrelatedAnalysis: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AIAnalysisCreate"];
            };
        };
        responses: {
            /** @description Idempotent replay */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIJob"];
                };
            };
            /** @description Queued */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AIJob"];
                };
            };
            /** @description Invalid confirmation/hash/key */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Role/CSRF denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Preview consumed/expired, config/key conflict or active job */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description External AI disabled or storage unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listCorrelatedAnalyses: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Analysis jobs */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["AIJob"][];
                    };
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getUnifiedReportSummary: {
        parameters: {
            query?: {
                from?: string;
                to?: string;
                asset_id?: string;
                site_id?: string;
                scope?: "real" | "simulated" | "all";
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportV2Summary"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listUnifiedReportSnapshots: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ReportV2Snapshot"][];
                        /** Format: int64 */
                        limit?: number;
                        /** Format: int64 */
                        offset?: number;
                    };
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createUnifiedReportSnapshot: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportV2Filter"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportV2Snapshot"];
                };
            };
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportV2Snapshot"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getUnifiedReportSnapshot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportV2Snapshot"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listReportSchedules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: components["schemas"]["ReportSchedule"][];
                        /** Format: int64 */
                        limit?: number;
                        /** Format: int64 */
                        offset?: number;
                    };
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createReportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportScheduleInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSchedule"];
                };
            };
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSchedule"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateReportSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportScheduleInput"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSchedule"];
                };
            };
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportSchedule"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
