'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import styles from './AgentBuilder.module.css';
import {
  AgentConfig,
  buildAgentManifest,
  buildPrompt,
  defaultConfig,
  guardrailSuggestions,
  protocolSuggestions,
  capabilitySuggestions,
  toolTemplates,
  tonePresets
} from '../lib/agent';

type CopyTarget = 'prompt' | 'manifest' | null;

const uid = () => Math.random().toString(36).slice(2, 10);

export function AgentBuilder() {
  const [config, setConfig] = useState<AgentConfig>(defaultConfig);
  const [newCapability, setNewCapability] = useState('');
  const [newGuardrail, setNewGuardrail] = useState('');
  const [newProtocol, setNewProtocol] = useState('');
  const [toolDraft, setToolDraft] = useState({ name: '', description: '', mode: 'read' });
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);

  const prompt = useMemo(() => buildPrompt(config), [config]);
  const manifest = useMemo(() => buildAgentManifest(config), [config]);
  const manifestJson = useMemo(
    () => JSON.stringify(manifest, null, 2),
    [manifest]
  );

  const toggleItem = (key: 'capabilities' | 'guardrails' | 'protocols', value: string) => {
    setConfig((prev) => {
      const exists = prev[key].includes(value);
      const nextValues = exists ? prev[key].filter((item) => item !== value) : [...prev[key], value];
      return { ...prev, [key]: nextValues };
    });
  };

  const addItem = (key: 'capabilities' | 'guardrails' | 'protocols', value: string) => {
    const trimmed = value.trim();
    if (!trimmed.length) return;
    setConfig((prev) => {
      if (prev[key].includes(trimmed)) return prev;
      return { ...prev, [key]: [...prev[key], trimmed] };
    });
  };

  const handleAddTool = () => {
    const { name, description, mode } = toolDraft;
    if (!name.trim() || !description.trim()) return;
    setConfig((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          id: uid(),
          name: name.trim(),
          description: description.trim(),
          mode: mode as AgentConfig['tools'][number]['mode']
        }
      ]
    }));
    setToolDraft({ name: '', description: '', mode });
  };

  const handleRemoveTool = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      tools: prev.tools.filter((tool) => tool.id !== id)
    }));
  };

  const handleCopy = async (target: CopyTarget) => {
    try {
      if (target === 'prompt') {
        await navigator.clipboard.writeText(prompt);
      } else if (target === 'manifest') {
        await navigator.clipboard.writeText(manifestJson);
      }
      setCopyTarget(target);
      setTimeout(() => setCopyTarget(null), 2200);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  return (
    <>
      <section className={styles.root}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.pill}>Agentic Studio · GPT-native</p>
            <h1 className={styles.heroTitle}>Design tailor-made ChatGPT agents in minutes.</h1>
            <p className={styles.heroSubtitle}>
              Compose structured instructions, refine behavioural guardrails, and export a
              ready-to-deploy manifest for Vercel AI SDK, OpenAI Assistants, or your own agentic
              runtime. Start from curated presets, remix capabilities, and share a branded ChatGPT
              persona with a single click.
            </p>
            <div className={styles.pillRow}>
              <span className={styles.pill}>🧠 Reasoning overlays</span>
              <span className={styles.pill}>🛠 Tool orchestration</span>
              <span className={styles.pill}>🛡 Safety guardrails</span>
              <span className={styles.pill}>📦 Manifest export</span>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelHeading}>Identity & Positioning</h2>
              <p className={styles.panelDescription}>
                Craft a memorable personality and clarify who this agent serves. These inputs seed
                the system prompt and manifest metadata.
              </p>
            </div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="agent-name">
                  Agent name
                </label>
                <input
                  id="agent-name"
                  className={styles.input}
                  value={config.name}
                  onChange={(event) => setConfig((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Atlas Intelligence Concierge"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="agent-tagline">
                  Positioning strapline
                </label>
                <input
                  id="agent-tagline"
                  className={styles.input}
                  value={config.tagline}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, tagline: event.target.value }))
                  }
                  placeholder="A strategic partner that converts messy context into decisive action."
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="agent-mission">
                  Core mission
                </label>
                <textarea
                  id="agent-mission"
                  className={styles.textarea}
                  value={config.mission}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, mission: event.target.value }))
                  }
                  placeholder="Transform raw qualitative and quantitative signals into a tactical roadmap while communicating trade-offs with crisp rationales."
                />
                <p className={styles.hint}>
                  Focus on what the agent must achieve every session. Mention success metrics and
                  cadence.
                </p>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="agent-audience">
                  Primary audience
                </label>
                <input
                  id="agent-audience"
                  className={styles.input}
                  value={config.audience}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, audience: event.target.value }))
                  }
                  placeholder="Product strategists, research leads, and operations teams."
                />
              </div>
            </div>
            <div className={styles.sectionDivider} />
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="agent-tone">
                    Voice & tone
                  </label>
                  <span className={styles.hint}>Mix and match to influence phrasing.</span>
                </div>
                <div className={styles.badgeRow}>
                  {tonePresets.map((tone) => {
                    const active = config.tones.includes(tone);
                    return (
                      <button
                        type="button"
                        key={tone}
                        className={clsx(styles.badge, active && styles.buttonGhost)}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            tones: active
                              ? prev.tones.filter((item) => item !== tone)
                              : [...prev.tones, tone]
                          }))
                        }
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="response-style">
                  Response cadence
                </label>
                <select
                  id="response-style"
                  className={styles.select}
                  value={config.responseStyle}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      responseStyle: event.target.value as AgentConfig['responseStyle']
                    }))
                  }
                >
                  <option value="succinct">Succinct · razor-sharp cues</option>
                  <option value="balanced">Balanced · structured rationale</option>
                  <option value="immersive">Immersive · narrative deep dives</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="kickoff">
                  Conversational kickoff
                </label>
                <textarea
                  id="kickoff"
                  className={styles.textarea}
                  value={config.kickoff}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, kickoff: event.target.value }))
                  }
                  placeholder="Open with a context audit, map north-star outcomes, and confirm what success for this session looks like."
                />
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelHeading}>Capabilities & Tooling</h2>
              <p className={styles.panelDescription}>
                Combine reasoning patterns, retrieval behaviors, and platform integrations. Toggle
                presets or compose net-new skills.
              </p>
            </div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Signature capabilities</span>
                  <span className={styles.hint}>
                    Highlight leverage. Think research loops, synthesis, playbooks.
                  </span>
                </div>
                <div className={styles.buttonRow}>
                  {capabilitySuggestions.map((capability) => {
                    const active = config.capabilities.includes(capability);
                    return (
                      <button
                        type="button"
                        key={capability}
                        className={clsx(styles.button, active && styles.buttonGhost)}
                        onClick={() => toggleItem('capabilities', capability)}
                      >
                        {capability}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.buttonRow}>
                  <input
                    className={styles.input}
                    value={newCapability}
                    onChange={(event) => setNewCapability(event.target.value)}
                    placeholder="Custom capability (e.g. Synthesise user interviews into a narrative arc)"
                  />
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={() => {
                      addItem('capabilities', newCapability);
                      setNewCapability('');
                    }}
                  >
                    Add capability
                  </button>
                </div>
                {config.capabilities.length > 0 && (
                  <div className={styles.list}>
                    {config.capabilities.map((capability) => (
                      <div key={capability} className={styles.listRow}>
                        <div className={styles.listContent}>
                          <span className={styles.listTitle}>{capability}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.buttonGhost}
                          onClick={() => toggleItem('capabilities', capability)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Tool integrations</span>
                  <span className={styles.hint}>Connect APIs or internal knowledge surfaces.</span>
                </div>
                <div className={styles.buttonRow}>
                  {toolTemplates.map((tool) => (
                    <button
                      type="button"
                      key={tool.name}
                      className={styles.buttonGhost}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          tools: prev.tools.some((existing) => existing.name === tool.name)
                            ? prev.tools
                            : [
                                ...prev.tools,
                                { ...tool, id: uid() }
                              ]
                        }))
                      }
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
                <div className={styles.fieldGrid}>
                  <input
                    className={styles.input}
                    value={toolDraft.name}
                    onChange={(event) =>
                      setToolDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Tool name"
                  />
                  <textarea
                    className={styles.textarea}
                    value={toolDraft.description}
                    onChange={(event) =>
                      setToolDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Describe what the tool unlocks for the agent."
                  />
                  <select
                    className={styles.select}
                    value={toolDraft.mode}
                    onChange={(event) =>
                      setToolDraft((prev) => ({ ...prev, mode: event.target.value }))
                    }
                  >
                    <option value="read">Read-only</option>
                    <option value="write">Write</option>
                    <option value="execute">Execute</option>
                  </select>
                  <button type="button" className={styles.button} onClick={handleAddTool}>
                    Add tool
                  </button>
                </div>
                {config.tools.length > 0 && (
                  <div className={styles.list}>
                    {config.tools.map((tool) => (
                      <div key={tool.id} className={styles.listRow}>
                        <div className={styles.listContent}>
                          <span className={styles.listTitle}>{tool.name}</span>
                          <span className={styles.listSubtitle}>{tool.description}</span>
                        </div>
                        <span className={styles.listBadge}>{tool.mode} access</span>
                        <button
                          type="button"
                          className={styles.buttonGhost}
                          onClick={() => handleRemoveTool(tool.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Execution protocols</span>
                  <span className={styles.hint}>
                    Define how the agent thinks, validates, and escalates tasks.
                  </span>
                </div>
                <div className={styles.buttonRow}>
                  {protocolSuggestions.map((protocol) => {
                    const active = config.protocols.includes(protocol);
                    return (
                      <button
                        type="button"
                        key={protocol}
                        className={clsx(styles.buttonGhost, active && styles.button)}
                        onClick={() => toggleItem('protocols', protocol)}
                      >
                        {protocol}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.buttonRow}>
                  <input
                    className={styles.input}
                    value={newProtocol}
                    onChange={(event) => setNewProtocol(event.target.value)}
                    placeholder="Add custom protocol"
                  />
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={() => {
                      addItem('protocols', newProtocol);
                      setNewProtocol('');
                    }}
                  >
                    Add protocol
                  </button>
                </div>
                {config.protocols.length > 0 && (
                  <div className={styles.list}>
                    {config.protocols.map((protocol) => (
                      <div key={protocol} className={styles.listRow}>
                        <div className={styles.listContent}>
                          <span className={styles.listTitle}>{protocol}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.buttonGhost}
                          onClick={() => toggleItem('protocols', protocol)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelHeading}>Guardrails & Escalation</h2>
            <p className={styles.panelDescription}>
              Define non-negotiables, safety filters, and the point at which the agent loops in a
              human operator.
            </p>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.label}>Trust boundaries</span>
              <div className={styles.buttonRow}>
                {guardrailSuggestions.map((guardrail) => {
                  const active = config.guardrails.includes(guardrail);
                  return (
                    <button
                      type="button"
                      key={guardrail}
                      className={clsx(styles.buttonGhost, active && styles.button)}
                      onClick={() => toggleItem('guardrails', guardrail)}
                    >
                      {guardrail}
                    </button>
                  );
                })}
              </div>
              <div className={styles.buttonRow}>
                <input
                  className={styles.input}
                  value={newGuardrail}
                  onChange={(event) => setNewGuardrail(event.target.value)}
                  placeholder="Custom guardrail (e.g. Never email customers without human sign-off)"
                />
                <button
                  type="button"
                  className={styles.buttonGhost}
                  onClick={() => {
                    addItem('guardrails', newGuardrail);
                    setNewGuardrail('');
                  }}
                >
                  Add guardrail
                </button>
              </div>
              {config.guardrails.length > 0 && (
                <div className={styles.list}>
                  {config.guardrails.map((guardrail) => (
                    <div key={guardrail} className={styles.listRow}>
                      <div className={styles.listContent}>
                        <span className={styles.listTitle}>{guardrail}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.buttonGhost}
                        onClick={() => toggleItem('guardrails', guardrail)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="handoff">
                Human escalation protocol
              </label>
              <textarea
                id="handoff"
                className={styles.textarea}
                value={config.handoff}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    handoff: event.target.value
                  }))
                }
                placeholder="If confidence score < 0.6 or requested action involves financial commitments, transfer context bundle to the On-call Strategist via Slack channel #agent-alerts."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="persona-promise">
                Persona promise
              </label>
              <textarea
                id="persona-promise"
                className={styles.textarea}
                value={config.promise}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    promise: event.target.value
                  }))
                }
                placeholder="Every response triangulates signal, surfaces a clear recommendation, and summons relevant playbooks without overwhelming the user."
              />
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelHeading}>Deployment Ready Assets</h2>
            <p className={styles.panelDescription}>
              Export a storyboarded system prompt and structured manifest that can plug into the
              OpenAI Assistants API, Vercel AI SDK, LangChain, or custom orchestration layers.
            </p>
            <div className={styles.statusNav}>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Voice</span>
                <span className={styles.statusValue}>{config.tones.join(' · ') || 'Customise'}</span>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Capabilities</span>
                <span className={styles.statusValue}>{config.capabilities.length || 0} mapped</span>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Tools</span>
                <span className={styles.statusValue}>{config.tools.length || 0} connected</span>
              </div>
            </div>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <span className={styles.label}>System prompt</span>
                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => handleCopy('prompt')}
                  >
                    Copy prompt
                  </button>
                </div>
              </div>
              <div className={styles.preview}>
                <div className={styles.previewContent}>{prompt}</div>
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Manifest JSON</span>
                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={() => handleCopy('manifest')}
                  >
                    Copy manifest
                  </button>
                </div>
              </div>
              <div className={styles.preview}>
                <div className={styles.previewContent}>{manifestJson}</div>
              </div>
            </div>
          </div>
        </section>
      </section>
      {copyTarget && (
        <div className={styles.copyToast}>
          {copyTarget === 'prompt' ? 'Prompt copied to clipboard ✔' : 'Manifest copied to clipboard ✔'}
        </div>
      )}
    </>
  );
}
