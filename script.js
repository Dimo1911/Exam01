// Input Element Selectors
const totalRevenueInput = document.getElementById('totalRevenue');
const avgOrderValueInput = document.getElementById('avgOrderValue');
const leadResponseRateSlider = document.getElementById('leadResponseRate');
const prospectResponseRateSlider = document.getElementById('prospectResponseRate');
const languageSelect = document.getElementById('languageSelect');
const currencySelect = document.getElementById('currencySelect');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

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

// Функция за автоматично зануляване на датите към днешна дата
function initializeDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    if (startDateInput) startDateInput.value = `${yyyy}-${mm}-${dd}`;
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const fYyyy = futureDate.getFullYear();
    const fMm = String(futureDate.getMonth() + 1).padStart(2, '0');
    const fDd = String(futureDate.getDate()).padStart(2, '0');
    
    if (endDateInput) endDateInput.value = `${fYyyy}-${fMm}-${fDd}`;
}

// Функция за динамична смяна на символа на валутата
function updateCurrency() {
    const selectedCurrency = currencySelect.value;
    const sign = selectedCurrency === 'EUR' ? '€' : '$';
    
    const sign1 = document.getElementById('currencySign1');
    const sign2 = document.getElementById('currencySign2');
    if (sign1) sign1.innerText = sign;
    if (sign2) sign2.innerText = sign;

    calculateMetrics();
}

// Language Interface Swapper Engine
function updateLanguage() {
    const selectedLang = languageSelect.value;
    const langPackage = translations[selectedLang];
    
    const currentFlag = document.getElementById('currentFlag');
    if (currentFlag) {
        currentFlag.innerText = selectedLang === 'bg' ? '🇧🇬' : '🇺🇸';
    }

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
    const revenue = Math.abs(parseFloat(totalRevenueInput.value)) || 0;
    let avgOrder = Math.abs(parseFloat(avgOrderValueInput.value)) || 0; 

    const leadRate = parseFloat(leadResponseRateSlider.value) || 0;
    const prospectRate = parseFloat(prospectResponseRateSlider.value) || 0;

    leadRateLabel.innerText = leadRate.toFixed(2) + '%';
    prospectRateLabel.innerText = prospectRate.toFixed(2) + '%';

    // Изчисляване на базовите стойности със защити против разделяне на 0
    const customers = avgOrder > 0 ? Math.ceil(revenue / avgOrder) : 0;
    const leads = leadRate > 0 ? Math.ceil((customers * 100) / leadRate) : 0;
    const prospects = prospectRate > 0 ? Math.ceil((leads * 100) / prospectRate) : 0;

    currentCalculations = { prospects, leads, customers };

    // Извеждане на главните големи цифри на екрана
    customersValue.innerText = customers;
    leadsValue.innerText = prospects > 0 ? leads : 0; // Спира появата на NaN в големите цифри
    prospectsValue.innerText = prospects;

    // Спиране на NaN при изчисляване на процентното съотношение на KPI картите
    const leadPercentage = prospects > 0 ? (leads / prospects) * 100 : 0;
    const custPercentage = prospects > 0 ? (customers / prospects) * 100 : 0;

    leadPercLabel.innerText = leadPercentage.toFixed(2) + '%';
    custPercLabel.innerText = custPercentage.toFixed(2) + '%';

    if (leadProgress) leadProgress.style.width = `${Math.min(leadPercentage, 100)}%`;
    if (custProgress) custProgress.style.width = `${Math.min(custPercentage, 100)}%`;

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

// Логика за бутона Reset
document.getElementById('resetBtn').addEventListener('click', () => {
    totalRevenueInput.value = 0;
    avgOrderValueInput.value = 0;
    leadResponseRateSlider.value = 0;
    prospectResponseRateSlider.value = 0;
    initializeDates();
    updateCurrency();
    calculateMetrics();
});

// Bind live listeners across the control schema
totalRevenueInput.addEventListener('input', calculateMetrics);
avgOrderValueInput.addEventListener('input', calculateMetrics);
leadResponseRateSlider.addEventListener('input', calculateMetrics);
prospectResponseRateSlider.addEventListener('input', calculateMetrics);
languageSelect.addEventListener('change', updateLanguage);
currencySelect.addEventListener('change', updateCurrency);

// Инициализация при стартиране
initializeDates();
calculateMetrics();
