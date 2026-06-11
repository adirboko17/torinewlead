// Tori landing — Tweaks panel
const TORI_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF8C1A",
  "motion": true,
  "displayFont": "Secular One"
}/*EDITMODE-END*/;

function ToriTweaks() {
  const [t, setTweak] = useTweaks(TORI_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    // derive a deeper shade for gradients
    const deep = { '#FF8C1A': '#F77B00', '#FFB000': '#F09600', '#FF6B35': '#F2511B' }[t.accent] || t.accent;
    root.style.setProperty('--accent-deep', deep);
    document.body.classList.toggle('no-motion', !t.motion);
    root.style.setProperty('--font-display', '"' + t.displayFont + '", sans-serif');
  }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="מותג"></TweakSection>
      <TweakColor label="צבע מותג" value={t.accent}
        options={['#FF8C1A', '#FFB000', '#FF6B35']}
        onChange={(v) => setTweak('accent', v)}></TweakColor>
      <TweakSelect label="פונט כותרות" value={t.displayFont}
        options={['Secular One', 'Suez One', 'Rubik']}
        onChange={(v) => setTweak('displayFont', v)}></TweakSelect>
      <TweakSection label="תנועה"></TweakSection>
      <TweakToggle label="אנימציות" value={t.motion}
        onChange={(v) => setTweak('motion', v)}></TweakToggle>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<ToriTweaks></ToriTweaks>);
