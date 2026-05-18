export type Question =
  | { type: 'mc'; section: string; text: string; context?: string; options: string[]; correct: number }
  | { type: 'open'; section: string; text: string; hint: string };

export const QUESTIONS: Question[] = [
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: 'The NexaCRM integration calls POST /users and receives a 201 response. What does this mean?',
    context: 'The integration just attempted to create a user account for a newly onboarded contact.',
    options: [
      'The user account already existed and was updated with the new data.',
      'The user account was created successfully — the server confirms a new resource now exists.',
      'The request was received but the account is pending activation.',
      'The server needs a follow-up GET request to confirm the creation.',
    ],
    correct: 1,
  },
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: "Laura Martínez's email changed in NexaCRM. The integration needs to update only her email in the Workspace Platform — not replace the whole user record. Which HTTP method?",
    options: [
      'POST — to send the new data to the server.',
      'PUT — to update the user record.',
      'PATCH — to modify only the email field of the existing user.',
      'GET — to fetch the record first, then update it.',
    ],
    correct: 2,
  },
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: 'The integration sends POST /users without an Authorization header. What status code does the Platform return?',
    options: [
      '400 Bad Request — a required field is missing from the request body.',
      '403 Forbidden — the user account does not have permission.',
      '401 Unauthorized — the request is missing valid authentication credentials.',
      '404 Not Found — the endpoint does not exist without authentication.',
    ],
    correct: 2,
  },
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: "The integration's access token expires after 15 minutes. It sends POST /users with an expired token and gets 401. What should the integration do next?",
    options: [
      'Ask the user to log in again with their username and password.',
      'Call POST /auth/refresh with the refresh token to get a new access token, then retry.',
      'Wait 15 minutes and retry the same request with the same token.',
      'Call POST /auth/login again with the service account credentials.',
    ],
    correct: 1,
  },
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: 'After creating a user in the Workspace Platform, the integration receives back `id: "a1b2c3..."`. What must happen next for the integration to be complete?',
    context: 'Think about what both systems need in order to stay in sync.',
    options: [
      'Call GET /users/{id} to verify the user was created correctly.',
      'Call POST /auth/logout to close the service account session.',
      "Call PATCH /contacts in NexaCRM to store the Platform's user ID in `platform_user_id`.",
      'Send a welcome email to the new user with their login credentials.',
    ],
    correct: 2,
  },
  {
    type: 'mc',
    section: 'Multiple Choice',
    text: 'The Platform API returns a 409 status code when the CRM tries to create a new user. What most likely happened?',
    options: [
      'The access token expired during the request.',
      'The request body was missing the required `role` field.',
      'A user with that email or username already exists in the system.',
      'The service account does not have admin role.',
    ],
    correct: 2,
  },
  {
    type: 'open',
    section: 'Open Questions',
    text: 'NexaCRM stores contact names like "Laura Martínez" in a `full_name` field. The Platform API only accepts usernames with letters a–z, numbers, dots, hyphens, and underscores — no spaces or accented characters. What problem does this create — and what is one question you would ask the development team before they start building?',
    hint: '1–3 sentences. Focus on the gap and what needs to be decided.',
  },
  {
    type: 'open',
    section: 'Open Questions',
    text: "During the exercise, your team reviewed your API document and decided what data should NOT be shared with the other team. Name one specific field you would exclude from the integration payload — and explain in one sentence why it should not be sent to the other system.",
    hint: '1–2 sentences.',
  },
  {
    type: 'open',
    section: 'Open Questions',
    text: 'A developer tells you: "The integration is done — I tested it and a user gets created in the Platform when a contact is added in the CRM." As a BA/PM, what is one risk or open question you would raise before approving this for go-live?',
    hint: 'Think about failure scenarios, data consistency, or security.',
  },
  {
    type: 'open',
    section: 'Open Questions',
    text: 'In your own words: what is the role of a BA/PM in an API integration project — and what is NOT their role?',
    hint: '1–2 sentences.',
  },
];

export const MC_QUESTIONS = QUESTIONS.filter((q) => q.type === 'mc');
export const OPEN_QUESTIONS = QUESTIONS.filter((q) => q.type === 'open');
