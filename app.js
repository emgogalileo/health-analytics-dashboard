/**
 * Health Analytics Dashboard — Frontend Logic
 *
 * Simulates live biomarker readings with:
 *  - Real-time value updates per metric (HR, glucose, SpO2, sleep)
 *  - Animated sparklines (rolling window of 20 bars)
 *  - Weekly bar chart with 3 data series
 *  - Contextual alert bar when glucose exceeds threshold
 *  - Functional Export CSV and Refresh buttons
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Utilities ──────────────────────────────────────────────────────────────
    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // ── DOM refs ───────────────────────────────────────────────────────────────
    const hrVal      = document.getElementById('hr-val');
    const glucoseVal = document.getElementById('glucose-val');
    const sleepVal   = document.getElementById('sleep-val');
    const o2Val      = document.getElementById('o2-val');

    const glucoseBadge = document.getElementById('glucose-badge');
    const o2Badge      = document.getElementById('o2-badge');

    const hrTrend      = document.getElementById('hr-trend');
    const glucoseTrend = document.getElementById('glucose-trend');

    const alertBar  = document.getElementById('alert-bar');
    const alertMsg  = document.getElementById('alert-msg');
    const alertDismiss = document.getElementById('alert-dismiss');

    const btnExport  = document.getElementById('btn-export');
    const btnRefresh = document.getElementById('btn-refresh');

    // ── State ──────────────────────────────────────────────────────────────────
    let hr      = 72;
    let glucose = 95;
    let sleep   = 85;
    let o2      = 98;
    let alertDismissed = false;

    // ── Sparklines ─────────────────────────────────────────────────────────────
    const SPARK_BARS = 20;

    const SPARK_CONFIG = {
        'hr-spark':      { color: '#38bdf8' },
        'glucose-spark': { color: '#a78bfa' },
        'sleep-spark':   { color: '#34d399' },
        'o2-spark':      { color: '#f59e0b' },
    };

    const initSpark = (id, color) => {
        const el = document.getElementById(id);
        el.innerHTML = '';
        for (let i = 0; i < SPARK_BARS; i++) {
            const bar = document.createElement('div');
            bar.className = 'spark-bar';
            bar.style.background = color;
            bar.style.height = `${rand(20, 90)}%`;
            el.appendChild(bar);
        }
    };

    const updateSpark = (id, color, pct) => {
        const el = document.getElementById(id);
        el.removeChild(el.firstChild);
        const bar = document.createElement('div');
        bar.className = 'spark-bar';
        bar.style.background = color;
        bar.style.height = `${clamp(pct, 10, 100)}%`;
        el.appendChild(bar);
    };

    Object.entries(SPARK_CONFIG).forEach(([id, cfg]) => initSpark(id, cfg.color));

    // ── Weekly chart ───────────────────────────────────────────────────────────
    const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const weeklyChart = document.getElementById('weekly-chart');
    const chartDays   = document.getElementById('chart-days');

    const SERIES = [
        { color: '#38bdf8', min: 60, max: 100 }, // HR (normalised %)
        { color: '#a78bfa', min: 30, max: 90  }, // Glucose %
        { color: '#34d399', min: 70, max: 100 }, // O2 %
    ];

    DAYS.forEach(day => {
        // Day group (3 bars side-by-side)
        const group = document.createElement('div');
        group.className = 'day-group';

        SERIES.forEach(s => {
            const bar = document.createElement('div');
            bar.className = 'day-bar';
            bar.style.background = s.color;
            bar.style.height = `${rand(s.min, s.max)}%`;
            bar.style.opacity = '0.75';
            group.appendChild(bar);
        });

        weeklyChart.appendChild(group);

        // Day label
        const label = document.createElement('div');
        label.className = 'day-label';
        label.textContent = day;
        chartDays.appendChild(label);
    });

    // ── Alert logic ────────────────────────────────────────────────────────────
    const checkAlerts = () => {
        if (alertDismissed) return;
        if (glucose > 108) {
            alertMsg.textContent = `Glucosa elevada detectada: ${Math.round(glucose)} mg/dL — Revisar ingesta de carbohidratos`;
            alertBar.style.display = 'flex';
        } else {
            alertBar.style.display = 'none';
        }
    };

    alertDismiss.addEventListener('click', () => {
        alertBar.style.display = 'none';
        alertDismissed = true;
        setTimeout(() => { alertDismissed = false; }, 30000); // re-enable after 30s
    });

    // ── Main update loop ───────────────────────────────────────────────────────
    const update = () => {
        // Random walks
        hr      = clamp(hr      + rand(-3, 3),     55, 110);
        glucose = clamp(glucose + rand(-4, 4),     70, 140);
        sleep   = clamp(sleep   + rand(-2, 2),     60,  99);
        o2      = clamp(o2      + rand(-0.5, 0.5), 94, 100);

        // Update values
        hrVal.textContent      = Math.round(hr);
        glucoseVal.textContent = Math.round(glucose);
        sleepVal.textContent   = Math.round(sleep);
        o2Val.textContent      = o2.toFixed(1);

        // HR trend label
        const hrDelta = hr - 72;
        hrTrend.textContent = hrDelta > 0
            ? `↑ ${hrDelta.toFixed(1)} bpm vs. referencia`
            : `↓ ${Math.abs(hrDelta).toFixed(1)} bpm vs. referencia`;
        hrTrend.className = `trend ${hrDelta > 5 ? 'negative' : hrDelta > 0 ? 'positive' : 'stable'}`;

        // Glucose badge
        if (glucose > 110) {
            glucoseBadge.textContent = 'Alto';
            glucoseBadge.className = 'badge badge-alert';
            glucoseTrend.textContent = `↑ ${(glucose - 100).toFixed(0)} mg/dL sobre referencia`;
            glucoseTrend.className = 'trend negative';
        } else if (glucose < 80) {
            glucoseBadge.textContent = 'Bajo';
            glucoseBadge.className = 'badge badge-warn';
            glucoseTrend.textContent = '↓ Por debajo del rango';
            glucoseTrend.className = 'trend negative';
        } else {
            glucoseBadge.textContent = 'Normal';
            glucoseBadge.className = 'badge badge-normal';
            glucoseTrend.textContent = '— Estable';
            glucoseTrend.className = 'trend stable';
        }

        // O2 badge
        if (o2 < 95) {
            o2Badge.textContent = 'Bajo';
            o2Badge.className = 'badge badge-warn';
        } else {
            o2Badge.textContent = 'Óptimo';
            o2Badge.className = 'badge badge-good';
        }

        // Sparklines (normalised percentage relative to max)
        updateSpark('hr-spark',      '#38bdf8', ((hr - 40) / 80) * 100);
        updateSpark('glucose-spark', '#a78bfa', ((glucose - 60) / 90) * 100);
        updateSpark('sleep-spark',   '#34d399', sleep);
        updateSpark('o2-spark',      '#f59e0b', o2);

        checkAlerts();
    };

    // Initial + interval
    update();
    setInterval(update, 1800);

    // ── Button handlers ────────────────────────────────────────────────────────

    /** Export current readings to a downloadable CSV file */
    btnExport.addEventListener('click', () => {
        const rows = [
            ['Métrica', 'Valor', 'Unidad', 'Timestamp'],
            ['Frecuencia Cardíaca', Math.round(hr),      'bpm',   new Date().toISOString()],
            ['Glucosa',            Math.round(glucose), 'mg/dL', new Date().toISOString()],
            ['Calidad de Sueño',   Math.round(sleep),  '/100',  new Date().toISOString()],
            ['Saturación O₂',      o2.toFixed(1),      '%',     new Date().toISOString()],
        ];

        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `biomarkers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    /** Refresh: re-randomise all sparklines and chart bars */
    btnRefresh.addEventListener('click', () => {
        Object.entries(SPARK_CONFIG).forEach(([id, cfg]) => initSpark(id, cfg.color));

        // Re-animate chart bars
        weeklyChart.querySelectorAll('.day-bar').forEach((bar, i) => {
            const s = SERIES[i % SERIES.length];
            bar.style.height = `${rand(s.min, s.max)}%`;
        });

        btnRefresh.textContent = '✓ Actualizado';
        setTimeout(() => { btnRefresh.textContent = '↻ Actualizar'; }, 1500);
    });
});