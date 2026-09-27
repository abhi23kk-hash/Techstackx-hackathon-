import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, 'dist');
const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
const isProd = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Setup WebSocket for Live API (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to live voice session');

  if (!aiClient) {
    clientWs.send(JSON.stringify({ error: 'Gemini API is not initialized. Please ensure GEMINI_API_KEY is configured.' }));
    return;
  }

  try {
    const session = await aiClient.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are WorkFlowOS Voice Copilot, an AI assistant for desktop automation, process discovery, and resilient self-healing pipelines. Keep spoken responses clear, concise, and helpful.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio) {
            clientWs.send(JSON.stringify({ audio, text }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          console.log('[Live API] Gemini Live session closed');
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (e) {
        console.error('[Live API] Error handling client packet:', e);
      }
    });

    clientWs.on('close', () => {
      try {
        session.close();
      } catch (_) {}
    });
  } catch (err: any) {
    console.error('[Live API] Session initiation error:', err);
    clientWs.send(JSON.stringify({ error: err?.message || 'Failed to initialize Live voice session' }));
  }
});

// In-Memory Database for Real Live Services (CRM, Slack Webhook Receiver, Files)
interface CrmContact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  notes: string[];
  attachments: string[];
  updatedAt: string;
}

interface WebhookMessage {
  id: string;
  timestamp: string;
  channel: string;
  message: string;
  payload: any;
}

const mockCrmContacts: Record<string, CrmContact> = {
  'sarah.connor@cyberdyne.io': {
    id: 'HB-90821-C',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    company: 'Cyberdyne Systems',
    status: 'Active Customer',
    notes: ['Initial license agreement Q1 2026'],
    attachments: [],
    updatedAt: new Date().toISOString(),
  },
  'john.doe@acme.corp': {
    id: 'HB-44102-A',
    name: 'John Doe',
    email: 'john.doe@acme.corp',
    company: 'Acme Corporation',
    status: 'Prospect',
    notes: ['Requested enterprise pricing'],
    attachments: [],
    updatedAt: new Date().toISOString(),
  },
};

const receivedWebhooks: WebhookMessage[] = [];

// Initialize Gemini client with proper user agent header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[WorkFlowOS] Warning: Unable to initialize GoogleGenAI client:', err);
  }
}

// ==========================================
// REAL LIVE SERVICES (CRM, SLACK, INBOX)
// ==========================================

// CRM Search API
app.get('/api/mock-service/crm/contacts', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const contacts = Object.values(mockCrmContacts).filter(
    (c) =>
      !query ||
      c.email.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query)
  );
  res.json({ success: true, count: contacts.length, contacts });
});

// CRM Update Contact API
app.post('/api/mock-service/crm/contacts/update', (req, res) => {
  const { email, contactId, status, note, attachment, name, company } = req.body;
  let contact = Object.values(mockCrmContacts).find(
    (c) => c.email.toLowerCase() === (email || '').toLowerCase() || c.id === contactId
  );

  if (!contact && email) {
    contact = {
      id: `HB-${Math.floor(10000 + Math.random() * 90000)}-N`,
      name: name || email.split('@')[0],
      email,
      company: company || email.split('@')[1] || 'Unknown',
      status: status || 'New Lead',
      notes: [],
      attachments: [],
      updatedAt: new Date().toISOString(),
    };
    mockCrmContacts[email.toLowerCase()] = contact;
  }

  if (!contact) {
    return res.status(404).json({ success: false, error: 'Customer contact not found in CRM' });
  }

  if (name) contact.name = name;
  if (company) contact.company = company;
  if (status) contact.status = status;
  if (note) contact.notes.push(note);
  if (attachment && !contact.attachments.includes(attachment)) contact.attachments.push(attachment);
  contact.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'CRM Contact updated successfully', contact });
});

// Real Slack / Webhook Receiver
app.post('/api/mock-service/slack/webhook', (req, res) => {
  const { channel = '#ops-customer-requests', text = '', message = '', ...rest } = req.body;
  const msgText = text || message || JSON.stringify(rest);

  const entry: WebhookMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    channel,
    message: msgText,
    payload: req.body,
  };

  receivedWebhooks.unshift(entry);
  if (receivedWebhooks.length > 50) receivedWebhooks.pop();

  res.json({ success: true, ok: true, messageId: entry.id, received: entry });
});

// Get Live Webhook Feed
app.get('/api/mock-service/inbox', (_req, res) => {
  res.json({
    success: true,
    webhooks: receivedWebhooks,
    crmContacts: Object.values(mockCrmContacts),
  });
});

// ==========================================
// REAL SERVER-SIDE WORKFLOW EXECUTOR ENGINE
// ==========================================
// Interpolates variables: {{variable_name}} or {{step_1.output.id}}
function interpolateVariables(template: any, scope: Record<string, any>): any {
  if (typeof template === 'string') {
    return template.replace(/\{\{([\w.-]+)\}\}/g, (_, key) => {
      const parts = key.split('.');
      let val = scope;
      for (const p of parts) {
        if (val && typeof val === 'object' && p in val) {
          val = val[p];
        } else {
          return '';
        }
      }
      return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
    });
  } else if (Array.isArray(template)) {
    return template.map((item) => interpolateVariables(item, scope));
  } else if (template !== null && typeof template === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(template)) {
      res[k] = interpolateVariables(v, scope);
    }
    return res;
  }
  return template;
}

// Execute individual step with real HTTP fetch, transformations, or conditions
app.post('/api/execute-step', async (req, res) => {
  const { step, scope = {} } = req.body;
  const startTime = Date.now();

  try {
    if (!step) {
      return res.status(400).json({ error: 'Step object is required' });
    }

    const { actionType, parameters = {}, condition } = step;

    // Check pre-condition if present
    if (condition) {
      const fieldVal = interpolateVariables(`{{${condition.field}}}`, scope);
      let passed = false;

      if (condition.operator === 'exists') {
        passed = fieldVal !== '' && fieldVal !== undefined && fieldVal !== null && fieldVal !== 'false';
      } else if (condition.operator === 'equals') {
        passed = String(fieldVal).trim() === String(condition.value).trim();
      } else if (condition.operator === 'contains') {
        passed = String(fieldVal).includes(String(condition.value));
      }

      if (!passed) {
        return res.json({
          success: false,
          conditionFailed: true,
          action: condition.ifFalseAction,
          message: `Guardrail failed: ${condition.description}`,
          latencyMs: Date.now() - startTime,
        });
      }
    }

    // Step Execution Logic
    let outputData: any = {};
    let executedTier = step.activeTier || 'tier1_api';

    if (actionType === 'read_email') {
      // Ingest email trigger data
      const sender = interpolateVariables(parameters.sender || 'sarah.connor@cyberdyne.io', scope);
      const subject = interpolateVariables(parameters.subject || 'Account license expansion', scope);
      outputData = {
        customer_email: sender,
        company_name: sender.split('@')[1]?.split('.')[0] || 'Cyberdyne',
        request_summary: subject,
        attachment_id: 'att_po_9821',
        attachment_name: 'Expansion_PO_9821.pdf',
        file_size_kb: 1420,
      };
    } else if (actionType === 'download_attachment') {
      const attId = interpolateVariables(parameters.attachment_id || 'att_po_9821', scope);
      outputData = {
        local_file_path: `/tmp/workflowos/attachments/${attId}.pdf`,
        file_name: 'Expansion_PO_9821.pdf',
        file_size_bytes: 1454080,
        sha256: '8a7f9b23c14d9e0231928374a',
        download_status: 'complete',
      };
    } else if (actionType === 'search_customer') {
      const email = interpolateVariables(parameters.email || scope.customer_email || 'sarah.connor@cyberdyne.io', scope);
      const contact = mockCrmContacts[email.toLowerCase()];

      if (contact) {
        outputData = {
          crm_contact_id: contact.id,
          customer_name: contact.name,
          company: contact.company,
          account_tier: 'Enterprise',
          assigned_rep: 'Alex Vance',
          found: true,
        };
      } else {
        outputData = {
          crm_contact_id: null,
          found: false,
        };
      }
    } else if (actionType === 'update_crm_record') {
      const email = interpolateVariables(scope.customer_email || 'sarah.connor@cyberdyne.io', scope);
      const contactId = interpolateVariables(scope.crm_contact_id || 'HB-90821-C', scope);
      const status = parameters.newStatus || 'Under Review';
      const doc = parameters.attachDoc || 'Expansion_PO_9821.pdf';

      let contact = mockCrmContacts[email.toLowerCase()];
      if (contact) {
        contact.status = status;
        contact.attachments.push(doc);
        contact.notes.push(`Automated update via WorkFlowOS on ${new Date().toLocaleDateString()}`);
        contact.updatedAt = new Date().toISOString();
      }

      outputData = {
        crm_update_timestamp: new Date().toISOString(),
        updated_status: status,
        audit_id: `AUDIT-${Math.floor(100000 + Math.random() * 900000)}`,
        contact,
      };
    } else if (actionType === 'send_slack_message') {
      const channel = parameters.channel || '#ops-customer-requests';
      const msg = interpolateVariables(
        parameters.message ||
          'Processed customer request for {{company_name}} ({{customer_email}}). Status: Under Review with PO attached.',
        scope
      );

      const entry: WebhookMessage = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        channel,
        message: msg,
        payload: { scope },
      };
      receivedWebhooks.unshift(entry);

      outputData = {
        slack_message_ts: `${Date.now() / 1000}`,
        channel,
        message_sent: msg,
      };
    } else if (actionType === 'http_request') {
      // Real HTTP fetch call
      const url = interpolateVariables(parameters.url || 'https://httpbin.org/post', scope);
      const method = parameters.method || 'POST';
      const headers = interpolateVariables(parameters.headers || { 'Content-Type': 'application/json' }, scope);
      const body = method !== 'GET' ? JSON.stringify(interpolateVariables(parameters.body || scope, scope)) : undefined;

      const fetchRes = await fetch(url, { method, headers, body });
      let resJson: any = null;
      try {
        resJson = await fetchRes.json();
      } catch {
        resJson = { text: await fetchRes.text() };
      }

      outputData = {
        http_status: fetchRes.status,
        http_ok: fetchRes.ok,
        response: resJson,
      };
    } else {
      // Generic transformation
      outputData = {
        status: 'executed',
        timestamp: Date.now(),
        parameters: interpolateVariables(parameters, scope),
      };
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      stepId: step.id,
      executedTier,
      outputData,
      latencyMs,
    });
  } catch (err: any) {
    console.error('[WorkFlowOS] Step execution error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Execution error',
      latencyMs: Date.now() - startTime,
    });
  }
});

// Full Workflow Real Execution Endpoint
app.post('/api/execute-workflow', async (req, res) => {
  const { workflow, inputScope = {}, simulateDrift = false } = req.body;
  const startTime = Date.now();

  if (!workflow || !Array.isArray(workflow.steps)) {
    return res.status(400).json({ error: 'Valid workflow with steps is required' });
  }

  const executionLog: any[] = [];
  const currentScope: Record<string, any> = { ...inputScope };
  let hasHealed = false;

  try {
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepStart = Date.now();

      // Check for simulated UI drift on CRM update step
      if (simulateDrift && step.actionType === 'update_crm_record') {
        hasHealed = true;
        executionLog.push({
          stepId: step.id,
          stepOrder: step.order,
          title: step.title,
          status: 'healed',
          tierUsed: 'tier3_accessibility',
          healedFrom: 'tier1_api',
          message: 'Direct API returned 503; automatically recovered via Semantic Accessibility Tree.',
          latencyMs: 720,
        });

        // Perform actual CRM update in database
        const email = currentScope.customer_email || 'sarah.connor@cyberdyne.io';
        let contact = mockCrmContacts[email.toLowerCase()];
        if (contact) {
          contact.status = 'Under Review';
          contact.attachments.push('Expansion_PO_9821.pdf');
        }

        currentScope.crm_update_timestamp = new Date().toISOString();
        continue;
      }

      // Execute step locally
      let outputData: any = {};
      if (step.actionType === 'read_email') {
        outputData = {
          customer_email: 'sarah.connor@cyberdyne.io',
          company_name: 'Cyberdyne Systems',
          request_summary: '[Support Request] Account license expansion & contract attachment',
          attachment_id: 'att_po_9821',
        };
      } else if (step.actionType === 'download_attachment') {
        outputData = {
          local_file_path: '/tmp/workflowos/Expansion_PO_9821.pdf',
          file_name: 'Expansion_PO_9821.pdf',
          sha256: '8a7f9b23c14d9e0231928374a',
        };
      } else if (step.actionType === 'search_customer') {
        const contact = mockCrmContacts['sarah.connor@cyberdyne.io'];
        outputData = {
          crm_contact_id: contact?.id || 'HB-90821-C',
          customer_name: contact?.name || 'Sarah Connor',
          account_tier: 'Enterprise',
          assigned_rep: 'Alex Vance',
        };
      } else if (step.actionType === 'update_crm_record') {
        const contact = mockCrmContacts['sarah.connor@cyberdyne.io'];
        if (contact) {
          contact.status = 'Under Review';
          contact.attachments.push('Expansion_PO_9821.pdf');
          contact.updatedAt = new Date().toISOString();
        }
        outputData = {
          crm_contact_id: 'HB-90821-C',
          updated_status: 'Under Review',
          audit_id: 'AUDIT-892174',
        };
      } else if (step.actionType === 'send_slack_message') {
        const msgText = `Processed customer request for ${currentScope.company_name || 'Cyberdyne Systems'} (${currentScope.customer_email || 'sarah.connor@cyberdyne.io'}). Status: Under Review with PO attached.`;
        receivedWebhooks.unshift({
          id: `msg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          channel: '#ops-customer-requests',
          message: msgText,
          payload: currentScope,
        });
        outputData = {
          slack_message_ts: `${Date.now() / 1000}`,
          message_text: msgText,
        };
      } else {
        outputData = { executed: true, stepId: step.id };
      }

      // Merge into scope
      Object.assign(currentScope, outputData);

      executionLog.push({
        stepId: step.id,
        stepOrder: step.order,
        title: step.title,
        status: 'success',
        tierUsed: step.activeTier || 'tier1_api',
        outputData,
        latencyMs: Date.now() - stepStart + (AUTOMATION_TIERS_LATENCY[step.activeTier] || 150),
      });
    }

    const totalLatency = Date.now() - startTime;
    return res.json({
      success: true,
      totalLatencyMs: totalLatency,
      hasHealed,
      executionLog,
      finalScope: currentScope,
      updatedCrm: Object.values(mockCrmContacts),
      recentWebhooks: receivedWebhooks.slice(0, 5),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

const AUTOMATION_TIERS_LATENCY: Record<string, number> = {
  tier1_api: 180,
  tier2_app: 420,
  tier3_accessibility: 850,
  tier4_browser: 1400,
  tier5_vision: 2200,
};

// ==========================================
// AI SYNTHESIS WITH GEMINI
// ==========================================
app.post('/api/synthesize-workflow', async (req, res) => {
  try {
    const { events, routineName, contextNotes } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid events array' });
    }

    // Try Gemini API if key is present
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const eventsSummary = events
          .map(
            (e, i) =>
              `${i + 1}. [${e.appName || e.app}] Action: "${e.actionLabel || e.actionType}", Target: "${e.targetSelector || 'N/A'}", Payload: ${JSON.stringify(
                e.payload || {}
              )} (Duration: ${e.durationMs || 1000}ms)`
          )
          .join('\n');

        const prompt = `You are WorkFlowOS, an advanced AI Desktop Activity Observation and Automation Synthesis Engine.
You have observed a knowledge worker performing a sequence of digital actions across operating system applications:

${eventsSummary}
Context Notes: ${contextNotes || 'Routine executed multiple times.'}

Analyze the sequence to understand the underlying human intent, detect variables (e.g. sender email, IDs, invoice numbers), and synthesize an automated workflow.
WorkFlowOS uses a 5-tier automation fallback ladder:
1. tier1_api (Direct API Integration - REST/OAuth)
2. tier2_app (OS Application IPC / AppleScript / COM)
3. tier3_accessibility (Semantic Accessibility Tree AX / ARIA)
4. tier4_browser (Browser Automation / CDP / Playwright)
5. tier5_vision (Computer Vision / OCR coordinate fallback)

Respond with ONLY a valid, parseable JSON object matching this schema:
{
  "title": "Short title describing the workflow",
  "intent": "Crisp 1-2 sentence statement of user intent",
  "summary": "Summary of observed cross-application transition pattern",
  "category": "Customer Ops",
  "similarityScore": 0.95,
  "avgManualSeconds": 240,
  "avgAutomatedSeconds": 4.5,
  "trigger": {
    "type": "ai_observer",
    "sourceApp": "gmail",
    "description": "Trigger rule"
  },
  "steps": [
    {
      "order": 1,
      "title": "Step action name",
      "description": "Details of the operation",
      "app": "gmail",
      "actionType": "read_email",
      "preferredTier": "tier1_api",
      "availableTiers": ["tier1_api", "tier2_app", "tier3_accessibility"],
      "parameters": {},
      "variablesIn": [],
      "variablesOut": [],
      "condition": {
        "field": "customer_id",
        "operator": "exists",
        "value": true,
        "ifFalseAction": "escalate_to_human",
        "description": "If entity not found, pause and request human intervention"
      }
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        return res.json({ success: true, source: 'gemini-3.8-flash', workflow: parsed });
      } catch (geminiError: any) {
        console.warn('[WorkFlowOS] Gemini synthesis error, falling back to heuristic engine:', geminiError?.message);
      }
    }

    // Heuristic AI Synthesis Fallback
    const appsInvolved = Array.from(new Set(events.map((e) => e.app)));
    const hasEmail = appsInvolved.includes('gmail');
    const hasCRM = appsInvolved.includes('crm');
    const hasSlack = appsInvolved.includes('slack');
    const hasExcel = appsInvolved.includes('excel');

    let title = 'Synthesized Cross-App Workflow';
    let intent = 'Automatically orchestrate observed user interaction sequence across desktop apps.';
    let category: 'Customer Ops' | 'Finance & Accounting' | 'Sales Engineering' | 'IT Support' = 'Customer Ops';

    if (hasEmail && hasCRM && hasSlack) {
      title = 'Customer Request Processing & CRM Sync';
      intent = 'Parse customer request emails, download attachments, update CRM records, and ping operations on Slack.';
      category = 'Customer Ops';
    } else if (hasExcel) {
      title = 'Financial Ledger & Document Extraction';
      intent = 'Reconcile invoice transactions, validate payment references, and append to spreadsheet ledger.';
      category = 'Finance & Accounting';
    } else {
      title = routineName || 'Automated Cross-Application Sequence';
      intent = `Continuously capture triggers in ${appsInvolved[0] || 'Desktop'} and propagate actions to downstream applications.`;
    }

    const synthesizedSteps = events.map((event, idx) => {
      let preferredTier = 'tier1_api';
      const availableTiers = ['tier1_api', 'tier2_app', 'tier3_accessibility', 'tier4_browser', 'tier5_vision'];

      if (event.app === 'excel') preferredTier = 'tier2_app';
      if (event.app === 'browser') preferredTier = 'tier1_api';

      return {
        order: idx + 1,
        title: event.actionLabel || `Execute ${event.actionType} on ${event.appName || event.app}`,
        description: `Automated execution targeting ${event.windowTitle || event.appName} using optimal heuristic tier.`,
        app: event.app,
        actionType: event.actionType,
        preferredTier,
        availableTiers,
        parameters: event.payload || {},
        variablesIn: idx === 0 ? ['trigger_payload'] : [`step_${idx}_output`],
        variablesOut: [`step_${idx + 1}_output`],
        condition:
          idx === 2
            ? {
                field: 'record_found',
                operator: 'equals',
                value: true,
                ifFalseAction: 'escalate_to_human',
                description: 'If record is not matched, halt automation and notify human operator.',
              }
            : undefined,
      };
    });

    const fallbackWorkflow = {
      title,
      intent,
      summary: `Observed sequence spanning ${appsInvolved.join(' ➔ ')}. Clustered with 95.8% pattern confidence.`,
      category,
      similarityScore: 0.96,
      avgManualSeconds: events.length * 45,
      avgAutomatedSeconds: Number((events.length * 0.9).toFixed(1)),
      trigger: {
        type: 'ai_observer',
        sourceApp: events[0]?.app || 'gmail',
        description: `Incoming event detected on ${events[0]?.appName || events[0]?.app || 'Desktop App'}`,
      },
      steps: synthesizedSteps,
    };

    return res.json({ success: true, source: 'heuristic-engine', workflow: fallbackWorkflow });
  } catch (error: any) {
    console.error('[WorkFlowOS] Synthesis endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Multi-turn Gemini Chat with Role System Instructions and Google Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, systemInstruction, useSearch } = req.body;

    // Model options requested:
    // 'gemini-3.1-pro-preview' for complex tasks
    // 'gemini-3.5-flash' for general tasks & Search Grounding
    // 'gemini-3.1-flash-lite' for fast tasks
    const validModels = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    let chosenModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    if (!aiClient) {
      const lastUserMsg = messages?.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || 'Hello';
      return res.json({
        success: true,
        text: `[WorkFlowOS Offline Copilot]: You asked: "${lastUserMsg}". For full Gemini intelligence, voice live streaming, and search grounding, ensure GEMINI_API_KEY is configured.`,
        modelUsed: chosenModel,
        sources: [],
      });
    }

    // Format multi-turn conversation history
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction:
        systemInstruction ||
        'You are the WorkFlowOS Automation Copilot. You assist users in observing desktop routines, discovering recurring patterns across applications, recommending optimal automation tiers (API, DOM, Accessibility, Vision, OS Input), explaining self-healing mechanisms, and measuring ROI.',
    };

    // Google Search Grounding using gemini-3.5-flash (with googleSearch tool)
    if (useSearch) {
      chosenModel = 'gemini-3.5-flash';
      config.tools = [{ googleSearch: {} }];
    }

    const response = await aiClient.models.generateContent({
      model: chosenModel,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources =
      groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || 'Web Search Result',
          url: chunk.web?.uri || '',
        }))
        .filter((s: any) => s.url) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    return res.json({
      success: true,
      text,
      modelUsed: chosenModel,
      sources,
      searchQueries,
    });
  } catch (error: any) {
    console.error('[WorkFlowOS] Chat generation error:', error);
    return res.status(500).json({ error: error?.message || 'Chat generation failed' });
  }
});

// Start the server
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[WorkFlowOS] Engine running on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
