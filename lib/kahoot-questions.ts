export type KahootQuestion = {
  type: 'spot-error' | 'fix-story' | 'whats-missing' | 'what-happens-next';
  label: string; // shown as category tag on host screen
  prompt: string; // question or scenario text (shown on host screen)
  context?: string; // code block / story snippet (shown on host screen)
  options: [string, string, string, string]; // always 4
  correct: number; // 0-indexed
  explanation: string; // shown after reveal
};

export const KAHOOT_QUESTIONS: KahootQuestion[] = [
  // ── Spot the Error ────────────────────────────────────────────────────────
  {
    type: 'spot-error',
    label: '🔍 Spot the Error',
    prompt: 'A dev says: "I created a new user — the API returned 200 OK, so everything worked." What is wrong?',
    options: [
      'Nothing — 200 OK means success',
      'Should be 201 Created for a new resource',
      'Should be 204 No Content',
      'Should be 202 Accepted',
    ],
    correct: 1,
    explanation: '201 Created is the correct status for POST requests that create a new resource. 200 OK means the request succeeded but typically returns existing data, not a newly created resource.',
  },
  {
    type: 'spot-error',
    label: '🔍 Spot the Error',
    prompt: 'Review this story acceptance criterion. What is the error?',
    context: 'AC: "When IT provisions a new employee in Workspace Platform,\nthe system sends a POST /contacts to NexaCRM\nto update the contact record."',
    options: [
      'POST should be PUT',
      'POST creates new records — use PATCH to update an existing contact',
      'The endpoint should be /users not /contacts',
      'The story should use GET not POST',
    ],
    correct: 1,
    explanation: 'POST creates new resources. To update an existing CRM contact, the correct method is PATCH /contacts/{id}. Using POST would try to create a duplicate contact.',
  },
  {
    type: 'spot-error',
    label: '🔍 Spot the Error',
    prompt: 'The story says: "User gets a 401 because they don\'t have permission to view that report." What is wrong?',
    options: [
      'Nothing — 401 means no permission',
      '401 means unauthenticated (not logged in); missing permission is 403 Forbidden',
      '401 means the server crashed',
      '401 means the resource was not found',
    ],
    correct: 1,
    explanation: '401 Unauthorized = not authenticated (no valid token). 403 Forbidden = authenticated but not allowed. The story describes an authorization problem, which is 403.',
  },
  {
    type: 'spot-error',
    label: '🔍 Spot the Error',
    prompt: 'A developer committed this to GitHub. What is the critical security mistake?',
    context: 'config.js\n\nconst API_KEY = "nexacrm_sk_live_7f3a9e2b1c8d4f5a6e0b";\nconst DB_PASS = "Admin123!";\n\nmodule.exports = { API_KEY, DB_PASS };',
    options: [
      'The variable names are wrong',
      'Secrets (API keys, passwords) must never be committed to source control',
      'JavaScript config files should be TypeScript',
      'The module.exports syntax is outdated',
    ],
    correct: 1,
    explanation: 'Credentials committed to git are immediately at risk — git history is permanent even after deletion. Secrets must live in environment variables (.env files, never committed). This is OWASP Top 10 #2: Cryptographic Failures.',
  },

  // ── Fix the Story ─────────────────────────────────────────────────────────
  {
    type: 'fix-story',
    label: '✏️ Fix the Story',
    prompt: 'What is missing from this user story?',
    context: 'As IT staff, I want to provision a new employee in Workspace Platform\nso that they can log in on day one.\n\nAC:\n- Employee record is created in Workspace Platform\n- Employee receives welcome email',
    options: [
      'The story needs a priority label',
      'Missing failure scenario: what happens if the API call fails?',
      'The story should mention the database',
      'AC should include the UI button color',
    ],
    correct: 1,
    explanation: 'Good acceptance criteria must cover the unhappy path. If the Workspace Platform API returns 500 or times out, the story must define the expected behavior (retry, alert, rollback).',
  },
  {
    type: 'fix-story',
    label: '✏️ Fix the Story',
    prompt: 'This AC is vague. Which rewrite makes it testable?',
    context: 'AC: "The integration should work quickly and handle errors properly."',
    options: [
      '"The integration should be fast and reliable"',
      '"API calls complete within 3 seconds; on 5xx errors the system retries once and alerts the admin"',
      '"The integration works without bugs"',
      '"Errors are displayed to the user"',
    ],
    correct: 1,
    explanation: 'Testable ACs need specific, measurable conditions. "Quickly" and "properly" can\'t be tested. "Within 3 seconds" and "retries once" can be verified with an automated test.',
  },
  {
    type: 'fix-story',
    label: '✏️ Fix the Story',
    prompt: 'An analyst wrote this flow. What API step is completely missing?',
    context: 'Integration Flow:\n1. IT creates employee in Workspace Platform → POST /users (201)\n2. System reads employee ID from response\n3. ✅ Done — employee is now in both systems',
    options: [
      'Step 3 should be a DELETE',
      'Missing: write the Workspace Platform user ID back to NexaCRM contact (PATCH /contacts/{id})',
      'Step 1 should use PUT not POST',
      'The flow needs a GET step to verify',
    ],
    correct: 1,
    explanation: 'Without writing the platform_user_id back to NexaCRM, the two systems are not linked. Future syncs can\'t find the matching record. The write-back PATCH is the critical missing step.',
  },

  // ── What's Missing? ───────────────────────────────────────────────────────
  {
    type: 'whats-missing',
    label: '❓ What\'s Missing?',
    prompt: 'A batch job runs every night to sync 500 employees. On day 3 it fails silently — no errors logged, no alerts. What practice is missing?',
    options: [
      'The job needs more RAM',
      'Error handling and observability: failed calls must be logged and alerted',
      'The batch should run weekly instead',
      'The API needs a faster endpoint',
    ],
    correct: 1,
    explanation: 'Silent failures are the most dangerous kind. Every integration must log errors, count failures, and alert when a threshold is exceeded. "No news is good news" is not a monitoring strategy.',
  },
  {
    type: 'whats-missing',
    label: '❓ What\'s Missing?',
    prompt: 'The Workspace Platform API uses JWT tokens that expire after 1 hour. A batch job runs for 90 minutes. What is missing from the implementation plan?',
    options: [
      'A bigger server',
      'Token refresh logic: detect 401 mid-batch and request a new token',
      'Run the batch in 60-minute windows only',
      'Use a different API',
    ],
    correct: 1,
    explanation: 'Long-running jobs must handle token expiry. The correct pattern: catch 401 responses, refresh the token, retry the failed request. Without this the job will fail partway through and leave data in an inconsistent state.',
  },
  {
    type: 'whats-missing',
    label: '❓ What\'s Missing?',
    prompt: 'Review this data mapping table. What column is dangerously absent?',
    context: 'NexaCRM Field → Workspace Platform Field\nfull_name → display_name\nemail → email\ncontact_type → role\njob_title → title',
    options: [
      'A "Format" column to describe data types',
      'A "Sensitive?" column — some fields may contain PII or secrets that shouldn\'t be shared',
      'A "Required" column',
      'A "Notes" column for free text',
    ],
    correct: 1,
    explanation: 'Data mapping must flag sensitive fields (PII, financial data, internal scores). Sharing sensitive data unintentionally between systems is a compliance and privacy risk. The mapping table must make sensitivity explicit before the integration is built.',
  },

  // ── What Happens Next? ────────────────────────────────────────────────────
  {
    type: 'what-happens-next',
    label: '⚡ What Happens Next?',
    prompt: 'Your integration POSTs a new employee to Workspace Platform. The API returns 409 Conflict. What should happen next?',
    options: [
      'Retry immediately with the same data',
      'Check if the user already exists (GET /users?email=...) then decide: update or skip',
      'Delete the existing user and recreate',
      'Log the error and crash the job',
    ],
    correct: 1,
    explanation: '409 Conflict means the resource already exists. The correct response is to look up the existing record and decide: does it need updating (PATCH) or is it already correct (skip)? Blind retries will keep getting 409.',
  },
  {
    type: 'what-happens-next',
    label: '⚡ What Happens Next?',
    prompt: 'An offboarding flow DELETEs an employee from Workspace Platform. What must happen next that the story is missing?',
    options: [
      'Send a farewell email automatically',
      'Update or archive the NexaCRM contact so both systems stay consistent',
      'Create a backup of the deleted user',
      'Notify the employee\'s manager via the API',
    ],
    correct: 1,
    explanation: 'Deleting from one system without updating the other leaves orphaned data. If the CRM contact still points to a deleted platform_user_id, future API calls will fail. Every destructive action needs a corresponding update in linked systems.',
  },
];
