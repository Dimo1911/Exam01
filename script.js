// Input Element Selectors
const totalRevenueInput = document.getElementById('totalRevenue');
const avgOrderValueInput = document.getElementById('avgOrderValue');
const leadResponseRateSlider = document.getElementById('leadResponseRate');
const prospectResponseRateSlider = document.getElementById('prospectResponseRate');
const languageSelect = document.getElementById('languageSelect');

// Output KPI Metrics Elements
const customersValue = document.getElementById('customersValue');
const leadsValue = document.getElementById('leadsValue');
const prospectsValue = document.getElementById('prospectsValue');

// Label & Progress UI Elements
const leadRateLabel = document.getElementById('leadRateLabel');
const prospectRateLabel = document.getElementById('prospectRateLabel');
const leadPercLabel = document.getElementById('leadPercLabel');
const custPercLabel = document.getElementById('custPercLabel');

const leadProgress = document.getElementById('leadProgress');
const custProgress = document.getElementById('custProgress');

// Shared Dynamic Tooltip DOM Selectors
const sharedTooltip = document.getElementById('sharedTooltip');
const tooltipTitle = document.getElementById('tooltipTitle');
const tooltipProspects = document.getElementById('tooltipProspects');
const tooltipLeads = document.getElementById('tooltipLeads');
const tooltipCustomers = document.getElementById('tooltipCustomers');

// Cache runtime configuration globally to support hover events safely
let currentCalculations = { prospects: 0, leads: 0, customers: 0 };

// Dictionary object containing language translation packages
const translations = {
    en: {
        "label-language": "Language",
        "label-currency": "Currency",
        "label-start": "Campaign Start",
        "label-end": "Campaign End",
        "label-revenue": "Total Revenue",
        "label-avg-order": "Avg. Order Value",
        "scale-start": "0 people",
        "scale-end": "120 people",
        "kpi-prospects": "📋 Prospects",
        "kpi-leads": "👤 Leads",
        "kpi-customers": "🏆 Customers",
        "slider-lead-rate": "Lead Response Rate",
        "slider-prospect-rate": "Prospect Response Rate",
        "tooltip-prospects": "Prospects",
        "tooltip-leads": "Leads",
        "tooltip-customers": "Customers",
        "month-prefix": "Month"
    },
    bg: {
        "label-language": "Език",
        "label-currency": "Валута",
        "label-start": "Начало на кампания",
        "label-end": "Край на кампания",
        "label-revenue": "Общ оборот",
        "label-avg-order": "Средна поръчка",
        "scale-start": "0 души",
        "scale-end": "120 души",
        "kpi-prospects": "📋 Контакти",
        "kpi-leads": "👤 Потенциални (Leads)",
        "kpi-customers": "🏆 Клиенти",
        "slider-lead-rate": "Процент отговори от Потенциални",
        "slider-prospect-rate": "Процент отговори от Контакти",
        "tooltip-prospects": "Контакти",
        "tooltip-leads": "Лийдове",
        "tooltip-customers": "Клиенти",
        "month-prefix": "Месец"
    }
};

// Language Interface Swapper Engine
function updateLanguage() {
    const selectedLang = languageSelect.value;
    const langPackage = translations[selectedLang];
    
    // Смяна на знамето в етикета в реалне време
    const currentFlag = document.getElementById('currentFlag');
    if (currentFlag) {
        currentFlag.innerText = selectedLang === 'bg' ? '🇧🇬' : '🇺🇸';
    }

    // Find and replace text for elements tagged with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (langPackage[key]) {
            element.innerText = langPackage[key];
        }
    });

    calculateMetrics();
}

// Core Calculation Engine
function calculateMetrics() {
    const revenue = parseFloat(totalRevenueInput.value) || 0;
    const avgOrder = parseFloat(avgOrderValueInput.value) || 1; 
    const leadRate = parseFloat(leadResponseRateSlider.value);
    const prospectRate = parseFloat(prospectResponseRateSlider.value);

    // Refresh range slider labels dynamically
    leadRateLabel.innerText = leadRate.toFixed(2) + '%';
    prospectRateLabel.innerText = prospectRate.toFixed(2) + '%';

    // Formula 01: Customers = Total Revenue / Avg. Order Value
    const customers = Math.ceil(revenue / avgOrder);

    // Formula 02: Leads = Customers * 100 / Lead Response Rate
    const leads = Math.ceil((customers * 100) / leadRate);

    // Formula 03: Prospects = Leads * 100 / Prospect Response Rate
    const prospects = Math.ceil((leads * 100) / prospectRate);

    // Store calculations reference values locally
    currentCalculations = { prospects, leads, customers };

    // Render foundational results into KPI DOM nodes
    customersValue.innerText = customers;
    leadsValue.innerText = leads;
    prospectsValue.innerText = prospects;

    const leadPercentage = prospects > 0 ? (leads / prospects) * 100 : 0;
    const custPercentage = prospects > 0 ? (customers / prospects) * 100 : 0;

    leadPercLabel.innerText = leadPercentage.toFixed(2) + '%';
    custPercLabel.innerText = custPercentage.toFixed(2) + '%';

    leadProgress.style.width = `${Math.min(leadPercentage, 100)}%`;
    custProgress.style.width = `${Math.min(custPercentage, 100)}%`;

    // Dynamic Scale Graph Resizer Integration pass
    const maxScaleValue = 120; 

    for (let m = 1; m <= 6; m++) {
        const monthFactor = m / 6;
        const mProspects = Math.ceil(prospects * monthFactor);
        const mLeads = Math.ceil(leads * monthFactor);
        const mCustomers = Math.ceil(customers * monthFactor);

        const row = document.querySelector(`.chart-row[data-month="${m}"]`);
        if (row) {
            const pBar = row.querySelector('.prospects-bar');
            const lBar = row.querySelector('.leads-bar');
            const cBar = row.querySelector('.customers-bar');

            const pWidth = Math.min((mProspects / maxScaleValue) * 100, 100);
            const lWidth = mProspects > 0 ? (mLeads / mProspects) * 100 : 0;
            const cWidth = mLeads > 0 ? (mCustomers / mLeads) * 100 : 0;

            if (pBar) pBar.style.width = `${pWidth}%`;
            if (lBar) lBar.style.width = `${lWidth}%`;
            if (cBar) cBar.style.width = `${cWidth}%`;
        }
    }
}

// Interactive Hover Tooltip System Setup
document.querySelectorAll('.chart-row').forEach(row => {
    row.addEventListener('mouseenter', (e) => {
        const m = parseInt(row.getAttribute('data-month'));
        const monthFactor = m / 6;
        const selectedLang = languageSelect.value;

        const mProspects = Math.ceil(currentCalculations.prospects * monthFactor);
        const mLeads = Math.ceil(currentCalculations.leads * monthFactor);
        const mCustomers = Math.ceil(currentCalculations.customers * monthFactor);

        const prefix = translations[selectedLang]["month-prefix"];
        tooltipTitle.innerText = `${prefix} #${m}`;
        tooltipProspects.innerText = mProspects;
        tooltipLeads.innerText = mLeads;
        tooltipCustomers.innerText = mCustomers;

        sharedTooltip.style.display = 'block';
    });

    row.addEventListener('mousemove', (e) => {
        const cardBounds = document.querySelector('.chart-card').getBoundingClientRect();
        const leftOffset = e.clientX - cardBounds.left;
        const topOffset = e.clientY - cardBounds.top;

        sharedTooltip.style.left = `${leftOffset}px`;
        sharedTooltip.style.top = `${topOffset}px`;
    });

    row.addEventListener('mouseleave', () => {
        sharedTooltip.style.display = 'none';
    });
});

// Bind live listeners across the control schema for real-time recalculation
totalRevenueInput.addEventListener('input', calculateMetrics);
avgOrderValueInput.addEventListener('input', calculateMetrics);
leadResponseRateSlider.addEventListener('input', calculateMetrics);
prospectResponseRateSlider.addEventListener('input', calculateMetrics);
languageSelect.addEventListener('change', updateLanguage);

// Initialization pass to structure values on boot
calculateMetrics();
