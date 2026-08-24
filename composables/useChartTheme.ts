/**
 * useChartTheme — bo mau + option Chart.js cho dark theme (dashboard / admin)
 * Phong cach thegioidev.com: nen toi, grid mo, tooltip zinc-900.
 */
export function useChartTheme() {
  const colors = {
    text: '#a1a1aa',
    grid: 'rgba(63,63,70,.45)',
    blue: '#3b82f6',
    green: '#22c55e',
    amber: '#f59e0b',
    violet: '#a855f7',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    panel: '#18181b',
    line: '#27272a'
  }

  function hexAlpha(hex: string, a: number) {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  /** Gradient dung cho fill duoi duong line chart */
  function areaGradient(ctx: CanvasRenderingContext2D, height: number, hex: string, alpha = 0.35) {
    const g = ctx.createLinearGradient(0, 0, 0, height || 240)
    g.addColorStop(0, hexAlpha(hex, alpha))
    g.addColorStop(1, hexAlpha(hex, 0))
    return g
  }

  /** Option chung cho moi chart dark */
  function baseOptions(opts: { tickFormat?: (v: any) => string; legend?: boolean } = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          display: opts.legend !== false,
          position: 'bottom' as const,
          labels: { color: colors.text, boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 16, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: colors.panel,
          borderColor: colors.line,
          borderWidth: 1,
          titleColor: '#fafafa',
          bodyColor: '#d4d4d8',
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.grid, drawTicks: false },
          ticks: { color: colors.text, font: { size: 11 }, padding: 8, callback: opts.tickFormat }
        },
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: colors.text, font: { size: 11 }, padding: 6 }
        }
      }
    }
  }

  return { colors, areaGradient, hexAlpha, baseOptions }
}
