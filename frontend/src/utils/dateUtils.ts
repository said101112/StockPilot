/**
 * Utilitaires de formatage de date et d'heure pour StockPilot.
 * Permet d'afficher la date avec les heures et minutes et l'ancienneté relative (ex: "Il y a 5 min").
 */

export function parseDate(dateStr?: string | Date | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(dateInput?: string | Date | null): string {
  const d = parseDate(dateInput);
  if (!d) return "—";

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(dateInput?: string | Date | null): string {
  const d = parseDate(dateInput);
  if (!d) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour} h`;
  if (diffDay === 1) {
    const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `Hier à ${timeStr}`;
  }
  if (diffDay < 7) return `Il y a ${diffDay} j`;

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDateWithTime(dateInput?: string | Date | null): {
  date: string;
  time: string;
  relative: string;
  full: string;
} {
  const d = parseDate(dateInput);
  if (!d) {
    return { date: "—", time: "—", relative: "", full: "—" };
  }

  const date = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const relative = formatTimeAgo(d);
  const full = `${date} à ${time}`;

  return { date, time, relative, full };
}
