"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Avatar, AvatarPicker, DEFAULT_AVATAR } from "@/components/ui/Avatar";
import {
  ActivityIcon,
  CircleIcon,
  CompactIcon,
  CompassIcon,
  DownloadIcon,
  MoonIcon,
  MusicIcon,
  RefreshIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  UploadIcon,
  UserIcon,
  VolumeIcon,
} from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useTour } from "@/features/tour/TourContext";
import { clearTourPrefs } from "@/features/tour/tourPersistence";
import { DARK_HINT_KEY } from "@/features/tour/DarkModeHint";

import { ShareCard } from "@/features/share/ShareCard";
import { PwaInstallCard } from "@/features/share/PwaInstallCard";
import { exportState, importState } from "@/db/persistence";
import { ACCENTS, ACCENT_KEYS } from "@/utils/theme";
import type { StarDensity } from "@/types";
import { todayKey } from "@/utils/dates";

function Row({
  icon,
  title,
  subtitle,
  control,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-soft">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-ink">{title}</p>
          <p className="text-sm text-ink-soft">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { state, api } = useApp();
  const s = state.settings;
  const dark = s.theme === "dark";
  const profile = state.profile;
  const [name, setName] = useState(profile?.name ?? "");
  const [savedName, setSavedName] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const tour = useTour();

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    api.updateProfile({ name: trimmed });
    setSavedName(true);
    window.setTimeout(() => setSavedName(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bambi-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importState(String(reader.result ?? ""));
      if (result.ok) {
        api.importData(result.state);
        setImportMsg({ ok: true, text: "Backup restored. Welcome back." });
      } else {
        setImportMsg({ ok: false, text: result.error });
      }
      window.setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Reveal>
        <PageHeader
          title="Settings"
          subtitle="Tune the garden to your taste. Everything stays on this device."
        />
      </Reveal>

      {/* Appearance */}
      <Reveal delay={0.03}>          <Card size="featured" className="space-y-6">
          <Row
            icon={dark ? <MoonIcon size={20} /> : <SunIcon size={20} />}
            title="Theme"
            subtitle={dark ? "Dark — easier on the eyes after dark" : "Light — bright and airy"}
            control={
              <div role="group" aria-label="Theme" className="flex rounded-full border border-line bg-surface p-1">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={s.theme === t}
                    onClick={() => api.setTheme(t)}
                    className={[
                      "rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      s.theme === t ? "bg-brand text-white shadow-card" : "text-ink-soft hover:text-ink",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            }
          />

          <div className="border-t border-line pt-5 dark:border-white/[0.06]">
            <p className="mb-3 text-sm font-bold text-ink">Accent color</p>
            <div role="group" aria-label="Accent color" className="flex flex-wrap gap-2.5">
              {ACCENT_KEYS.map((key) => {
                const a = ACCENTS[key];
                const selected = s.accent === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    aria-label={a.label}
                    title={a.label}
                    onClick={() => api.updateSettings({ accent: key })}
                    className={[
                      "size-9 rounded-full transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      "active:scale-90",
                      selected ? "ring-2 ring-ink ring-offset-2 ring-offset-card scale-110" : "hover:scale-105",
                    ].join(" ")}
                    style={{ backgroundColor: a.primary }}
                  />
                );
              })}
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Atmosphere */}
      <Reveal delay={0.06}>
        <Card size="featured" className="space-y-6">
          <Row
            icon={<SparklesIcon size={20} />}
            title="Animated background"
            subtitle="The night sky, drifting stars and aurora"
            control={
              <Switch
                checked={s.animatedBackground}
                onChange={(v) => api.updateSettings({ animatedBackground: v })}
                label="Animated background"
              />
            }
          />

          <Row
            icon={<StarIcon size={20} />}
            title="Star density"
            subtitle="How crowded the sky feels"
            control={
              <div role="group" aria-label="Star density" className="flex rounded-full border border-line bg-surface p-1">
                {(["low", "medium", "high"] as StarDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={s.starDensity === d}
                    disabled={!s.animatedBackground}
                    onClick={() => api.updateSettings({ starDensity: d })}
                    className={[
                      "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      "disabled:opacity-40",
                      s.starDensity === d ? "bg-brand text-white shadow-card" : "text-ink-soft hover:text-ink",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                ))}
              </div>
            }
          />

          <Row
            icon={<CircleIcon size={20} />}
            title="Particle effects"
            subtitle="Floating star particles (the aurora stays)"
            control={
              <Switch
                checked={s.particles}
                onChange={(v) => api.updateSettings({ particles: v })}
                label="Particle effects"
              />
            }
          />

          <Row
            icon={<ActivityIcon size={20} />}
            title="Reduce motion"
            subtitle="Calm the animations down, everywhere"
            control={
              <Switch
                checked={s.reduceMotion}
                onChange={(v) => api.updateSettings({ reduceMotion: v })}
                label="Reduce motion"
              />
            }
          />
        </Card>
      </Reveal>

      {/* Interface & sounds */}
      <Reveal delay={0.09}>
        <Card size="featured" className="space-y-6">
          <Row
            icon={<CompactIcon size={20} />}
            title="Compact mode"
            subtitle="Tighter spacing, more on screen"
            control={
              <Switch
                checked={s.compactMode}
                onChange={(v) => api.updateSettings({ compactMode: v })}
                label="Compact mode"
              />
            }
          />

          <Row
            icon={<VolumeIcon size={20} />}
            title="Sound effects"
            subtitle="Quiet chimes when you complete something"
            control={
              <Switch
                checked={s.sounds}
                onChange={(v) => api.updateSettings({ sounds: v })}
                label="Sound effects"
              />
            }
          />
        </Card>
      </Reveal>

      {/* Phone */}
      <Reveal delay={0.12}>
        <ShareCard />
      </Reveal>

      <Reveal delay={0.13}>
        <PwaInstallCard />
      </Reveal>

      {/* Help & guidance */}
      <Reveal delay={0.14}>
        <Card size="featured" className="space-y-6">
          <Row
            icon={<CompassIcon size={20} />}
            title="Help & guidance"
            subtitle="Learn your way around BAMBI — from the garden to the vision board"
            control={
              <Button variant="secondary" onClick={tour.openChooser} icon={<CompassIcon size={16} />}>
                Take a tour
              </Button>
            }
          />
        </Card>
      </Reveal>

      {/* Data */}
      <Reveal delay={0.15}>
        <Card size="featured" className="space-y-6">
          <Row
            icon={<DownloadIcon size={20} />}
            title="Export data"
            subtitle="Download a JSON backup of everything"
            control={
              <Button variant="secondary" onClick={handleExport} icon={<DownloadIcon size={16} />}>
                Export
              </Button>
            }
          />

          <Row
            icon={<UploadIcon size={20} />}
            title="Import data"
            subtitle="Restore from a BAMBI backup file"
            control={
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                    e.target.value = "";
                  }}
                />
                <Button variant="secondary" onClick={() => fileRef.current?.click()} icon={<UploadIcon size={16} />}>
                  Import
                </Button>
              </>
            }
          />
          {importMsg ? (
            <p
              className={`text-sm font-semibold ${importMsg.ok ? "text-good" : "text-bad"}`}
              role="status"
            >
              {importMsg.text}
            </p>
          ) : null}
        </Card>
      </Reveal>

      {/* Profile */}
      <Reveal delay={0.18}>
        <Card size="featured" className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar avatar={profile?.avatar ?? DEFAULT_AVATAR} size={48} />
            <div>
              <p className="font-bold text-ink">Profile</p>
              <p className="text-sm text-ink-soft">
                {profile?.interests.length
                  ? `Interests: ${profile.interests.length} selected`
                  : "No interests selected"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Your buddy</p>
            <AvatarPicker
              value={profile?.avatar ?? DEFAULT_AVATAR}
              onChange={(v) => api.updateProfile({ avatar: v })}
              tileSize={44}
            />
          </div>

          <Field label="Name" htmlFor="settings-name" hint="Shown in your daily greeting.">
            <div className="flex gap-2">
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
              />
              <Button onClick={saveName} disabled={!name.trim() || name.trim() === profile?.name}>
                {savedName ? "Saved" : "Save"}
              </Button>
            </div>
          </Field>
        </Card>
      </Reveal>

      {/* Account — coming soon */}
      <Reveal delay={0.19}>
        <Card size="featured" className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-soft">
              <UserIcon size={20} />
            </span>
            <div>
              <p className="font-bold text-ink">Account</p>
              <p className="text-sm text-ink-soft">Account features are coming soon.</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            Soon you&apos;ll be able to create an account and sync your garden between
            devices. For now, everything stays safely on this device.
          </p>
        </Card>
      </Reveal>

      {/* About + danger zone */}
      <Reveal delay={0.21}>
        <Card size="featured" className="space-y-6">
          <div>
            <p className="font-bold text-ink">About BAMBI</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              BAMBI is not a productivity app. No inbox, no notifications, no guilt —
              just habits, streaks, a growing tree, and a journal that belongs to you.
              All data stays in this browser.
            </p>
          </div>

          <div className="border-t border-line pt-5 dark:border-white/[0.06]">
            <p className="font-bold text-bad">Reset everything</p>
            <p className="mt-1 text-sm text-ink-soft">
              Clears your profile, habits, streaks, XP, tree, and journal. This cannot be undone.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {confirmReset ? (
                <>
                  <span className="text-sm font-semibold text-ink-soft">Are you sure?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      api.reset();
                      clearTourPrefs();
                      try { localStorage.removeItem(DARK_HINT_KEY); } catch {}
                      setConfirmReset(false);
                      // Reload so the TourProvider picks up the cleared state
                      window.location.reload();
                    }}
                    icon={<RefreshIcon size={15} />}
                  >
                    Yes, reset all data
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
                  Reset data
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Reveal>

      <p className="flex items-center gap-2 px-1 text-xs text-ink-soft">
        <MusicIcon size={14} />
        Sounds are synthesized in your browser — no files, no tracking.
      </p>
    </div>
  );
}
