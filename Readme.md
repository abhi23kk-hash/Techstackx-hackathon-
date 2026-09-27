WorkFlowOS

AI-Powered OS-Level Workflow Automation

«Observe → Understand → Detect Repetition → Generate Workflow → User Approval → Automate → Learn»

WorkFlowOS is an AI-powered workflow automation system designed to understand how users perform repetitive digital tasks across applications and convert those repeated activities into structured, automatable workflows.

Instead of requiring users to manually design automation rules, WorkFlowOS observes normal digital work, identifies recurring patterns, understands the intent behind them, generates a workflow, and asks the user for approval before execution.

The project focuses on data transformations and data lineage rather than simple click sequences, making discovered workflows easier to understand and more resilient to changes in user interfaces.

---

🚀 Project Overview

Knowledge workers frequently perform repetitive tasks across multiple applications.

A typical workflow might look like:

Email
  ↓
Download Attachment
  ↓
CRM
  ↓
Update Customer
  ↓
Slack

Traditional automation platforms generally require users to understand the workflow and manually configure it.

WorkFlowOS takes a different approach:

User performs normal work
        ↓
Observe activity
        ↓
Understand intent
        ↓
Detect repeated workflow
        ↓
Generate workflow
        ↓
User approval
        ↓
Execute automation
        ↓
Learn from execution

The goal is simple:

«Users should know how to do their work — they should not have to know how to automate it.»

---

💡 Core Innovation

Data Transformation Based Workflow Discovery

The core idea of WorkFlowOS is that workflows are represented through data transformations rather than only mouse clicks or UI coordinates.

Every action can be represented as:

Data In → Operation → Data Out

For example:

Email
   ↓ read_email
RequestText

Email
   ↓ file_download
Attachment

CustomerRef
   ↓ crm_find
CustomerRecord

CustomerRecord + RequestText + Attachment
   ↓ form_set
CustomerRecord

RequestText
   ↓ send_slack
SlackMessage

This creates a Data Lineage Graph (DLG) that represents how information flows through the workflow.

---

🧠 Data Lineage Graph

The Data Lineage Graph is the visual centerpiece of WorkFlowOS.

Instead of displaying only:

Click → Click → Click → Click

WorkFlowOS represents:

Email
  │
  ├── read_email ───────→ RequestText
  │
  └── file_download ────→ Attachment

CustomerRef
  │
  └── crm_find ─────────→ CustomerRecord
                              │
RequestText ─────────────────┤
                              │
Attachment ───────────────────┤
                              ↓
                           form_set
                              │
                              ↓
                       Updated CustomerRecord

RequestText
  │
  └── send_slack ───────→ SlackMessage

This makes the workflow understandable to both users and developers.

---

✨ Key Features

1. Desktop Activity Observation

WorkFlowOS captures relevant application and workflow events and converts them into structured events.

Examples include:

- Reading an email
- Downloading an attachment
- Searching for a customer
- Updating a customer record
- Sending a Slack notification

---

2. Workflow Detection

The system tracks workflow runs and identifies repeated action sequences.

A workflow that occurs repeatedly can become a workflow candidate.

For example:

Run 1:
Gmail → CRM → Slack

Run 2:
Gmail → CRM → Slack

Run 3:
Gmail → CRM → Slack

After repeated occurrences, WorkFlowOS can identify the sequence as a candidate workflow.

---

3. AI Workflow Understanding

The system converts observed actions into meaningful workflow intent.

For example:

Read Email
     ↓
Update CRM
     ↓
Notify Slack

can be interpreted as:

«Process Customer Request»

This gives the workflow a human-readable name and description.

---

4. Automatic Workflow Generation

Once a repeated pattern is detected, WorkFlowOS generates a structured workflow containing:

- Trigger
- Actions
- Conditions
- Workflow steps
- Data inputs
- Data outputs
- Application integrations

---

5. Human Approval

WorkFlowOS does not automatically execute a newly discovered workflow.

The generated workflow is first presented to the user.

Workflow Detected

Process Customer Request

Trigger:
New customer request received

Steps:
1. Read email
2. Download attachment
3. Find customer
4. Update customer record
5. Notify team

[ Approve ]    [ Reject ]

The user remains in control of which workflows are automated.

---

6. Multi-Tier Automation Engine

WorkFlowOS uses the most appropriate automation mechanism available.

The priority is:

API Integration
      ↓
Application Integration
      ↓
Accessibility / Semantic UI
      ↓
Browser Automation
      ↓
Computer Vision / UI Fallback

API-based execution is preferred where available.

If an API is unavailable, the system can fall back to UI-based automation mechanisms.

---

7. Execution Monitoring

During execution, WorkFlowOS displays:

- Current workflow step
- Operation being executed
- Automation mechanism
- Running/completed state
- Execution history

For example:

✓ Step 1   Read email          API
✓ Step 2   Download attachment API
✓ Step 3   Find customer       API
◉ Step 4   Update CRM          UI
✓ Step 5   Send Slack          API

This makes the execution process visible during a demonstration.

---

🔄 Complete Demonstration Workflow

The primary demonstration is based on Customer Request Processing.

Scenario

A support or operations user repeatedly receives customer requests through email.

The user normally performs:

Gmail
 ↓
Open customer email
 ↓
Download attachment
 ↓
CRM
 ↓
Find customer
 ↓
Update customer record
 ↓
Slack
 ↓
Notify relevant team

---

Step 1 — Observe

WorkFlowOS captures the user's actions as structured events.

Example:

read_email
file_download
crm_find
form_set
send_slack

---

Step 2 — Understand

The workflow is interpreted as:

Process Customer Request

---

Step 3 — Detect Repetition

The same workflow is performed repeatedly.

WorkFlowOS identifies the repeated sequence and creates a workflow candidate.

---

Step 4 — Generate Workflow

The system generates:

Trigger:
New customer request received in Gmail

Action 1:
Read the email and identify the customer

Action 2:
Download the relevant attachment

Action 3:
Find the customer in the CRM

Action 4:
Update the customer record

Action 5:
Send a Slack notification

---

Step 5 — User Approval

The generated workflow is presented to the user.

The user can approve or reject it.

---

Step 6 — Automate

Once approved, the workflow can be executed.

The system selects the appropriate automation mechanism for each step.

---

Step 7 — Learn

Execution results and user interactions can be used to improve workflow reliability and identify additional repetitive steps.

---

🏗️ System Architecture

                    ┌───────────────────────┐
                    │       User            │
                    │   Normal Work         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Desktop Activity      │
                    │ Agent                 │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Event Normalization   │
                    │ & Data Lineage        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Workflow Discovery    │
                    │ Engine                │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ AI Workflow           │
                    │ Understanding         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Workflow Generator    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ User Approval         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Automation Engine     │
                    └───────────┬───────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                  API          UI       Browser
                    │           │           │
                    └───────────┼───────────┘
                                ▼
                         Workflow Result

---

🛠️ Technology Stack

Frontend

- React
- TypeScript
- Vite
- React Flow
- CSS

Backend / Agent

- Python
- WebSocket communication
- Workflow detection
- Data lineage processing
- Automation engine

AI

- Gemini / AI integration
- AI-assisted workflow understanding
- Automated workflow naming and description

Visualization

- React Flow
- Data Lineage Graph
- Workflow execution visualization
- Real-time workflow state

Communication

- WebSockets
- Event-based communication between the applications and automation agent

External Services / Infrastructure

- Firebase where configured
- Gemini API where configured

---

📁 Project Structure

Techstackx-hackathon-/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── server/
│   └── ...
│
├── public/
│
├── package.json
├── vite.config.*
├── tsconfig.*
├── README.md
└── ...

«The exact structure may vary with the current repository implementation. Refer to the source tree for the latest file organization.»

---

⚙️ Installation

Prerequisites

Install:

- Node.js
- npm
- Python 3.11+
- Git

Clone the repository:

git clone https://github.com/abhi23kk-hash/Techstackx-hackathon-.git

Enter the project:

cd Techstackx-hackathon-

Install frontend dependencies:

npm install

---

🔐 Environment Configuration

Create the required environment configuration according to the variables used by the project.

For example:

GEMINI_API_KEY=your_gemini_api_key

If Firebase is configured for the project, provide the corresponding Firebase configuration values required by the application.

Do not commit API keys or private credentials to GitHub.

---

▶️ Running the Project

Start the development application using the project's configured npm script:

npm run dev

If the backend/agent server is required separately, start it using the server instructions provided in the project source.

The application can then be opened in the development URL displayed by Vite.

---

🎬 Demo Flow

For the hackathon demonstration:

1. Start WorkFlowOS

Open the dashboard and connect the workflow environment.

2. Perform the customer-request workflow

Perform:

Gmail
 ↓
Read customer request
 ↓
Download attachment
 ↓
CRM
 ↓
Find customer
 ↓
Update customer
 ↓
Slack
 ↓
Send notification

3. Repeat the workflow

Perform the same workflow multiple times.

4. Workflow Detection

The system identifies the repeated sequence.

5. Workflow Generation

WorkFlowOS generates:

Process Customer Request

6. User Approval

Approve the generated workflow.

7. Execute

Run the approved workflow.

8. Observe Execution

Watch each step execute and observe the selected automation mechanism.

---

🎯 Why WorkFlowOS?

Traditional automation:

User
 ↓
Understand automation
 ↓
Manually configure workflow
 ↓
Test workflow
 ↓
Run automation

WorkFlowOS:

User works normally
 ↓
WorkFlowOS observes
 ↓
AI understands
 ↓
Repeated workflow detected
 ↓
Workflow generated
 ↓
User approves
 ↓
Automation executes

The key difference is that workflow discovery starts from the user's existing work instead of requiring the user to manually design the automation first.

---

🔒 Human-in-the-Loop

WorkFlowOS keeps the user involved before a newly discovered workflow is automated.

Observe
   ↓
Understand
   ↓
Detect
   ↓
Generate
   ↓
👤 User Approval
   ↓
Automate

This helps prevent an automatically discovered workflow from being executed without user confirmation.

---

📊 Example Generated Workflow

Workflow:
Process Customer Request

Trigger:
New customer request received in Gmail

1. Read email
       ↓
2. Download attachment
       ↓
3. Find customer in CRM
       ↓
4. Update customer record
       ↓
5. Notify team in Slack

Condition:
If the customer cannot be found,
stop the workflow and request
user intervention.

---

🚀 Future Scope

Potential extensions include:

- Support for additional desktop applications
- More browser integrations
- More enterprise APIs
- Advanced workflow similarity detection
- Improved AI intent understanding
- Persistent workflow history
- Workflow editing before approval
- More sophisticated error recovery
- Additional OS-level automation mechanisms
- Improved learning from successful and failed executions
- Enterprise workflow monitoring

---

🧪 Project Evaluation Alignment

Evaluation Criterion| WorkFlowOS
Functionality| Workflow observation, detection, generation and execution
Technical Implementation| React, Python, WebSockets, workflow engine and data lineage
Logic & Problem Solving| Repeated workflow detection and data transformation modeling
AI & Tools Integration| AI-assisted workflow understanding and naming
Demo Quality| Interactive workflow discovery and execution dashboard
Problem Relevance| Automates repetitive cross-application digital work
Innovation| Data-lineage-driven workflow discovery

---

📹 Demo Video

The demonstration should show:

1. Working application output
2. User performing the workflow
3. Workflow detection
4. Data Lineage Graph
5. Generated workflow
6. User approval
7. Workflow execution
8. API/UI automation mechanism
9. Final execution result

---

📦 Submission Deliverables

The hackathon submission includes:

- Complete source code
- Configuration files
- Required assets
- "README.md"
- Demo video
- Resume

---

🔗 Repository

GitHub:
https://github.com/abhi23kk-hash/Techstackx-hackathon-

---

👨‍💻 Project

WorkFlowOS
AI-Powered OS-Level Workflow Automation

Built as a hackathon project focused on intelligent workflow discovery, data lineage, AI-assisted automation and cross-application task execution.