export function useChartTheme() {
  const dark = {
    text: '#a1a1aa',
    textStrong: '#fafafa',
    grid: 'rgba(63, 63, 70, .45)',
    border: '#27272a',
    panel: '#18181b',
    tooltipBg: 'rgba(24, 24, 27, .96)'
  }

  const palette = {
    blue: '#3b82f6',
    orange: '#f97316',
    green: '#10b981',
    purple: '#8b5cf6',
    rose: '#f43f5e',
    amber: '#f59e0b',
    cyan: '#06b6d4',
    zinc: '#71717a'
  }

  function fade(hex: string, alpha: number): string {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  function gradient(ctx: any, hex: string, top = 0.34): CanvasGradient | string {
    const area = ctx?.chart?.chartArea
    if (!area) return fade(hex, top)
    const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom)
    g.addColorStop(0, fade(hex, top))
    g.addColorStop(1, fade(hex, 0))
    return g
  }

  function baseOptions(extra: Record<string, any> = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: dark.text,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 7,
            boxHeight: 7,
            padding: 16,
            font: { size: 11, family: 'Inter' }
          }
        },
        tooltip: {
          backgroundColor: dark.tooltipBg,
          borderColor: dark.border,
          borderWidth: 1,
          titleColor: dark.textStrong,
          bodyColor: dark.text,
          padding: 11,
          cornerRadius: 8,
          displayColors: true,
          usePointStyle: true,
          titleFont: { size: 12, family: 'Inter', weight: '600' },
          bodyFont: { size: 12, family: 'Inter' }
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          border: { display: false },
          ticks: {
            color: dark.text,
            font: { size: 10, family: 'Inter' },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: dark.grid, drawBorder: false, drawTicks: false },
          border: { display: false },
          ticks: {
            color: dark.text,
            font: { size: 10, family: 'Inter' },
            padding: 8,
            maxTicksLimit: 6
          }
        }
      },
      ...extra
    }
  }

  function lineDataset(label: string, data: number[], hex: string, opts: Record<string, any> = {}) {
    return {
      label,
      data,
      borderColor: hex,
      backgroundColor: (ctx: any) => gradient(ctx, hex),
      borderWidth: 2,
      fill: true,
      tension: 0.38,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: hex,
      pointHoverBorderColor: dark.panel,
      pointHoverBorderWidth: 2,
      ...opts
    }
  }

  function barDataset(label: string, data: number[], hex: string, opts: Record<string, any> = {}) {
    return {
      label,
      data,
      backgroundColor: fade(hex, 0.72),
      hoverBackgroundColor: hex,
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 'flex',
      maxBarThickness: 22,
      ...opts
    }
  }

  return { dark, palette, fade, gradient, baseOptions, lineDataset, barDataset }
}
