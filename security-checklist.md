# Landmarks Security Checklist

## Authentication

* Never expose service role keys in the client app.
* Only use EXPO_PUBLIC variables for public values.
* Verify users before performing sensitive actions.
* Use Supabase Auth as the source of identity.

## Row Level Security (RLS)

* RLS enabled on all tables.
* RLS enabled on all storage buckets.
* Public read policies only where intentionally required.
* Insert, update, and delete policies restricted appropriately.

## Storage

* Prevent users from modifying files belonging to other users.
* Validate file ownership before updates.
* Restrict file types where possible.
* Limit upload size.

## Input Validation

* Validate all user inputs.
* Trim strings before saving.
* Enforce length limits.
* Reject malformed values.

## Environment Variables

* Never commit secrets.
* Never expose service_role keys.
* Keep production keys outside source control.
* Verify .gitignore covers local environment files.

## API Security

* Rate limit expensive endpoints.
* Validate request payloads.
* Verify authentication before mutations.
* Log failed requests.

## Database

* Avoid duplicate sources of truth.
* Use foreign keys.
* Use indexes on frequently queried columns.
* Review migrations before deployment.

## Mobile Security

* Do not store secrets in AsyncStorage.
* Use SecureStore for sensitive tokens.
* Minimize permissions requested from users.
* Validate device-side inputs.

## Release Checklist

* Review RLS policies.
* Review storage policies.
* Verify environment variables.
* Remove debug logging.
* Verify authentication flows.
* Test unauthorized access attempts.

## OWASP Quick Check

* Broken Access Control
* Cryptographic Failures
* Injection
* Insecure Design
* Security Misconfiguration
* Vulnerable Components
* Authentication Failures
* Data Integrity Failures
* Logging Failures
* SSRF
