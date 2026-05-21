import { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, ChevronDown, ChevronRight, GripVertical,
  Twitter, Github, Linkedin, Facebook, Instagram, Youtube,
  Image as ImageIcon, Type, Link as LinkIcon, Settings
} from 'lucide-react';
import type { HeaderSettings, FooterSettings, NavItem, FooterColumn, SocialLink } from '../types/site-settings';

interface LayoutEditorProps {
  type: 'header' | 'footer';
  onClose: () => void;
}

const socialIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={16} />,
  github: <Github size={16} />,
  linkedin: <Linkedin size={16} />,
  facebook: <Facebook size={16} />,
  instagram: <Instagram size={16} />,
  youtube: <Youtube size={16} />,
};

export function LayoutEditor({ type, onClose }: LayoutEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<HeaderSettings | FooterSettings | null>(null);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [type]);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/site-settings/${type}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.value);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
    setLoading(false);
  }

  async function saveSettings() {
    if (!data) return;
    setSaving(true);
    try {
      await fetch(`/api/site-settings/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: data })
      });
      onClose(); // Close modal after save
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div style={{ color: '#fff' }}>Chargement...</div>
      </div>
    );
  }

  const isHeader = type === 'header';
  const headerData = data as HeaderSettings;
  const footerData = data as FooterSettings;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#0f0f1a', borderRadius: 16, width: '90%', maxWidth: 800,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #2a2a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings size={20} color="#6366f1" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
              {isHeader ? 'Configuration du Header' : 'Configuration du Footer'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 8
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {isHeader && headerData && (
            <HeaderEditor data={headerData} onChange={setData as any} expandedNav={expandedNav} setExpandedNav={setExpandedNav} />
          )}
          {!isHeader && footerData && (
            <FooterEditor data={footerData} onChange={setData as any} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #2a2a4a',
          display: 'flex', justifyContent: 'flex-end', gap: 12
        }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid #2a2a4a', color: '#fff',
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer'
          }}>
            Annuler
          </button>
          <button onClick={saveSettings} disabled={saving} style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff',
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Header Editor Component
function HeaderEditor({ 
  data, onChange, expandedNav, setExpandedNav 
}: { 
  data: HeaderSettings; 
  onChange: (data: HeaderSettings) => void;
  expandedNav: string | null;
  setExpandedNav: (id: string | null) => void;
}) {
  const updateLogo = (field: string, value: string | null) => {
    onChange({ ...data, logo: { ...data.logo, [field]: value } });
  };

  const updateCta = (field: string, value: string | boolean) => {
    onChange({ ...data, cta: { ...data.cta, [field]: value } });
  };

  const addNavItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'Nouveau lien',
      url: '/',
      children: []
    };
    onChange({ ...data, navigation: [...data.navigation, newItem] });
  };

  const updateNavItem = (index: number, field: string, value: string) => {
    const nav = [...data.navigation];
    nav[index] = { ...nav[index], [field]: value };
    onChange({ ...data, navigation: nav });
  };

  const removeNavItem = (index: number) => {
    onChange({ ...data, navigation: data.navigation.filter((_, i) => i !== index) });
  };

  const addSubItem = (navIndex: number) => {
    const nav = [...data.navigation];
    const newSub: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'Sous-menu',
      url: '/',
      children: []
    };
    nav[navIndex] = { ...nav[navIndex], children: [...nav[navIndex].children, newSub] };
    onChange({ ...data, navigation: nav });
  };

  const updateSubItem = (navIndex: number, subIndex: number, field: string, value: string) => {
    const nav = [...data.navigation];
    const children = [...nav[navIndex].children];
    children[subIndex] = { ...children[subIndex], [field]: value };
    nav[navIndex] = { ...nav[navIndex], children };
    onChange({ ...data, navigation: nav });
  };

  const removeSubItem = (navIndex: number, subIndex: number) => {
    const nav = [...data.navigation];
    nav[navIndex] = { ...nav[navIndex], children: nav[navIndex].children.filter((_, i) => i !== subIndex) };
    onChange({ ...data, navigation: nav });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: 8, color: '#fff', fontSize: '0.875rem'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#94a3b8', fontSize: '0.75rem', marginBottom: 6, fontWeight: 500
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Logo Section */}
      <section>
        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Type size={18} /> Logo
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Texte du logo</label>
            <input
              type="text"
              value={data.logo.text}
              onChange={(e) => updateLogo('text', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Image (URL)</label>
            <input
              type="text"
              value={data.logo.image || ''}
              onChange={(e) => updateLogo('image', e.target.value || null)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LinkIcon size={18} /> Navigation
          </h3>
          <button onClick={addNavItem} style={{
            background: 'rgba(99, 102, 241, 0.2)', border: 'none', color: '#6366f1',
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem'
          }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.navigation.map((item, index) => (
            <div key={item.id} style={{ background: '#1a1a2e', borderRadius: 8, overflow: 'hidden' }}>
              {/* Nav Item */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
                <GripVertical size={16} color="#64748b" style={{ cursor: 'grab' }} />
                <button
                  onClick={() => setExpandedNav(expandedNav === item.id ? null : item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                >
                  {item.children.length > 0 ? (
                    expandedNav === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  ) : <div style={{ width: 16 }} />}
                </button>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateNavItem(index, 'url', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="/url"
                />
                <button onClick={() => addSubItem(index)} style={{
                  background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', padding: 6
                }} title="Ajouter sous-menu">
                  <Plus size={16} />
                </button>
                <button onClick={() => removeNavItem(index)} style={{
                  background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              {/* Sub Items */}
              {expandedNav === item.id && item.children.length > 0 && (
                <div style={{ borderTop: '1px solid #2a2a4a', padding: '8px 12px 12px 48px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.children.map((sub, subIndex) => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GripVertical size={14} color="#64748b" style={{ cursor: 'grab' }} />
                      <input
                        type="text"
                        value={sub.label}
                        onChange={(e) => updateSubItem(index, subIndex, 'label', e.target.value)}
                        style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: '0.8125rem' }}
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={sub.url}
                        onChange={(e) => updateSubItem(index, subIndex, 'url', e.target.value)}
                        style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: '0.8125rem' }}
                        placeholder="/url"
                      />
                      <button onClick={() => removeSubItem(index, subIndex)} style={{
                        background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={18} /> Bouton CTA
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Texte</label>
            <input
              type="text"
              value={data.cta.text}
              onChange={(e) => updateCta('text', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>URL</label>
            <input
              type="text"
              value={data.cta.url}
              onChange={(e) => updateCta('url', e.target.value)}
              style={inputStyle}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', cursor: 'pointer', padding: '10px 0' }}>
            <input
              type="checkbox"
              checked={data.cta.visible}
              onChange={(e) => updateCta('visible', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#6366f1' }}
            />
            Visible
          </label>
        </div>
      </section>
    </div>
  );
}

// Footer Editor Component
function FooterEditor({ data, onChange }: { data: FooterSettings; onChange: (data: FooterSettings) => void }) {
  const updateLogo = (field: string, value: string | null) => {
    onChange({ ...data, logo: { ...data.logo, [field]: value } });
  };

  const updatePoweredBy = (field: string, value: string | boolean) => {
    onChange({ ...data, poweredBy: { ...data.poweredBy, [field]: value } });
  };

  const addColumn = () => {
    const newCol: FooterColumn = {
      id: `col-${Date.now()}`,
      title: 'Nouvelle colonne',
      links: []
    };
    onChange({ ...data, columns: [...data.columns, newCol] });
  };

  const updateColumn = (index: number, field: string, value: string) => {
    const cols = [...data.columns];
    cols[index] = { ...cols[index], [field]: value };
    onChange({ ...data, columns: cols });
  };

  const removeColumn = (index: number) => {
    onChange({ ...data, columns: data.columns.filter((_, i) => i !== index) });
  };

  const addLink = (colIndex: number) => {
    const cols = [...data.columns];
    cols[colIndex].links.push({ id: `link-${Date.now()}`, label: 'Nouveau lien', url: '/' });
    onChange({ ...data, columns: cols });
  };

  const updateLink = (colIndex: number, linkIndex: number, field: string, value: string) => {
    const cols = [...data.columns];
    cols[colIndex].links[linkIndex] = { ...cols[colIndex].links[linkIndex], [field]: value };
    onChange({ ...data, columns: cols });
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const cols = [...data.columns];
    cols[colIndex].links = cols[colIndex].links.filter((_, i) => i !== linkIndex);
    onChange({ ...data, columns: cols });
  };

  const addSocial = () => {
    const newSocial: SocialLink = { id: `social-${Date.now()}`, platform: 'twitter', url: 'https://' };
    onChange({ ...data, social: [...data.social, newSocial] });
  };

  const updateSocial = (index: number, field: string, value: string) => {
    const social = [...data.social];
    social[index] = { ...social[index], [field]: value } as SocialLink;
    onChange({ ...data, social });
  };

  const removeSocial = (index: number) => {
    onChange({ ...data, social: data.social.filter((_, i) => i !== index) });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: 8, color: '#fff', fontSize: '0.875rem'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#94a3b8', fontSize: '0.75rem', marginBottom: 6, fontWeight: 500
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Logo & Description */}
      <section>
        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 16 }}>Logo & Description</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Texte du logo</label>
            <input type="text" value={data.logo.text} onChange={(e) => updateLogo('text', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Image (URL)</label>
            <input type="text" value={data.logo.image || ''} onChange={(e) => updateLogo('image', e.target.value || null)} placeholder="https://..." style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>
      </section>

      {/* Columns */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Colonnes de liens</h3>
          <button onClick={addColumn} style={{
            background: 'rgba(99, 102, 241, 0.2)', border: 'none', color: '#6366f1',
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem'
          }}>
            <Plus size={14} /> Ajouter colonne
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.columns.length, 3)}, 1fr)`, gap: 16 }}>
          {data.columns.map((col, colIndex) => (
            <div key={col.id} style={{ background: '#1a1a2e', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => updateColumn(colIndex, 'title', e.target.value)}
                  style={{ ...inputStyle, fontWeight: 600 }}
                  placeholder="Titre colonne"
                />
                <button onClick={() => removeColumn(colIndex)} style={{
                  background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((link, linkIndex) => (
                  <div key={link.id} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(colIndex, linkIndex, 'label', e.target.value)}
                      style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: '0.8125rem' }}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(colIndex, linkIndex, 'url', e.target.value)}
                      style={{ ...inputStyle, width: 80, padding: '8px 10px', fontSize: '0.8125rem' }}
                      placeholder="/url"
                    />
                    <button onClick={() => removeLink(colIndex, linkIndex)} style={{
                      background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addLink(colIndex)} style={{
                  background: 'transparent', border: '1px dashed #2a2a4a', color: '#64748b',
                  padding: '6px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem'
                }}>
                  + Ajouter lien
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Réseaux sociaux</h3>
          <button onClick={addSocial} style={{
            background: 'rgba(99, 102, 241, 0.2)', border: 'none', color: '#6366f1',
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem'
          }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {data.social.map((social, index) => (
            <div key={social.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a2e', padding: '8px 12px', borderRadius: 8 }}>
              {socialIcons[social.platform]}
              <select
                value={social.platform}
                onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '6px 8px' }}
              >
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="youtube">YouTube</option>
              </select>
              <input
                type="text"
                value={social.url}
                onChange={(e) => updateSocial(index, 'url', e.target.value)}
                style={{ ...inputStyle, width: 150, padding: '6px 8px' }}
                placeholder="https://..."
              />
              <button onClick={() => removeSocial(index)} style={{
                background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Copyright & Powered By */}
      <section>
        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 16 }}>Copyright</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Texte copyright</label>
            <input
              type="text"
              value={data.copyright}
              onChange={(e) => onChange({ ...data, copyright: e.target.value })}
              style={inputStyle}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', cursor: 'pointer', padding: '10px 0' }}>
            <input
              type="checkbox"
              checked={data.poweredBy.visible}
              onChange={(e) => updatePoweredBy('visible', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#6366f1' }}
            />
            Afficher "Propulsé par RedCMS"
          </label>
        </div>
      </section>
    </div>
  );
}
