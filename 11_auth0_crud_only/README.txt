AUTH0-ONLY CRUD APP

This is a separate Express + Auth0-protected CRUD application.
It uses Auth0 for authentication and an in-memory array for CRUD data.
It does not connect to MongoDB, Firebase, Dropbox, or another authentication provider.

Read installation_steps.txt before running. Auth0 credentials must be supplied in .env.
The in-memory records reset when the server restarts; this is intended as a lab demonstration.
